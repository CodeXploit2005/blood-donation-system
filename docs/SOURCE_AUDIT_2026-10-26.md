# Rà soát source Nhịp Sống — 26/10/2026

## Kết luận

Luồng cơ bản đã có và các kiểm thử hiện hữu chạy qua, nhưng chưa nên kết luận toàn bộ hệ thống hoàn chỉnh. Có lỗi ở tình huống hủy/đăng ký lại, nhiều yêu cầu đồng thời, chuyển trạng thái kết quả và quản lý phiên người dùng.

Đợt rà soát này đọc source frontend/backend, chạy typecheck/build và kiểm thử controller với MongoDB tạm. Không sửa dữ liệu thật, không chạy seed trên database đang dùng. Chưa kiểm thử toàn bộ giao diện bằng trình duyệt, camera trên điện thoại, email thật hoặc môi trường deploy. Không phải đánh giá tiêu chuẩn y tế.

## Những phần đã có

- React/Vite/TypeScript; chia pages, components, services, context, hooks và utils.
- Express/Mongoose/TypeScript; chia routes, middleware, controllers, models và services.
- Đăng ký/đăng nhập, khôi phục mật khẩu OTP, phân quyền user/staff/admin.
- Quản lý đợt, kiểm tra hết hạn, danh sách và lịch sử đăng ký, QR, xác nhận có mặt.
- Ghi nhận/chỉnh ml và nhóm máu, xem kết quả ở user, tổng hợp theo đợt và dashboard, xuất CSV/Excel.
- Backend chính chạy từ `server/src/server.ts`; build chỉ lấy `server/src`, xuất `server/dist`.
- Cập nhật liên thiết bị chủ yếu bằng polling 10–15 giây, chưa phải push tức thời.

## Lỗi đã tái hiện trên database tạm

### 1. P1 — Vượt chỉ tiêu khi đăng ký đồng thời

`server/src/controllers/registrationController.ts:118`: đếm đăng ký và tạo bản ghi là hai thao tác riêng. Hai yêu cầu cùng thấy còn chỗ rồi cùng tạo được.

Kết quả thử: đợt giới hạn 1 người, gửi đồng thời 2 yêu cầu từ hai user → cả hai trả 201, database có 2 đơn.

Cần: giữ chỗ bằng cập nhật có điều kiện, xử lý rollback khi tạo đơn thất bại, hoặc transaction phù hợp với cấu hình MongoDB. Thêm kiểm thử đồng thời.

### 2. P1 — Có thể xác nhận hiến máu từ đơn không đủ điều kiện

`server/src/controllers/registrationController.ts:341`: chỉ chặn đơn đã hủy, chưa kiểm tra chuỗi trạng thái tiếp nhận/khám trước khi ghi donated. Khi gửi donated không kèm screeningResult, dòng 360 tự đổi kết luận sang eligible.

Kết quả thử: đơn screened_ineligible với kết luận ineligible → ghi 350 ml qua luồng admin → trả 200 và đổi kết luận sang eligible.

Cần: thống nhất luồng registered → có mặt → khám/đánh giá → đủ điều kiện → hoàn tất hiến. Không tự ghi đè kết luận trước đó khi lưu ml; trường hợp điều chỉnh kết luận cần thao tác riêng và lý do. Cần giữ rõ khác biệt sàng lọc sơ bộ và kết luận tại điểm tiếp nhận.

### 3. P2 — Hủy rồi không đăng ký lại được cùng đợt

`server/src/controllers/registrationController.ts:106` bỏ qua đơn cancelled khi kiểm tra trùng, nhưng `server/src/models/Registration.ts:202` có unique index userId + eventId cho mọi trạng thái.

Kết quả thử: tạo đơn → hủy → đăng ký lại → trả 500 E11000.

Cần: lựa chọn rõ khôi phục đơn đã hủy hoặc cho phép bản ghi lịch sử khác với chỉ mục phù hợp. Việc đổi index phải có migration; chỉ sửa schema chưa đủ cho database đã tồn tại.

### 4. P2 — Hủy nhiều lần làm bộ đếm âm

`server/src/controllers/registrationController.ts:408`: đơn cancelled vẫn được hủy tiếp và mỗi lần đều trừ currentParticipants.

Kết quả thử: đợt có một đơn, hủy hai lần đều trả 200; currentParticipants thành -1.

Cần: cập nhật trạng thái có điều kiện và chỉ giảm bộ đếm khi thực sự chuyển sang cancelled. Hủy lặp phải giữ nguyên số liệu. Danh sách đợt có đếm lại từ đơn nên có thể che lỗi của trường bộ đếm đã lưu.

