# Khôi phục mật khẩu bằng OTP

Nhập email → gửi OTP 6 số → xác thực OTP → đặt mật khẩu mới → đăng nhập lại.

Cấu hình EmailJS trong server/.env (private key chỉ ở backend):

EMAIL_PROVIDER=emailjs
EMAILJS_SERVICE_ID=service_g6g4w5b
EMAILJS_TEMPLATE_ID=template_vaexi4f
EMAILJS_PUBLIC_KEY=your-public-key
EMAILJS_PRIVATE_KEY=your-private-key

Trong EmailJS: To Email = {{email}} hoặc {{to_email}}. Mẫu One-Time Password hiển thị {{passcode}}; backend gửi OTP 6 chữ số, {{time}} = 10 phút. Các alias {{otp}} và {{code}} cũng được gửi. Không gửi liên kết hay mật khẩu qua email.

OTP tạo bằng crypto.randomInt, có thể bắt đầu bằng số 0. MongoDB chỉ lưu HMAC của email và OTP, không lưu mã rõ. Mã có hạn 10 phút, dùng một lần, tối đa 5 lần thử. Giới hạn gửi lại 60 giây và rate-limit API. Gửi lại thành công thay mã cũ; gửi thất bại thu hồi mã mới. Phản hồi gửi OTP không tiết lộ tài khoản tồn tại. Đổi mật khẩu thu hồi phiên cũ qua authVersion.

Các liên kết khôi phục cũ còn hạn vẫn dùng được qua endpoint reset-password. Luồng mới: POST /api/auth/forgot-password { email }; POST /api/auth/verify-reset-otp { email, otp } trả ticket ngẫu nhiên có hạn 5 phút và tiêu thụ OTP; POST /api/auth/reset-password { token, password } chỉ chấp nhận ticket đã xác thực, dùng một lần. Form mật khẩu chỉ hiện sau khi API xác thực thành công.

SMTP vẫn được hỗ trợ khi không chọn EMAIL_PROVIDER=emailjs, qua SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM.

Ngày 04/10/2026 đã kiểm tra API đang chạy gửi OTP thật tới Gmail chủ dự án: EmailJS Gmail_API result=1, passcode có đúng 6 số và không có reset_url. Xác nhận nhà cung cấp đã gửi; không xác nhận thư vào Inbox hoặc người nhận đã đọc.

Tài liệu: https://www.emailjs.com/docs/rest-api/send/
