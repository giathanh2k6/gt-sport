# ⚽ GT Sport - Football Store & Inventory Management System

> **Hệ thống thương mại điện tử và quản lý tồn kho chuyên biệt cho Giày Đá Bóng (TF/FG/IC) & Áo Đấu CLB/ĐTQG.**  
> Dự án cá nhân được xây dựng bài bản theo chuẩn công nghiệp với kiến trúc Client-Server tách biệt, bảo mật xác thực phân quyền JWT và chuẩn hóa dữ liệu biến thể sản phẩm.

![GT Sport Banner](frontend/public/logoGTSport.png)

---

## 📌 Bối Cảnh & Động Lực (Why I Built This)

Là một người đam mê bóng đá và thường xuyên thi đấu sân cỏ nhân tạo, tôi nhận thấy các cửa hàng đồ thể thao vừa và nhỏ tại Việt Nam thường gặp 2 vấn đề nhức nhối:

1. **Lệch Size & Hết hàng ảo:** Một mẫu giày có nhiều size khác nhau (39, 40, 41, 42, 43). Khách đặt mua trên web nhưng khi vào kho thì size đó đã hết từ trước, dẫn đến trải nghiệm khách hàng rất tệ và tốn công hủy đơn.
2. **Quản lý thủ công, thiếu bảo mật:** Chủ shop chốt đơn qua tin nhắn, dễ nhầm lẫn số lượng tồn của từng size; hệ thống quản trị không có cơ chế phân quyền bảo vệ dữ liệu doanh thu.

👉 **GT Sport** được phát triển để giải quyết triệt để bài toán này:
* Cho phép khách hàng chọn đúng kích thước (size) còn khả dụng trong kho.
* **Tự động trừ tồn kho theo thời gian thực (Real-time stock deduction)** ngay khi chốt đơn.
* Phân quyền bảo mật đa tầng: Khách hàng mua sắm và Quản trị viên (Admin) quản lý kho độc lập.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend (Giao diện người dùng)
* **Core:** React 18, Vite.
* **Styling:** Tailwind CSS (Định hình phong cách thể thao hiện đại High-Tech Sport).
* **Icons:** Lucide React.
* **Networking:** Axios.

### Backend (Máy chủ & Dữ liệu)
* **Runtime:** Node.js, Express.js.
* **Kiến trúc:** RESTful API, Modular Architecture (tách riêng Routes, Middleware, Controllers).
* **Database:** SQLite3 (CSDL quan hệ, tối ưu, nhẹ và tin cậy).
* **Bảo mật (Security):** 
  * `bcryptjs`: Mã hóa mật khẩu một chiều (10 salt rounds).
  * `jsonwebtoken (JWT)`: Cơ chế cấp Token xác thực phân quyền Stateless Authentication.
  * `dotenv`: Quản lý biến môi trường bảo mật.

---

## 🧠 Quyết Định Thiết Kế Kỹ Thuật (Key Engineering Decisions)

### 1. Chuẩn Hóa Cơ Sở Dữ Liệu Biến Thể Size (1-N Relationship - 3NF)
Thay vì lưu mảng size thô trong bảng `products` (dễ lỗi parse chuỗi và khó truy vấn), hệ thống tách riêng bảng `product_variants`:
* `products`: Lưu thông tin chung (Tên, SKU, Thương hiệu, Giá niêm yết, Hình ảnh, Mô tả).
* `product_variants`: Liên kết bằng khóa ngoại `product_id`, lưu riêng `size` và `stock`.
* *Lợi ích:* Đảm bảo chuẩn hóa 3NF, cho phép kiểm tra tồn kho của từng size với độ phức tạp $O(1)$, dễ dàng mở rộng thêm màu sắc và loại đinh giày.

### 2. Xác Thực Phân Quyền Đa Tầng (JWT & Role-Based Middleware)
* Hệ thống phân tách rõ 2 vai trò: `customer` (Khách hàng) và `admin` (Quản trị viên).
* Các endpoint nhạy cảm (Thêm/Sửa/Xóa sản phẩm, duyệt đơn, xem báo cáo doanh thu) được bảo vệ bởi middleware `authenticateToken` và `requireAdmin`.
* **Kỹ thuật Lazy Migration:** Hệ thống tự động nâng cấp mật khẩu cũ dạng chuỗi thô sang chuỗi băm `bcrypt` ngay trong lần đăng nhập đầu tiên mà không làm gián đoạn tài khoản của người dùng.

### 3. Cảnh Báo Tồn Kho Thông Minh (Smart Stock Alert)
* Phía Admin tự động lọc các mã size có số lượng tồn `<= 2 sản phẩm` và ghim cảnh báo đỏ/cam lên bảng điều khiển để chủ shop kịp thời lên kế hoạch nhập thêm hàng.

---

## 📡 Danh Mục API Chính (API Reference)

