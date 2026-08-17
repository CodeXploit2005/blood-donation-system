# Nhịp Sống — Hệ Thống Đăng Ký & Quản Lý Hiến Máu Nhân Đạo

> **Ý tưởng chủ đạo: "Nhịp Sống"** — Mỗi lượt hiến máu là một nhịp tim tiếp thêm sự sống. Nền tảng số hóa toàn diện quy trình đăng ký, sàng lọc sức khỏe y tế trực tuyến, cấp thẻ QR Code kỹ thuật số, điểm danh tại hiện trường bằng camera, bảng điều khiển thống kê trực quan và xuất báo cáo y tế.

---

## 1. Công Nghệ Sử Dụng

### Frontend (Client)
- **Framework**: React 18 + Vite + Pure JavaScript (`.jsx`).
- **Styling**: Tailwind CSS với theme tùy biến theo bảng màu nhân diện thương hiệu "Nhịp Sống".
- **Typography**: `Fraunces` (Serif nhân văn cho Heading), `Inter` (Sans-serif cho UI/Body), `IBM Plex Mono` (Tabular-nums cho số liệu).
- **Animation**: `framer-motion` (Page transitions, Heartbeat ECG path drawing hero, bottom-border pulse hover, multi-step slide, glass breathing QR card, laser scanning viewfinder, counter count-up).
- **State & Data Fetching**: TanStack React Query v5 + React Context API (`AuthContext`).
- **Form & Validation**: `react-hook-form` + `@hookform/resolvers` + `zod`.
- **Charts**: `recharts` (BarChart, AreaChart, PieChart phân bố nhóm máu).
- **QR Code**: `qrcode.react` (Hiển thị thẻ QR SVG) + `html5-qrcode` (Quét QR trực tiếp qua Camera / Tải ảnh).

### Backend (Server)
- **Runtime**: Node.js + Express + TypeScript (`strict: true`, build với `tsconfig.json`, chạy dev với `tsx`).
- **Database**: MongoDB + Mongoose với Type definitions chuẩn mực (`IUser`, `IBloodDonationEvent`, `IRegistration`, generic `Model<T>`).
- **Database Fallback**: Tự động fallback sang `mongodb-memory-server` nếu MongoDB local chưa bật, kèm sẵn dữ liệu mẫu (Seed data).
- **Authentication**: JWT (JSON Web Tokens) + `bcryptjs` mã hóa mật khẩu.
- **Validation**: Zod schema validation middleware.
- **QR Service**: Ký và mã hóa payload QR an toàn bằng thuật toán băm HMAC-SHA256.
- **Export & Report**: Báo cáo thống kê thời gian thực và xuất file CSV UTF-8 có BOM (tương thích 100% tiếng Việt trong Microsoft Excel).

---

## 2. Hệ Thống Thiết Kế "Nhịp Sống" (Design System)

### Bảng màu (Design Tokens)
- `--color-crimson`: `#C4384A` — Đỏ trầm ấm, tượng trưng dòng máu và sự sống (không dùng đỏ chói).
- `--color-crimson-deep`: `#7A1F2B` — Đỏ mận đậm cho hover, active states.
- `--color-ink`: `#1E2226` — Đen than sang trọng cho text chính và dark sections.
- `--color-porcelain`: `#F7F3EF` — Nền sáng ấm dịu mắt (không trắng tinh).
- `--color-sage`: `#6E8B7A` — Xanh lá xám đại diện cho sức khỏe, hồi phục và trạng thái "Đã điểm danh".
- `--color-sand`: `#E8DFD3` — Màu cát trung tính làm viền thẻ và đường phân cách.

---

## 3. Tài Khoản Trải Nghiệm Mẫu (1-Click Login)

Hệ thống có sẵn nút đăng nhập nhanh 1-chạm tại trang Login:

| Vai trò | Email | Mật khẩu | Mô tả quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** (Ban Tổ Chức) | `admin@blooddonation.vn` | `Admin@123456` | Toàn quyền quản trị: Tạo đợt hiến máu, xem danh sách đăng ký, quét camera điểm danh QR, xem biểu đồ thống kê, xuất báo cáo CSV |
| **User** (Người Hiến) | `user@blooddonation.vn` | `User@123456` | Đăng ký đợt hiến máu, điền phiếu sàng lọc 3 bước, nhận thẻ QR kỹ thuật số, tra cứu lịch sử |

---

## 4. Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu môi trường
- **Node.js**: Phiên bản 18+ hoặc 20+
- **npm**: Phiên bản 9+

### Bước 1: Cài đặt Dependencies
```bash
# Cài đặt toàn bộ dependencies cho cả Server và Client
npm run install:all
```
*(Hoặc vào từng thư mục `cd server && npm install`, `cd ../client && npm install`)*

### Bước 2: Cấu hình biến môi trường
Tệp `server/.env` đã được cấu hình sẵn:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/blood_donation_db
JWT_SECRET=blood_donation_super_secret_jwt_key_2026_heartbeat_life
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*Lưu ý: Nếu máy tính chưa cài đặt hoặc chưa bật MongoDB daemon, Server sẽ **tự động kích hoạt In-Memory MongoDB** và nạp sẵn dữ liệu mẫu để bạn trải nghiệm ngay lập tức.*

### Bước 3: Khởi động Dự án

