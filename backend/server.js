require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Nạp các Routes đã được chia nhỏ theo module
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const ordersRoutes = require('./routes/orders.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware cơ bản
app.use(cors());
app.use(express.json());

// Gắn các nhóm API Routes vào ứng dụng
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Tương thích ngược cho /api/login và /api/register của frontend cũ
app.use('/api', productsRoutes);
app.use('/api', ordersRoutes);
app.use('/api', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🚀 GT Sport Backend API đang hoạt động ổn định!' });
});

// Xử lý Route không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint API không tồn tại!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Lỗi hệ thống:', err.stack);
  res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ nội bộ!' });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 GT Sport Server Backend đang chạy tại http://localhost:${PORT}`);
  console.log(`🛡️  Bảo mật: bcryptjs & JWT Authentication kích hoạt`);
  console.log(`======================================================\n`);
});
