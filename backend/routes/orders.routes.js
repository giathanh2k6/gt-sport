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
 * 3. POST /api/orders - Tạo đơn hàng & Tự động trừ tồn kho Size
 */
router.post('/orders', optionalAuth, (req, res) => {
  const { user_id, customer_name, customer_phone, customer_address, items } = req.body;

  if (!customer_name || !customer_phone || !items || items.length === 0) {
    return res.status(400).json({ error: 'Thông tin đơn hàng không hợp lệ!' });
  }

  let totalPrice = 0;
  items.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  const finalUserId = req.user ? req.user.id : (user_id || null);

  const saveOrderItemsAndDeductStock = (orderId) => {
    const stmtItem = db.prepare('INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)');
    const stmtDeductStock = db.prepare('UPDATE product_variants SET stock = stock - ? WHERE product_id = ? AND size = ?');

    items.forEach((item) => {
      stmtItem.run(orderId, item.product_id, item.size, item.quantity, item.price);
      stmtDeductStock.run(item.quantity, item.product_id, item.size);
    });

    stmtItem.finalize();
    stmtDeductStock.finalize();

    res.status(201).json({ message: 'Đặt hàng thành công!', order_id: orderId });
  };

  const sqlOrder = `INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_price, status) VALUES (?, ?, ?, ?, ?, 'pending')`;

  db.run(sqlOrder, [finalUserId, customer_name, customer_phone, customer_address, totalPrice], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi tạo đơn hàng: ' + err.message });
    }
    saveOrderItemsAndDeductStock(this.lastID);
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
