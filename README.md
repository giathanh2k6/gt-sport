# ⚽ GT Sport - Football Store & Inventory Management

Hệ thống quản lý bán hàng và kiểm soát tồn kho chuyên biệt cho giày & trang phục bóng đá.

![GT Sport Banner](frontend/public/logoGTSport.png)

## 📌 Bối Cảnh & Động Lực (Why I Built This)

Là một người thường xuyên đá bóng sân cỏ nhân tạo, tôi nhận thấy các shop đồ thể thao vừa và nhỏ thường gặp 2 vấn đề lớn:

1. **Lệch Size & Hết hàng ảo:** Một mẫu giày có nhiều size (39, 40, 41, 42), khách đặt trên web nhưng khi vào kho thì size đó đã hết từ trước, dẫn đến trải nghiệm khách hàng rất tệ.
2. **Quản lý thủ công:** Chủ shop thường chốt đơn qua tin nhắn và ghi sổ, dễ nhầm lẫn số lượng tồn của từng size.

👉 **GT Sport** được tôi phát triển để giải quyết bài toán này: Cho phép khách chọn đúng size khả dụng và **tự động trừ tồn kho theo thời gian thực (Real-time stock deduction)** ngay khi chốt đơn.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend:** Node.js, Express.js.
- **Database:** SQLite3 (CSDL quan hệ, nhẹ, tối ưu cho cửa hàng quy mô vừa).
- **Kiến trúc:** RESTful API, Client-Server tách biệt.

---

## 🧠 Quyết Định Thiết Kế Kỹ Thuật (Key Engineering Decisions)

### 1. Chuẩn Hóa Cơ Sở Dữ Liệu Cho Biến Thể Size (1-N Relationship)

Thay vì lưu mảng size thô trong bảng `products`, tôi tách riêng bảng `product_variants`:

- `products`: Lưu thông tin chung (Tên, SKU, Giá, Ảnh, Danh mục).
- `product_variants`: Liên kết bằng `product_id`, lưu riêng `size` và `stock`.
- _Lợi ích:_ Đảm bảo chuẩn hóa 3NF, cho phép truy vấn chính xác số lượng từng size mà không phải parse chuỗi, dễ dàng mở rộng thêm màu sắc sau này.

### 2. Xử Lý Trừ Kho Khi Đặt Hàng (Atomic Order Transaction)

Khi khách gửi yêu cầu đặt hàng qua endpoint `POST /api/orders`:

- Hệ thống ghi nhận đơn vào bảng `orders` và chi tiết vào `order_items`.
- Sử dụng Prepared Statement để trừ trực tiếp `stock = stock - ?` trong `product_variants`.
- Nếu số lượng tồn không đủ, giao dịch sẽ được chặn lại để tránh bán khống (Overselling).

### 3. Cảnh Báo Tồn Kho Tự Động (Smart Stock Alert)

- Phía Admin tự động lọc các mã size có tồn kho `<= 2 sản phẩm` và ghim lên bảng điều khiển với viền cam/đỏ để quản lý kịp thời nhập thêm hàng.

---

## 📸 Giao Diện Trực Quan (Screenshots)

|   Giao Diện Khách Hàng (Storefront)   |         Bảng Điều Khiển Quản Lý (Admin Portal)          |
| :-----------------------------------: | :-----------------------------------------------------: |
| _(Dán ảnh chụp màn hình trang khách)_ | _(Dán ảnh chụp màn hình trang admin có avatar của bạn)_ |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử (Quick Start)

### 1. Khởi động Backend

```bash
cd backend
npm install
node server.js
```