| Phương thức | Đường dẫn API | Quyền hạn | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới (Mã hóa mật khẩu bằng bcrypt) |
| `POST` | `/api/auth/login` | Public | Đăng nhập hệ thống & Nhận JWT Token (7 ngày) |
| `GET` | `/api/auth/me` | Authenticated | Lấy thông tin cá nhân từ Token |
| `GET` | `/api/products` | Public | Lấy danh sách sản phẩm kèm toàn bộ biến thể size & tồn kho |
| `GET` | `/api/products/:id` | Public | Xem chi tiết 1 sản phẩm |
| `POST` | `/api/products` | **Admin Only** | Thêm sản phẩm mới kèm các biến thể size vào kho |
| `PUT` | `/api/products/:id` | **Admin Only** | Cập nhật thông tin & tồn kho của sản phẩm |
| `DELETE` | `/api/products/:id` | **Admin Only** | Xóa sản phẩm khỏi hệ thống |
| `POST` | `/api/orders` | Public / Khách | Tạo đơn hàng mới & Tự động trừ tồn kho theo từng size |
| `GET` | `/api/orders` | **Admin Only** | Xem toàn bộ danh sách đơn hàng |
| `PUT` | `/api/orders/:id/status` | **Admin Only** | Cập nhật trạng thái đơn (pending $\rightarrow$ shipping $\rightarrow$ completed) |
| `GET` | `/api/stats` | **Admin Only** | Thống kê tổng doanh thu, số đơn và cảnh báo sắp hết hàng |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử (Quick Start)

### Yêu cầu môi trường
* Node.js (phiên bản 18 trở lên)
* Git

### 1. Khởi động Backend (Máy chủ API)

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện cần thiết
npm install

# 3. Tạo file cấu hình môi trường từ file mẫu
# Trên Windows PowerShell:
Copy-Item .env.example .env
# Hoặc trên Linux/macOS:
# cp .env.example .env

# 4. Khởi động server
node server.js
```
👉 Server Backend sẽ chạy tại: `http://localhost:5000`

---

### 2. Khởi động Frontend (Giao diện React)

Mở một cửa sổ Terminal mới:

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các gói giao diện
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```
👉 Website sẽ hoạt động tại: `http://localhost:5173`

---

## 🔑 Tài Khoản Thử Nghiệm Mẫu

Sau khi chạy backend, hệ thống đã nạp sẵn 2 tài khoản mẫu:

| Loại tài khoản | Tên đăng nhập (`username`) | Mật khẩu (`password`) | Quyền hạn |
| :--- | :---: | :---: | :---: |
| **Quản trị viên (Admin)** | `admin` | `123` | Quản lý kho, duyệt đơn, xem thống kê |
| **Khách hàng (Customer)** | `khach1` | `123` | Mua hàng, xem lịch sử đơn của mình |

---

## 📅 Lộ Trình Phát Triển (Development Roadmap)

- [x] **Ngày 1:** Chuẩn hóa kiến trúc Backend, tách module Clean Code, bảo mật xác thực phân quyền với bcrypt & JWT.
- [x] **Ngày 2:** Nâng cấp CSDL chuyên sâu cho Giày bóng đá (đinh TF/FG/IC, hãng Nike/Adidas/Mizuno/Puma) & Xử lý Transaction chống âm kho khi đặt hàng.
- [x] **Ngày 3:** Thiết lập Design System thể thao Đen Than - Đỏ Crimson (Pitch Black / Crimson) & Hệ thống định tuyến React Router chuyên nghiệp.
- [x] **Ngày 4:** Xây dựng bộ lọc đa tiêu chí chuẩn E-commerce thể thao (Lọc theo mặt sân TF/FG/IC, áo đấu, thương hiệu, size còn hàng, khoảng giá & sắp xếp). Tích hợp Bảng hướng dẫn đo size bàn chân và Modal xem nhanh chi tiết sản phẩm.
- [x] **Ngày 5:** Trang chi tiết sản phẩm chuyên sâu (PDP tại route `/product/:id`), bộ chọn size thông minh cảnh báo khan hiếm tồn kho, gợi ý sản phẩm tương tự & Hệ thống Toast Notifications mượt mà thay thế alert() cổ điển.
- [x] **Ngày 6:** Giỏ hàng trượt chuyên nghiệp (Slide-over Cart Drawer), thanh tiến trình Miễn phí vận chuyển, hệ thống Voucher giảm giá, thanh toán COD & chuyển khoản VietQR tự động, lưu trữ bền vững LocalStorage và hoạt ảnh động High-Tech Sport (Stadium Glow, Card Hover Glow, Button Shine).
- [x] **Bonus Signature:** Tích hợp Studio Thiết Kế Áo Đấu Trực Tuyến 3D (Interactive Kit Customizer 3D & 360° Rotation Viewer). Cho phép khách hàng tự do nhập tên số tùy thích (hoặc chọn nhanh cầu thủ Ronaldo, Messi, Bellingham, Quang Hải...), chọn Font thi đấu (UCL Cúp C1, Premier League, Classic), đổi màu viền in số, dán huy hiệu giải đấu (Badge Cúp C1 15 Stars, Premier League). Trải nghiệm xoay áo 360° bằng kéo rê chuột hoặc lật 180° mượt mà; tự động tính phụ phí in ấn, lưu vào giỏ hàng và đồng bộ dữ liệu tới Cổng Quản Trị Admin.

---

*Dự án được xây dựng và duy trì bởi **Nguyễn Gia Thành** (Sinh viên năm 3).*
