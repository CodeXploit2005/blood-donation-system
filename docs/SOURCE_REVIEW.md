# Kiểm tra hệ thống hiến máu — 04/10/2026

Hệ thống có đủ luồng chính để làm báo cáo đồ án/demo: đăng nhập và phân quyền, quản lý sự kiện, đăng ký và sàng lọc sơ bộ, cấp QR, tra cứu bằng camera/ảnh/mã, đối chiếu hồ sơ, điểm danh, quản lý trạng thái, thống kê và xuất XLSX. Chưa thể kết luận sẵn sàng vận hành y tế thực tế.

## Kết quả đối chiếu dữ liệu

MongoDB `blood-donation-system`: 6 sự kiện, 14 lượt đăng ký chưa hủy, 3 người có mặt, 2 lượt đã hiến, 800 ml đã ghi nhận. Dashboard và báo cáo từng sự kiện được so với hồ sơ gốc. XLSX của cả 6 sự kiện được tạo bằng đúng hàm xuất của giao diện rồi mở lại để kiểm tra số dòng, kiểu chuỗi số điện thoại, tổng thể tích và số đăng ký.

Đã sửa bộ đếm `currentParticipants` và `collectedBloodUnits` sai ở 3 sự kiện. Giá trị trước/sau nằm trong `data-audit.json`; không thay hồ sơ người hiến, kết luận sàng lọc, mật khẩu hay token QR.

Không có đăng ký mất sự kiện hoặc trùng mã QR. Hai lượt đã hiến có thể tích và nhóm máu xác nhận. Có **4 đăng ký có userId không tồn tại trong users**: giữ thông tin đăng ký để bảo toàn lịch sử, cần quản trị viên xác minh nguồn gốc tài khoản; chưa tự tạo tài khoản hoặc chuyển chủ sở hữu.

## Vì sao mã BD-2026-E6C1A6 bị báo không đủ điều kiện

Hồ sơ thật đang là `screened_ineligible`, `checkIn.status=pending`, `donationVolume=null`, kết luận `ineligible`. Sàng lọc đã lưu lý do người đăng ký khai bệnh mãn tính và dùng thuốc. Quét lại không tạo kết luận mới. Bảng cũ kiểm tra chuỗi `pending` như một boolean nên hiển thị nhầm “Đã hiến 350ml”. Đã sửa bảng và bổ sung lý do sàng lọc vào hồ sơ quét. Kết luận sơ bộ cần được phân biệt với khám trực tiếp; không tự chuyển hồ sơ sang đủ điều kiện.

## Quy ước thống kê sau sửa

- Đăng ký: lượt đăng ký chưa hủy, không phải số người duy nhất toàn hệ thống.
- Có mặt: checkIn.status=checked_in hoặc trạng thái checked_in/donated. Đủ điều kiện sơ bộ không đồng nghĩa có mặt.
- Đủ điều kiện tại bước tiếp nhận: kết luận eligible và đã có mặt, hoặc đã hiến. Không coi người mới điền tờ khai online là đã khám tại quầy.
- Hiến thành công: donationStatus=donated.
- Thể tích: chỉ cộng thể tích ghi nhận của lượt đã hiến; không mặc định 350 ml khi thiếu dữ liệu.
- Báo cáo và Excel loại lượt đã hủy; thông tin chưa có được hiển thị rõ, không giả định kết quả sức khỏe.

## Những phần nên trình bày thành hạn chế trong báo cáo

1. Chưa tách riêng kết quả sàng lọc tự khai và kết luận khám của bác sĩ thành hai đối tượng dữ liệu. Không nên gọi sàng lọc tự động là chẩn đoán y tế.
2. Cần nhật ký thay đổi trạng thái/kết quả khám/thể tích, người thao tác, thời điểm và giá trị trước/sau. Hiện chưa có lịch sử đủ để kiểm toán.
3. Kiểm tra sức chứa khi nhiều người đăng ký đồng thời và ghi nhận hiến máu nhiều thiết bị cần transaction hoặc cập nhật nguyên tử. Chưa kiểm thử tải đồng thời và mọi chuyển trạng thái.
4. Cần chính sách lưu giữ dữ liệu, sao lưu/khôi phục và xác minh 4 đăng ký mất tài khoản. Database tạm hiện chỉ được bật bằng ALLOW_MEMORY_DB=true; mặc định lỗi kết nối sẽ không âm thầm chuyển sang dữ liệu tạm.
5. Quên mật khẩu cần cấu hình SMTP thực và kiểm thử gửi thư. Chưa xác nhận gửi email ngoài môi trường thử.
6. CORS hiện cho mọi nguồn; JWT có secret dự phòng và seed có thông tin đăng nhập demo. Trước triển khai thật cần cấu hình môi trường, bỏ tài khoản mặc định, giới hạn nguồn, rà soát thư viện và giới hạn thử đăng nhập.
7. Chưa xác nhận camera trên nhiều thiết bị, toàn bộ quy trình UI trong trình duyệt, phục hồi sau mất mạng, hay kiểm thử tự động toàn hệ thống.

## Chạy lại kiểm tra

Từ thư mục gốc, build backend rồi chạy `node server/scripts/audit-report-data.cjs`. Thêm `--repair` chỉ khi muốn sửa các bộ đếm sự kiện suy ra từ hồ sơ. Script mặc định không sửa bộ đếm hoặc hồ sơ; bước đọc dashboard có đồng bộ trạng thái tự động của sự kiện theo ngày. Kiểm tra XLSX thực hiện trong bộ nhớ để không lưu thêm bản sao dữ liệu cá nhân.

Kết luận: đủ phạm vi chức năng để báo cáo đồ án với các kiểm tra đã nêu, nhưng phải trình bày đúng giới hạn; không tuyên bố hệ thống đã đạt chuẩn vận hành cơ sở y tế.
