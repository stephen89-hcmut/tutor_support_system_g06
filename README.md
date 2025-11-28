# Tutor Support System (G06)

Ứng dụng web hỗ trợ điều phối gia sư – sinh viên của HCMUT. Toàn bộ dữ liệu hiện đang được mock trong front-end nhằm giúp nhóm có thể demo chức năng nhanh chóng mà không phụ thuộc backend thật.

---

## 1. Cấu hình & cách khởi động dự án

| Hạng mục | Giá trị |
| --- | --- |
| Runtime đề xuất | **Node.js 18.x** (Vite 5 yêu cầu >=18.0.0) |
| Trình quản lý gói | npm (có thể dùng pnpm/yarn nếu quen thuộc) |
| Cổng dev server | `http://localhost:5173` (mặc định của Vite) |

### Các bước chạy dự án

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy môi trường phát triển
npm run dev
# → mở http://localhost:5173

# 3. Build production (nếu cần)
npm run build

# 4. Xem trước bản build
npm run preview
```

---

## 2. Công nghệ & thư viện chính

| Nhóm | Công nghệ |
| --- | --- |
| Core | React 18 + TypeScript + Vite 5 |
| Styling | TailwindCSS, clsx, tailwind-merge |
| UI Components | Radix UI primitives (`@radix-ui/react-*`), `lucide-react` (icons), shadcn/ui patterns |
| Date & Form | `date-fns`, `react-day-picker` |
| State tiện ích | Context API, custom hooks (`useAsyncData`, `useToast`, …) |

Các thư viện quan trọng khác được mô tả chi tiết trong `package.json`.

---

## 3. Cấu trúc & dữ liệu mock

| Thư mục | Mục đích |
| --- | --- |
| `src/data/` | Chứa toàn bộ mock data (users, students, tutors, progress, meetings, …) |
| `src/infrastructure/mockApi/` | Layer repository giả lập gọi API (có latency mô phỏng) |
| `src/application/services/` | Chứa business logic (ví dụ `tutorSuggestionService`, `meetingService`, …) |
| `src/screens/` & `src/components/` | UI chính của từng màn hình |

### Nguyên tắc mock data

- **Người dùng:** `src/data/mockUsers.ts` tạo tổng cộng 600 tài khoản (525 student, 70 tutor, 5 manager) với mật khẩu mặc định theo role (`student123`, `tutor123`, `manager123`). Một số user “featured” được khai báo cứng để dễ đăng nhập test.
- **Tutor Profiles:** `src/data/mockTutors.ts` tái sử dụng danh sách tutor accounts và bổ sung thông tin hiển thị (rating, kỹ năng, lịch trống, …).
- **Progress & Session:** `src/data/mockProgress.ts` tạo tiến độ của ~525 sinh viên với phân hạng Good / Average / Weak để feed cho AI suggestion.
- **Các repository mock** (ví dụ `mockUserRepository`) đọc dữ liệu trực tiếp từ các file trên và mô phỏng độ trễ mạng thông qua `simulateNetworkLatency`.

---

## 4. Tài khoản demo để đăng nhập

Bảng dưới đây liệt kê **10 tài khoản** dùng được ngay (5 Student, 3 Tutor, 1 Manager, 1 Manager dự phòng). Tất cả đã tồn tại trong `mockUsers.ts` và đăng nhập được ở màn hình Login.

| # | Role | Username | Mật khẩu | Mô tả nhanh |
| --- | --- | --- | --- | --- |
| 1 | Student | `sv.nguyenvana` | `student123` | Năm 3 – Software Engineering |
| 2 | Student | `sv.tranthib` | `student123` | Năm 2 – Computer Science |
| 3 | Student | `sv.levanc` | `student123` | Năm 4 – Information Systems |
| 4 | Student | `sv.phamthid` | `student123` | Năm 4 – Data Science |
| 5 | Student | `sv.hoangvane` | `student123` | Năm 3 – Computer Engineering |
| 6 | Tutor | `tutor.nguyenvana` | `tutor123` | Chuyên Data Structures / Algorithms |
| 7 | Tutor | `tutor.tranthib` | `tutor123` | Chuyên Database / Web / SE |
| 8 | Tutor | `tutor.levanc` | `tutor123` | Chuyên ML / AI / Data Science |
| 9 | Manager | `manager.admin` | `manager123` | Quản lý khoa Computer Science |
| 10 | Manager (backup) | `manager.mentor` | `manager123` | Quản lý khoa Software Engineering |

> **Lưu ý:** Khi đăng nhập thành công, thông tin role được lưu trong `localStorage`/`sessionStorage`. Đăng xuất tại nút “Sign Out” trong sidebar để chuyển role khác.

---

## 5. Hướng dẫn nhanh khi test

1. **Đăng nhập** bằng một trong các tài khoản ở bảng trên. Sidebar sẽ tự động thay đổi theo role.
2. **Sinh viên** có thể:
   - Xem dashboard cá nhân, lịch meeting, tài liệu.
   - Dùng tính năng **Find Tutor** và **Use AI Suggestion** để nhận 5 tutor phù hợp (dựa trên progress yếu).
3. **Gia sư** quản lý học viên, buổi dạy, ghi nhận tiến độ.
4. **Manager** giám sát toàn bộ hệ thống: meetings, người dùng, phân quyền, analytics.
5. **Thông báo (NotificationSystem)** được mô phỏng và hiển thị bằng toast (màu xanh thành công, đỏ thất bại) để dễ quan sát.

---

## 6. Scripts & tiêu chuẩn code

- `npm run lint`: kiểm tra eslint (TypeScript + React Hooks rules).
- Styling theo chuẩn Tailwind + component-based (ưu tiên tái sử dụng).
- Khi cần mock API mới, tạo file trong `src/infrastructure/mockApi/repositories/` và kết nối qua service layer.

---

## 7. Liên hệ / đóng góp

- Vui lòng tạo Pull Request hoặc Issue nếu phát hiện lỗi.
- Đính kèm mô tả rõ ràng (ảnh, bước tái hiện) để nhóm support xử lý nhanh nhất.

-- nguyen than tung
