const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. POST /api/auth/register - Đăng ký tài khoản mới (Mã hóa mật khẩu bằng bcrypt)
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, phone } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu và Họ tên!' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có tối thiểu 6 ký tự!' });
    }

    // 1. Kiểm tra tài khoản đã tồn tại chưa
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existingUser) => {
      if (err) return res.status(500).json({ error: err.message });
      if (existingUser) {
        return res.status(400).json({ error: 'Tên đăng nhập này đã được sử dụng!' });
      }

      // 2. Băm mật khẩu (Hash) an toàn với bcrypt (10 vòng muối - salt rounds)
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Lưu vào Database
      const sql = 'INSERT INTO users (username, password, name, phone, role) VALUES (?, ?, ?, ?, "customer")';
      db.run(sql, [username, hashedPassword, name, phone || ''], function (insertErr) {
        if (insertErr) return res.status(500).json({ error: insertErr.message });

        const newUserId = this.lastID;

        // 4. Cấp luôn JWT Token để người dùng đăng nhập ngay sau khi đăng ký
        const token = jwt.sign(
          { id: newUserId, username, role: 'customer', name },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: 'Đăng ký tài khoản thành công!',
          token,
          user: { id: newUserId, username, name, phone, role: 'customer' }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký: ' + error.message });
  }
});

/**
 * 2. POST /api/auth/login - Đăng nhập an toàn & Cấp JWT Token
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu!' });
  }

  // 1. Tìm người dùng theo tên đăng nhập
  const sql = 'SELECT id, username, password, name, phone, role FROM users WHERE username = ?';
  db.get(sql, [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
    }

    // 2. Kiểm tra mật khẩu (Hỗ trợ cả mật khẩu bcrypt và tự động nâng cấp nếu là mật khẩu cũ)
    let isMatch = false;
    const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Mật khẩu cũ trước khi nâng cấp (plain text)
      isMatch = (password === user.password);
      // Tự động nâng cấp mật khẩu cũ lên bcrypt trong database (Lazy Migration)
      if (isMatch) {
        const upgradedHash = await bcrypt.hash(password, 10);
        db.run('UPDATE users SET password = ? WHERE id = ?', [upgradedHash, user.id]);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
    }

    // 3. Tạo vé thông hành (JWT Token) có thời hạn 7 ngày
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  });
});

/**
 * 3. GET /api/auth/me - Lấy thông tin tài khoản hiện tại từ Token
 */
router.get('/me', authenticateToken, (req, res) => {
  const sql = 'SELECT id, username, name, phone, role FROM users WHERE id = ?';
  db.get(sql, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng!' });
    res.json(user);
  });
});

module.exports = router;