**Cách 1: Chạy song song cả hai phía:**
Mở 2 cửa sổ terminal:

Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server lắng nghe tại: http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Client giao diện mở tại: http://localhost:5173
```

---

## 5. Cấu Trúc Thư Mục Dự Án

```
blood-donation-system/
├── package.json                   # Root package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Button, Modal, Toast, Loading/Skeleton, Pagination, Navbar, Footer, PulseDivider, EmptyState
│   │   │   ├── event/             # EventCard (pulse hover), EventForm, EventTable
│   │   │   ├── registration/      # ScreeningForm (3-step), RegistrationStatus, BloodDonationCriteriaModal
│   │   │   └── checkin/           # QRCodeDisplay (Glass breathing card), QRScanner (Camera/Upload), CheckinTable
│   │   ├── layouts/               # MainLayout, AdminLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── auth/              # Login.jsx, Register.jsx
│   │   │   ├── user/              # Home.jsx, Events.jsx, EventDetail.jsx, RegisterDonation.jsx, MyRegistrations.jsx, MyQRCode.jsx
│   │   │   └── admin/             # Dashboard.jsx, EventsManagement.jsx, EventCreate.jsx, EventEdit.jsx, RegistrationsManagement.jsx, Checkin.jsx, Reports.jsx
│   │   ├── services/              # api.js, authService.js, eventService.js, registrationService.js, checkinService.js, reportService.js
│   │   ├── context/               # AuthContext.jsx
│   │   ├── hooks/                 # useAuth.js, useFetch.js, useToast.js
│   │   ├── utils/                 # constants.js, formatDate.js, validators.js
│   │   ├── App.jsx / main.jsx / index.css
│   └── vite.config.js / tailwind.config.js
├── server/
│   ├── src/
│   │   ├── config/                # db.ts (Mongo + Memory fallback), seed.ts
│   │   ├── models/                # User.ts, BloodDonationEvent.ts, Registration.ts
│   │   ├── controllers/           # authController.ts, eventController.ts, registrationController.ts, checkinController.ts, reportController.ts
│   │   ├── routes/                # authRoutes.ts, eventRoutes.ts, registrationRoutes.ts, checkinRoutes.ts, reportRoutes.ts
│   │   ├── middleware/            # authMiddleware.ts, adminMiddleware.ts, errorMiddleware.ts, validateMiddleware.ts
│   │   ├── services/              # qrService.ts, screeningService.ts, reportService.ts
│   │   ├── utils/                 # generateToken.ts, response.ts
│   │   ├── app.ts / server.ts
│   └── tsconfig.json
└── README.md
```

---

## 6. Danh Sách API Endpoints

### Xác Thực (Auth)
- `POST /api/auth/register` — Đăng ký tài khoản người hiến máu
- `POST /api/auth/login` — Đăng nhập và nhận JWT token
- `GET /api/auth/me` — Lấy thông tin tài khoản hiện tại
- `PUT /api/auth/profile` — Cập nhật hồ sơ cá nhân

### Đợt Hiến Máu (Events)
- `GET /api/events` — Danh sách đợt hiến máu (phân trang, lọc theo status, tìm kiếm)
- `GET /api/events/:id` — Chi tiết đợt hiến máu và tiến độ tiếp nhận
- `POST /api/events` — Tạo đợt hiến máu mới (*Admin*)
- `PUT /api/events/:id` — Cập nhật đợt hiến máu (*Admin*)
- `DELETE /api/events/:id` — Xóa đợt hiến máu (*Admin*)

### Đăng Ký & Sàng Lọc (Registrations)
- `POST /api/registrations` — Đăng ký tham gia, tự động sàng lọc y tế và sinh mã QR
- `GET /api/registrations/my` — Lịch sử các đợt hiến máu đã đăng ký của tôi
- `GET /api/registrations/:id` — Chi tiết đơn đăng ký
- `GET /api/registrations/event/:eventId` — Danh sách đăng ký theo sự kiện (*Admin*)
- `PUT /api/registrations/:id` — Cập nhật trạng thái đăng ký (*Admin*)
- `DELETE /api/registrations/:id` — Hủy đăng ký hiến máu

### Điểm Danh Bằng Mã QR (Check-in)
- `POST /api/checkin` — Quét mã QR, xác thực chữ ký và điểm danh tiếp nhận máu (*Admin*)
- `GET /api/checkin/event/:eventId` — Danh sách người vừa điểm danh thời gian thực (*Admin*)
- `POST /api/checkin/undo/:registrationId` — Hoàn tác điểm danh nếu quét nhầm (*Admin*)

### Báo Cáo & Thống Kê (Reports)
- `GET /api/reports/dashboard` — Tổng hợp KPI, biểu đồ Recharts phân bố nhóm máu và tiến độ (*Admin*)
- `GET /api/reports/event/:eventId` — Báo cáo chi tiết sự kiện (*Admin*)
- `GET /api/reports/event/:eventId/export` — Tải file CSV báo cáo (UTF-8 BOM tương thích Excel) (*Admin*)

---

## 7. Giấy Phép & Bản Quyền
Dự án được xây dựng với mục tiêu cộng đồng vì sức khỏe nhân dân.
© 2026 Nhịp Sống — Nền Tảng Hiến Máu Tình Nguyện Quốc Gia.