## Vấn đề xác định từ source, cần kiểm thử bổ sung

### 5. P1 — Cache dữ liệu cá nhân chưa tách theo tài khoản

`client/src/context/AuthContext.tsx:73` đăng xuất chỉ xóa token/user, không xóa React Query cache. Query lịch sử và QR dùng khóa cố định ở MyRegistrations/MyQRCode, không kèm userId.

Khi đổi tài khoản trong cùng phiên trình duyệt, cache cũ có thể được hiển thị tạm trước khi request mới hoàn tất; nếu lỗi mạng có thể tồn tại lâu hơn. Đây là rủi ro phía giao diện, không phải kết luận API cho phép đọc đơn người khác.

Cần: hủy request, xóa cache khi đăng xuất/đổi tài khoản và đưa userId vào khóa dữ liệu cá nhân. Kiểm thử A → logout → B khi mạng chậm và khi mất mạng.

### 6. P2 — Luồng QR còn mặc định lượng máu và nguy cơ tăng trùng bộ đếm

`server/src/controllers/checkinController.ts:15` đặt actualVolumeMl mặc định 350. API hoàn tất hiến có thể dùng giá trị này nếu client không gửi lượng máu nhưng có gửi nhóm máu. UI hiện tại quét QR bằng action presence nên đường thông thường chỉ xác nhận có mặt.

Dòng 176–180 dùng save rồi tăng collectedBloodUnits riêng. Hai request hoàn tất cùng một đơn có thể cùng đọc trạng thái cũ và tăng hai lần. Cần cập nhật có điều kiện, kết quả lặp an toàn và không mặc định số đo thực tế. Kiểm tra lại thời gian có mặt vì đường hoàn tất QR còn ghi đè checkInTime.

### 7. P2 — Xóa tài khoản để lại tham chiếu thiếu

`server/src/controllers/userController.ts:84` xóa hẳn User, không xử lý Registration liên quan. Một số controller populate userId rồi đọc `_id` mà chưa xử lý null.

Cần: ưu tiên khóa/ngừng hoạt động tài khoản có lịch sử, giữ dữ liệu lịch sử phù hợp; xử lý null nhất quán. Kiểm thử xem đơn/QR sau khi xóa tài khoản bằng vai trò được phép.

### 8. P2 — Migration dữ liệu cũ tự suy ra kết quả hiến

`server/src/config/seed.ts:38` dùng 350 ml khi thiếu thể tích; dòng 45 có thể lấy nhóm máu khai báo hoặc O+ làm xác nhận. Hàm normalize chạy khi seed được bật; production mặc định không seed.

Cần: giữ trường chưa có dữ liệu là null/chưa ghi nhận, tách migration khỏi seed demo, ghi log số bản ghi thay đổi và có phương án khôi phục. Chưa kết luận dữ liệu thật hiện tại đã bị ảnh hưởng vì không truy cập database thật.

### 9. P2 — Lọc “Cần khám lại” không khớp dữ liệu

`client/src/pages/admin/RegistrationsManagement.tsx:176` gửi pending_review, trong khi model và screeningService lưu deferred. Lọc này có thể trả danh sách rỗng dù có đơn tạm hoãn.

Cần: thống nhất mã trạng thái ở frontend, API, model và báo cáo; dùng kiểu dùng chung hoặc kiểm thử hợp đồng API.

### 10. Cần siết trước triển khai công khai

- `server/src/app.ts:18`: CORS chấp nhận mọi origin; CLIENT_URL chưa được dùng để giới hạn. Đây không tự nó chứng minh vượt xác thực, nhưng cấu hình đang rộng hơn tài liệu triển khai.
- `server/src/routes/authRoutes.ts:15`: login chưa có rate limit; recovery đã có.
- Tìm kiếm đưa chuỗi người dùng trực tiếp vào RegExp; nên escape hoặc giới hạn cú pháp. Phân trang chưa giới hạn trên và chưa kiểm tra đầy đủ số hữu hạn/nguyên.
- Chưa thấy audit log cho ai sửa ml/nhóm máu, giá trị trước/sau và lý do. checkIn.checkedInBy chỉ ghi người điểm danh, không thay thế lịch sử sửa kết quả.
- Health endpoint chỉ trả trạng thái tiến trình, chưa xác minh database; cần readiness riêng nếu dùng để giám sát vận hành.
- Cần kế hoạch backup/restore và kiểm tra khôi phục; chưa xác minh cấu hình hosting hoặc Atlas thực tế.

