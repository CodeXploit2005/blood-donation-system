# Đánh giá source hệ thống hiến máu — 04/10/2026

Đã đọc các route, middleware, model, controller, service backend và các trang/luồng tương ứng trên frontend. Backend vượt qua `tsc --noEmit`. Đây là đánh giá source, chưa phải kiểm thử toàn bộ giao diện hoặc kiểm định tiêu chuẩn y tế.

## Tài khoản yêu cầu

Đã cập nhật đúng tài khoản theo cả ObjectId và email người dùng cung cấp: quyền `admin`; mật khẩu được băm bằng bcrypt và kiểm tra khớp sau khi cập nhật. Giữ nguyên email đăng nhập và các thông tin cá nhân. Không tạo tài khoản trùng hoặc chạy seed để thay đổi dữ liệu sự kiện.

## Chức năng đã có

- Đăng ký, đăng nhập, JWT, đọc/cập nhật hồ sơ qua API; phân quyền user/admin ở backend và frontend.
- Danh sách/chi tiết/tìm kiếm/phân trang sự kiện; admin tạo, sửa, xóa, điều chỉnh trạng thái; cập nhật trạng thái tự động theo thời gian.
- Đăng ký hiến máu, khai báo sức khỏe, đánh giá sơ bộ, tạo QR, xem đăng ký cá nhân, hủy đăng ký.
- Admin quản lý đăng ký, cập nhật kết quả/trạng thái, quét QR, hoàn tác tiếp nhận.
- Dashboard, báo cáo sự kiện, phân bố nhóm máu/thể tích, xuất CSV.
- Quản lý tài khoản, cấp/gỡ quyền, ngăn tự xóa hoặc tự gỡ quyền admin.

## Các lỗi cần ưu tiên

### 1. P1 — Điểm danh tự chuyển thành đã hiến và tự điền kết quả

`server/src/controllers/checkinController.ts:100–128`: quét QR ghi luôn `donationStatus = 'donated'`, thể tích, nhóm máu, kết luận đủ điều kiện. Khi thiếu dữ liệu, code tự dùng O+, 120/80, Hb 13.5. Không chặn đơn cancelled/screened_ineligible và không yêu cầu kết luận khám thực tế trước khi tiếp nhận.

Hậu quả: người mới có mặt hoặc không đủ điều kiện có thể được tính thành đã hiến; báo cáo ghi nhận nhóm máu và thông số chưa được đo/xác nhận. Cần tách điểm danh → khám tại chỗ → xác nhận đủ điều kiện → hoàn thành hiến, bắt buộc nhập kết quả thực tế. Hoàn tác cần giữ lịch sử thay đổi.

### 2. P1 — Trường trạng thái cũ làm sai thống kê và điều kiện xóa sự kiện

`server/src/controllers/eventController.ts:70,111,112,254`: vẫn dùng `registrationStatus` và `checkIn.status: true`; model hiện dùng `donationStatus` và chuỗi `checked_in`.

Hậu quả: đơn hủy vẫn có thể bị tính là người tham gia; số điểm danh sai; điều kiện bảo vệ xóa sự kiện có thể không nhận ra người đã điểm danh, rồi xóa cả đăng ký liên quan (`:273`). Cần dùng đúng trường và bảo vệ cả dữ liệu đã hiến.

### 3. P1 — Có hàm ký QR nhưng luồng quét không xác minh chữ ký

`server/src/services/qrService.ts` có `verifyQRToken`, nhưng `checkinController.ts:38–69` chỉ tra theo regId/code và không đối chiếu tok. JSON chứa regId của đơn khác có thể được chấp nhận dù code/tok không khớp. Endpoint vẫn yêu cầu admin, nên đây không phải quyền điểm danh công khai.

Cần xác minh chữ ký, đối chiếu regId/code/sự kiện. Nếu hỗ trợ nhập mã thủ công, tách rõ luồng đó và ghi người thao tác.

### 4. P1 — Cập nhật trạng thái đăng ký không kiểm tra dữ liệu và chuyển bước

`server/src/routes/registrationRoutes.ts` không gắn schema cho PUT; `registrationController.ts:314` cập nhật trực tiếp, không bật `runValidators`, không kiểm tra trạng thái trước/sau, không đồng bộ bộ đếm.

Cần schema cho trạng thái, nhóm máu, thể tích; quy định chuyển bước hợp lệ; chỉ hoàn thành hiến khi đủ dữ liệu và đã được khám/xác nhận.

### 5. P2 — Hủy lặp làm giảm bộ đếm nhiều lần; hủy rồi đăng ký lại bị unique index chặn

`registrationController.ts:364–369` không xử lý đơn đã cancelled như một thao tác không thay đổi. Gọi hủy lần nữa vẫn trừ currentParticipants.

`Registration.ts:202` unique userId/eventId trong khi controller cho tạo mới nếu đơn cũ đã hủy. Nếu index đã tồn tại, đăng ký lại sẽ lỗi duplicate key. Nên khôi phục/cập nhật đơn cũ hoặc thiết kế index theo bản ghi đang hoạt động.

