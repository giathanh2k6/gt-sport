const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. GET /api/categories - Lấy danh mục sản phẩm (Public)
 */
router.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * 2. GET /api/products - Lấy danh sách sản phẩm kèm Biến thể Size (Public)
 */
router.get('/products', (req, res) => {
  const query = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `;

  db.all(query, [], (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT * FROM product_variants', [], (err, variants) => {
      if (err) return res.status(500).json({ error: err.message });

      const productsWithVariants = products.map((product) => {
        const productVariants = variants.filter((v) => v.product_id === product.id);
        const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0);
        return {
          ...product,
          variants: productVariants,
          total_stock: totalStock
        };
      });

      res.json(productsWithVariants);
    });
  });
});

/**
 * 3. GET /api/products/:id - Lấy chi tiết một sản phẩm theo ID (Public)
 */
router.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;

  db.get(sql, [id], (err, product) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm!' });

    db.all('SELECT * FROM product_variants WHERE product_id = ?', [id], (err, variants) => {
      if (err) return res.status(500).json({ error: err.message });
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      res.json({
        ...product,
        variants,
        total_stock: totalStock
      });
    });
  });
});

/**
 * 4. POST /api/products - Thêm sản phẩm mới (Yêu cầu quyền Admin)
 */
router.post('/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, sku, category_id, price, image_url, description, variants } = req.body;

  if (!name || !sku || !price) {
    return res.status(400).json({ error: 'Vui lòng điền Tên, SKU và Giá sản phẩm!' });
  }

  const sql = `INSERT INTO products (name, sku, category_id, price, image_url, description) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, sku, category_id, price, image_url, description], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Mã SKU này đã tồn tại trong kho!' });
      }
      return res.status(500).json({ error: err.message });
    }

    const productId = this.lastID;
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const stmt = db.prepare('INSERT INTO product_variants (product_id, size, stock) VALUES (?, ?, ?)');
      variants.forEach((v) => stmt.run(productId, v.size, v.stock));
      stmt.finalize();
    }

    res.status(201).json({ message: 'Tạo sản phẩm thành công!', id: productId });
  });
});

/**
 * 5. PUT /api/products/:id - Cập nhật sản phẩm & Biến thể Size (Yêu cầu quyền Admin)
 */
router.put('/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, sku, category_id, price, image_url, description, variants } = req.body;

  const sql = `UPDATE products SET name = ?, sku = ?, category_id = ?, price = ?, image_url = ?, description = ? WHERE id = ?`;
  db.run(sql, [name, sku, category_id, price, image_url, description, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (variants && Array.isArray(variants)) {
      db.run('DELETE FROM product_variants WHERE product_id = ?', [id], () => {
        const stmt = db.prepare('INSERT INTO product_variants (product_id, size, stock) VALUES (?, ?, ?)');
        variants.forEach((v) => stmt.run(id, v.size, v.stock));
        stmt.finalize();
      });
    }

    res.json({ message: 'Cập nhật sản phẩm thành công!' });
  });
});

/**
 * 6. DELETE /api/products/:id - Xóa sản phẩm (Yêu cầu quyền Admin)
 */
router.delete('/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run('DELETE FROM product_variants WHERE product_id = ?', [id]);
    res.json({ message: 'Đã xóa sản phẩm thành công!' });
  });
});

module.exports = router;