## Cấu trúc source cần dọn

- Ngoài `server/src` còn có `server/controllers`, `server/models`, `server/routes`, `server/services`… Nhiều file là placeholder/chú thích, không thuộc build hiện tại. Dễ mở nhầm file khi sửa. Kiểm tra tham chiếu trước khi dọn; không cần đổi toàn bộ framework.
- README vẫn có tên file .jsx/.js trong cây thư mục trong khi source dùng .tsx/.ts. Một số báo cáo review cũ vẫn mô tả lỗi đã sửa.
- `docs/ROLES.md` còn ghi admin không nhập kết quả hiến, khác quyền đã bổ sung trong phiên làm việc này.
- Chưa có lệnh test tổng hợp trong package.json hoặc workflow CI trong source đã liệt kê. Script verify-donor-validation phụ thuộc thư mục chạy: chạy ở server lỗi đường dẫn, chạy từ root thì qua.
- Frontend build và typecheck là hai lệnh riêng; nên cho CI chạy cả hai. Cảnh báo bundle lớn vẫn có; ưu tiên lazy-load trang/biểu đồ khi cần tối ưu.
- Bộ kiểm thử hiện có hữu ích nhưng chưa bao phủ đầy đủ HTTP middleware + database, cạnh tranh ghi dữ liệu và giao diện/camera thực tế.

## Chức năng có thể bổ sung sau khi sửa lỗi

Các mục sau là đề xuất theo luồng hiện tại, không phải yêu cầu bắt buộc đã được thống nhất:

1. Màn hồ sơ cá nhân và đổi mật khẩu khi đang đăng nhập; API cập nhật hồ sơ đã có nhưng chưa thấy trang tương ứng.
2. Nhật ký sửa kết quả hiến máu, người sửa, thời điểm, giá trị trước/sau, lý do.
3. Đối chiếu lần hiến trước từ lịch sử đã xác nhận trong hệ thống; hiện sàng lọc dựa vào lastDonationDate người dùng khai báo. Quy tắc nghiệp vụ cần được đơn vị tổ chức xác nhận.
4. Chọn ngày cụ thể khi đăng ký một đợt kéo dài nhiều ngày; hiện chủ yếu lưu khung giờ dạng chuỗi.
5. Thông báo xác nhận, nhắc lịch, đổi/hủy đợt và thông báo khi kết quả được ghi nhận.
6. Chứng nhận hiến máu/tải kết quả nếu thuộc phạm vi đồ án; luồng cấp chứng nhận riêng chưa thấy triển khai.

Không cần tự mở rộng sang kho máu, xét nghiệm, cấp phát máu hoặc quản lý bệnh viện nếu mục tiêu chỉ là đăng ký và quản lý đợt hiến máu.

## Kiểm tra đã chạy

- `npm --prefix client run typecheck`: PASS.
- `npm run build:server`: PASS. Frontend build gần nhất trong phiên trước đã PASS; đợt audit không thay production UI.
- `verify-permissions.ts`: PASS.
- `verify-donor-validation.ts` chạy từ repository root: PASS; chạy từ server lỗi đường dẫn như ghi trên.
- `check-donation-sync.ts`: PASS — nhập/sửa lượng máu và nhóm máu đồng bộ user, QR API, báo cáo/CSV, dashboard, tổng theo đợt; hoàn tác làm sạch kết quả.
- `check-event-results.ts`: PASS — thời hạn, đóng đợt thủ công đã hết hạn, chặn đăng ký và tổng kết quả thực tế.
- `audit-workflows.ts`: tái hiện bốn lỗi mục 1–4 trên database tạm. Script in quan sát hiện tại, không phải test khẳng định hệ thống đúng.

## Thứ tự làm tiếp đề nghị

1. Ràng buộc chuyển trạng thái ghi nhận kết quả và tách cache theo người dùng.
2. Sửa đăng ký lại/hủy lặp, giữ chỗ an toàn, chống ghi kết quả trùng; thêm kiểm thử cạnh tranh.
3. Audit log, xử lý xóa tài khoản và migration không tự suy ra số đo.
4. Sửa bộ lọc, kiểm tra đầu vào, dọn source/tài liệu, gom bộ kiểm thử vào CI.
5. Kiểm thử trình duyệt/điện thoại và triển khai; sau đó mới bổ sung chức năng phụ theo phạm vi mong muốn.
