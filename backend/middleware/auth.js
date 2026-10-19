const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gt_sport_jwt_secret_key_2026_super_secure';

/**
 * Middleware xác thực JWT Token
 * Khách hoặc Admin gửi kèm header: Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Định dạng: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để thực hiện thao tác này!' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ!' });
    }
    req.user = user; // Gắn thông tin người dùng vào request (id, username, role)
    next();
  });
};

/**
 * Middleware kiểm tra quyền Quản Trị Viên (Admin)
 * Chỉ cho phép người dùng có role === 'admin' đi qua
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Quyền truy cập bị từ chối: Chỉ Quản Trị Viên mới có quyền!' });
  }
  next();
};

/**
 * Middleware xác thực tùy chọn (Optional Auth)
 * Nếu khách có gửi token thì gắn req.user, nếu không gửi thì vẫn cho đi qua (cho khách vãng lai)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  JWT_SECRET,
};
