# Ba luồng của Nhịp Sống

| Vai trò | Luồng | Quyền |
| --- | --- | --- |
| Người hiến máu (`user`) | Trang công khai, đăng ký, lịch sử, QR cá nhân | Quản lý đăng ký của bản thân |
| Nhân viên tiếp nhận / y tế (`staff`) | `/staff/registrations`, `/staff/checkin` | Xem và xử lý đăng ký, xác thực QR, điểm danh, hoàn tác điểm danh |
| Quản trị viên (`admin`) | `/admin/dashboard` | Tạo/sửa/xóa đợt hiến, báo cáo, quản lý tài khoản, phân quyền, xem đăng ký, hủy đơn và xác nhận có mặt. Không nhập kết quả y tế |

Tài khoản tự đăng ký luôn là người hiến máu. Chỉ quản trị viên có thể cấp quyền nhân viên hoặc quản trị viên trong Quản lý tài khoản. API đọc vai trò hiện tại trong cơ sở dữ liệu cho từng yêu cầu. Nhân viên không có quyền quản lý đợt hiến, báo cáo tổng hợp hoặc tài khoản.

Đây là mô hình phù hợp với hệ thống tổ chức hiến máu và tiếp nhận hiện tại, không phải chuẩn bắt buộc. Hệ thống quản lý kho máu/cấp máu thường tách thêm vai trò bệnh viện và ngân hàng máu. Tham khảo: https://github.com/Thet-Htar/Life-Link---Blood-Donation-Management-System và https://github.com/Puneethnitc/Blood-Donation-Management-System.

## Khởi động

- `npm run dev`: chạy backend với MongoDB trong `server/.env`, chờ API sẵn sàng rồi mở Vite. Cổng proxy tự theo `PORT`.
- `npm run dev:local`: dùng MongoDB phát triển riêng, lưu dữ liệu bền vững trong `server/.data/mongodb`. Không thay đổi MongoDB Atlas đã cấu hình. Lần đầu có thể cần tải binary MongoDB.
- Nếu npm trên máy bị hỏng đường dẫn, chạy `node scripts/dev.cjs --local` trực tiếp.

MongoDB Atlas cần URI hợp lệ và mạng/IP được phép truy cập. Khi backend không khởi động, Vite không thể phục vụ `/api` và báo `ECONNREFUSED`. Chạy frontend riêng cũng cần backend đang hoạt động. `API_PROXY_TARGET` cho phép chỉ định backend khi chạy Vite riêng.

## Quyền theo ma trận ngày 06/10/2026

- Chỉ user được gửi đăng ký hiến và dùng /my-registrations, /my-qr. Admin/staff không dùng luồng người hiến.
- User hủy đơn của mình; admin hủy đơn trong hệ thống, trước khi tiếp nhận. Staff không hủy đơn.
- Admin/staff được tra cứu QR và xác nhận có mặt. Kết quả khám, ghi chú y tế, nhóm máu xác nhận và hoàn tất hiến chỉ dành cho staff.
- Admin không hoàn tác lượt đã hiến.
- Các ô cảnh báo trong ma trận được hiểu là quyền xem thông tin phục vụ nghiệp vụ hiện có, không mặc nhiên cho sửa y tế hay xuất file.
- Xuất CSV/Excel và báo cáo tổng hợp chỉ admin. Chưa có dashboard riêng của donor/staff, thống kê tuổi hoặc module khám đầy đủ. Quyền API đã tách nhưng không có nghĩa những màn hình này đã hoàn thành.