### 6. P2 — Kiểm tra chỗ trống và ghi đơn tách rời

`registrationController.ts:105–133`: count rồi create rồi tăng bộ đếm; nhiều yêu cầu đồng thời có thể cùng vượt kiểm tra và vượt sức chứa. Check-in/undo cũng đọc rồi ghi và cập nhật bộ đếm riêng, dễ ghi nhận lặp hoặc lệch khi lỗi giữa các bước.

Cần cập nhật có điều kiện nguyên tử và transaction phù hợp với cấu hình MongoDB; kiểm thử các yêu cầu đồng thời.

### 7. P2 — Nút xuất CSV thiếu Bearer token

`client/src/pages/admin/Reports.tsx:48` dùng window.location.href; route export (`server/src/routes/reportRoutes.ts:16`) yêu cầu authMiddleware. Frontend lưu JWT trong localStorage, nên điều hướng trực tiếp không thêm Authorization.

Cần tải qua API client có Bearer token, nhận blob và tạo link tải. CSV cũng cần escape đồng nhất các ô dữ liệu và xử lý giá trị có thể bị Excel hiểu thành công thức.

### 8. P2 — Sàng lọc chưa đối chiếu tuổi/lịch sử thực tế; lịch đăng ký chưa độc lập

`createRegistrationSchema` cho dateOfBirth tùy chọn; `screeningService` không nhận ngày sinh để kiểm tra tuổi. Ngày hiến trước là dữ liệu người dùng khai báo, không tra lần hiến đã ghi nhận; khoảng cách được tính so với hôm đăng ký, chưa so với ngày dự kiến hiến.

`eventStatusService.ts:18` chỉ mở khi đã tới startDate. Nếu startDate là ngày tổ chức, người dân không thể đăng ký trước ngày đó ở chế độ auto. Cần tách thời gian mở/đóng đăng ký khỏi thời gian tổ chức, kiểm tra khung giờ hợp lệ và sức chứa từng khung.

Các quy tắc y tế cần được đơn vị chuyên môn xác nhận trước khi vận hành thực tế; nội dung này chỉ mô tả khoảng trống của luồng phần mềm.

### 9. P1 khi vận hành — Seed đặt lại mật khẩu admin mỗi lần khởi động

`server/src/server.ts:17` luôn chạy seed; `server/src/config/seed.ts:84–88` luôn gán lại email/password/role của admin. Hiện mật khẩu trùng yêu cầu người dùng, nhưng sau này đổi mật khẩu sẽ bị ghi đè khi restart. Nên tách thao tác đặt lại mật khẩu thành lệnh chạy một lần, seed chỉ tạo tài khoản khi thiếu.

### 10. Cấu hình vận hành và bảo vệ tài khoản còn thiếu

- `server/src/config/db.ts`: kết nối MongoDB thất bại tự chuyển database trong bộ nhớ; nếu xảy ra lúc triển khai, dữ liệu không bền vững và người vận hành dễ nhầm database. Chỉ cho fallback trong chế độ demo có chủ đích.
- `server/src/app.ts`: CORS cho tất cả origin; chưa thấy giới hạn số lần đăng nhập/rate limiting.
- JWT có secret dự phòng hardcode. Cần bắt buộc cấu hình secret khi triển khai.
- Chưa thấy route đổi mật khẩu/quên mật khẩu, xác minh email, khóa tài khoản hoặc thu hồi phiên.
- Chưa thấy test nghiệp vụ trong source dự án (không tính test của thư viện).

## Chức năng nên bổ sung theo mục tiêu

Đối với đồ án đăng ký và quản lý đợt hiến máu: ưu tiên sửa lỗi trên, sau đó thêm trang hồ sơ/đổi mật khẩu, lịch sử hiến và ngày có thể đăng ký tiếp, thông báo xác nhận/nhắc lịch/thay đổi sự kiện, ghi lý do từ chối và nhật ký thao tác admin, đánh dấu không đến sau khi kết thúc.

Đối với vận hành thực tế: thêm vai trò bác sĩ/nhân viên tiếp nhận/quản trị; phân quyền dữ liệu sức khỏe; đồng ý xử lý dữ liệu; quy trình lưu trữ/sao lưu/khôi phục; kiểm thử phân quyền và chuyển trạng thái. Quản lý mã túi máu, xét nghiệm, hạn dùng, kho và bàn giao chỉ cần nếu phạm vi dự án mở rộng thành quản lý ngân hàng máu.

## Kết luận

Khung chức năng đủ làm nền tảng cho đồ án và demo. Luồng tiếp nhận, tính toàn vẹn dữ liệu và cấu hình tài khoản/database cần sửa trước khi dùng thật. Đợt đánh giá này chỉ cập nhật tài khoản được yêu cầu; chưa tự sửa các lỗi nghiệp vụ liệt kê.
