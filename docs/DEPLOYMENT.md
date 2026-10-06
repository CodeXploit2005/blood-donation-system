# Chuẩn bị deploy

## Frontend trên Vercel

Import repository GitHub và chọn nhánh `main`.

- Root Directory: `client`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL=https://<backend-host>/api`

`client/vercel.json` hỗ trợ mở trực tiếp các route React như `/login`, `/events` và `/staff/registrations`.

Vercel chỉ build frontend với cấu hình này. Cần chạy backend Express trên một dịch vụ Node riêng. Proxy trong `vite.config.js` chỉ dùng khi phát triển local. Sau khi đổi `VITE_API_URL`, redeploy frontend để Vite đưa URL mới vào bundle.

## Backend Node

- Root Directory: `server`
- Install: `npm ci`
- Build: `npm run build`
- Start: `npm start`
- Node: phiên bản LTS tương thích với các dependencies.
- Cấu hình `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`, `ALLOW_MEMORY_DB=false` qua dashboard của hosting.
- Production không tự tạo tài khoản/dữ liệu demo. Chỉ bật `SEED_DEMO_DATA=true` khi chủ động cần dữ liệu chạy thử và cấu hình tài khoản seed riêng.
- Khôi phục mật khẩu cần các biến EmailJS/SMTP tương ứng trong `server/.env.example` và tài liệu `server/PASSWORD_RECOVERY.md`.

Không tải `.env` hoặc database local lên GitHub. Atlas cần cho phép kết nối từ backend hosting. Khi cấu hình `CLIENT_URL`, dùng URL frontend Vercel.

Trước khi triển khai thực tế, cần rà lại tài khoản demo/seed tự động, JWT secret dự phòng, CORS và các phần nghiệp vụ còn thiếu. Bản hiện tại phục vụ đồ án và chạy thử, chưa phải bản đã nghiệm thu cho sử dụng y tế thực tế.

## Kiểm tra sau deploy

1. Backend `/api/health` trả JSON.
2. Frontend tải được danh sách đợt hiến qua backend HTTPS.
3. Đăng nhập từng vai trò và kiểm tra route được phép.
4. Refresh một route như `/events` không bị lỗi 404.
5. Quét QR qua HTTPS và kiểm tra số liệu báo cáo.

Nếu secrets từng được commit trong lịch sử Git, xóa `.env` ở commit mới không xóa bản cũ. Cần thay secrets đã lộ trên dịch vụ tương ứng; không sửa lịch sử hoặc force-push nếu chưa thống nhất với nhóm.
