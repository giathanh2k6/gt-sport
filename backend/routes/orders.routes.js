const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. GET /api/orders - Lấy danh sách tất cả đơn hàng (Chỉ Admin)
 */
router.get('/orders', authenticateToken, requireAdmin, (req, res) => {
  const query = `SELECT * FROM orders ORDER BY created_at DESC`;
  db.all(query, [], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
});

/**
 * 2. GET /api/orders/user/:userId - Lấy lịch sử đơn hàng của 1 Khách Hàng
 */
router.get('/orders/user/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;

  // Chỉ cho phép khách hàng xem đơn của chính mình, trừ phi là Admin
  if (req.user.role !== 'admin' && String(req.user.id) !== String(userId)) {
    return res.status(403).json({ error: 'Bạn không có quyền xem đơn hàng của người khác!' });
  }

  const query = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
  db.all(query, [userId], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
});

/**
 * 3. POST /api/orders - Tạo đơn hàng & Tự động trừ tồn kho (Chống âm kho - Atomic Transaction)
 */
router.post('/orders', optionalAuth, (req, res) => {
  const { user_id, customer_name, customer_phone, customer_address, items } = req.body;

  if (!customer_name || !customer_phone || !customer_address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Thông tin người nhận và giỏ hàng không được để trống!' });
  }

  // 1. Tính tổng giá trị đơn hàng
  let totalPrice = 0;
  for (const item of items) {
    if (!item.product_id || !item.size || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ error: 'Thông tin sản phẩm trong giỏ hàng không hợp lệ!' });
    }
    totalPrice += item.price * item.quantity;
  }

  const finalUserId = req.user ? req.user.id : (user_id || null);

  // 2. KIỂM TRA TỒN KHO TRƯỚC KHI TRỪ (CHỐNG BÁN KHỐNG / OVERSOLD)
  let checkCount = 0;
  let stockErrors = [];

  items.forEach((item) => {
    const checkSql = `
      SELECT p.name, pv.stock, pv.size 
      FROM product_variants pv 
      JOIN products p ON pv.product_id = p.id 
      WHERE pv.product_id = ? AND pv.size = ?
    `;
    db.get(checkSql, [item.product_id, item.size], (errCheck, variant) => {
      checkCount++;

      if (errCheck) {
        stockErrors.push(`Lỗi kiểm tra kho: ${errCheck.message}`);
      } else if (!variant) {
        stockErrors.push(`Sản phẩm (ID: ${item.product_id}, Size: ${item.size}) không tồn tại trong kho!`);
      } else if (variant.stock < item.quantity) {
        stockErrors.push(
          `Mẫu "${variant.name}" (Size ${item.size}) chỉ còn ${variant.stock} sản phẩm (bạn đặt ${item.quantity}). Rất tiếc sản phẩm vừa hết hàng!`
        );
      }

      // Khi đã kiểm tra đủ tất cả mặt hàng trong giỏ
      if (checkCount === items.length) {
        if (stockErrors.length > 0) {
          return res.status(400).json({ error: stockErrors.join(' | ') });
        }

        // 3. TẤT CẢ ĐỀU ĐỦ HÀNG -> BẮT ĐẦU TRANSACTION TRỪ KHO VÀ LƯU ĐƠN
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          const sqlOrder = `
            INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_price, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
          `;

          db.run(sqlOrder, [finalUserId, customer_name, customer_phone, customer_address, totalPrice], function (errOrder) {
            if (errOrder) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Lỗi tạo đơn hàng: ' + errOrder.message });
            }

            const orderId = this.lastID;
            const stmtItem = db.prepare('INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)');
            const stmtDeduct = db.prepare('UPDATE product_variants SET stock = stock - ? WHERE product_id = ? AND size = ? AND stock >= ?');

            try {
              items.forEach((item) => {
                stmtItem.run(orderId, item.product_id, item.size, item.quantity, item.price);
                stmtDeduct.run(item.quantity, item.product_id, item.size, item.quantity);
              });

              stmtItem.finalize();
              stmtDeduct.finalize();

              db.run('COMMIT', (errCommit) => {
                if (errCommit) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Lỗi xác nhận trừ kho: ' + errCommit.message });
                }
                res.status(201).json({
                  message: 'Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận và giữ chỗ trong kho.',
                  order_id: orderId
                });
              });
            } catch (deductError) {
              db.run('ROLLBACK');
              res.status(500).json({ error: 'Lỗi xử lý kho: ' + deductError.message });
            }
          });
        });
      }
    });
  });
});

/**
 * 4. PUT /api/orders/:id/status - Cập nhật trạng thái đơn (Chỉ Admin)
 */
router.put('/orders/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ!' });
  }

  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Đã cập nhật trạng thái đơn hàng thành công!' });
  });
});

module.exports = router;
