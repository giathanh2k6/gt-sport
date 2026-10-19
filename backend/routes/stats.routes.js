const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/stats - Thống kê Doanh Thu & Cảnh Báo Tồn Kho (Chỉ Admin)
 */
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  db.get('SELECT COUNT(*) AS total_products FROM products', (err, rowProducts) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get('SELECT SUM(total_price) AS total_revenue, COUNT(*) AS total_orders FROM orders WHERE status = "completed"', (err, rowOrders) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all('SELECT p.name, pv.size, pv.stock FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.stock <= 2', (err, rowLowStock) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          total_products: rowProducts ? rowProducts.total_products : 0,
          total_revenue: (rowOrders && rowOrders.total_revenue) || 0,
          total_orders: (rowOrders && rowOrders.total_orders) || 0,
          low_stock_alerts: rowLowStock || []
        });
      });
    });
  });
});

module.exports = router;
