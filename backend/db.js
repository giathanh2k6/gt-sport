const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'football_store.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Lỗi kết nối CSDL SQLite:', err.message);
  } else {
    console.log('✅ Đã kết nối SQLite Database: football_store.db');
  }
});

db.serialize(() => {
  // 1. Bảng Người Dùng (Users - Admin & Customer)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer' -- 'admin' hoặc 'customer'
    )
  `);

  // 2. Bảng Danh Mục
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    )
  `);

  // 3. Bảng Sản Phẩm
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category_id INTEGER,
      price INTEGER NOT NULL,
      image_url TEXT,
      description TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // 4. Bảng Biến Thể Tồn Kho (Size & Stock)
  db.run(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // 5. Bảng Đơn Hàng
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, shipping, completed, cancelled
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tự động thêm cột user_id vào bảng orders nếu CSDL cũ chưa có
  db.run(`ALTER TABLE orders ADD COLUMN user_id INTEGER`, (err) => {
    // Nếu cột đã tồn tại thì SQLite bỏ qua mà không gây lỗi
  });

  // 6. Bảng Chi Tiết Đơn Hàng
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Seed người dùng mẫu nếu chưa có
  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (row && row.count === 0) {
      console.log('🌱 Tạo tài khoản mẫu Admin & Customer...');
      const stmt = db.prepare("INSERT INTO users (username, password, name, phone, role) VALUES (?, ?, ?, ?, ?)");
      stmt.run("admin", "123", "Quản Trị Viên (Admin)", "0901234567", "admin");
      stmt.run("khach1", "123", "Nguyễn Văn An", "0987654321", "customer");
      stmt.finalize();
    }
  });

  // Seed Categories & Products nếu chưa có
  db.get("SELECT COUNT(*) AS count FROM categories", (err, row) => {
    if (row && row.count === 0) {
      console.log('🌱 Tạo dữ liệu mẫu sản phẩm...');
      const stmtCat = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
      stmtCat.run("Giày Sân Cỏ Nhân Tạo (TF)", "giay-tf");
      stmtCat.run("Giày Sân Cỏ Tự Nhiên (FG)", "giay-fg");
      stmtCat.run("Quần Áo Đội Tuyển & CLB", "quan-ao-clb");
      stmtCat.finalize();

      const seedProducts = [
        {
          name: "Nike Vapor 15 Pro TF",
          sku: "NK-VP15-TF",
          category_id: 1,
          price: 2150000,
          image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
          description: "Giày đá bóng sân cỏ nhân tạo cao cấp.",
          variants: [
            { size: "39", stock: 5 },
            { size: "40", stock: 8 },
            { size: "41", stock: 1 },
            { size: "42", stock: 0 }
          ]
        },
        {
          name: "Adidas Predator Elite TF",
          sku: "AD-PRED-EL",
          category_id: 1,
          price: 3200000,
          image_url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500",
          description: "Giày kiểm soát bóng gai StrikeSkin.",
          variants: [
            { size: "39", stock: 4 },
            { size: "40", stock: 6 },
            { size: "41", stock: 3 }
          ]
        },
        {
          name: "Áo Đấu Real Madrid 2024/25 Home",
          sku: "AD-RMA-24",
          category_id: 3,
          price: 350000,
          image_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
          description: "Áo sân nhà Real Madrid chất liệu thoáng khí.",
          variants: [
            { size: "S", stock: 12 },
            { size: "M", stock: 20 },
            { size: "L", stock: 15 },
            { size: "XL", stock: 8 }
          ]
        },
        {
          name: "Áo Đấu Arsenal 2024/25 Away",
          sku: "AD-ARS-24",
          category_id: 3,
          price: 350000,
          image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500",
          description: "Áo đấu Pháo thủ London mẫu sân khách.",
          variants: [
            { size: "S", stock: 8 },
            { size: "M", stock: 15 },
            { size: "L", stock: 10 }
          ]
        }
      ];

      const stmtP = db.prepare("INSERT INTO products (name, sku, category_id, price, image_url, description) VALUES (?, ?, ?, ?, ?, ?)");
      const stmtV = db.prepare("INSERT INTO product_variants (product_id, size, stock) VALUES (?, ?, ?)");

      seedProducts.forEach((p) => {
        stmtP.run(p.name, p.sku, p.category_id, p.price, p.image_url, p.description, function (err) {
          if (err) return;
          const pId = this.lastID;
          p.variants.forEach((v) => stmtV.run(pId, v.size, v.stock));
        });
      });

      db.run(`
        INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_price, status)
        VALUES (2, 'Nguyễn Văn An', '0987654321', '123 Đường Cầu Giấy, Hà Nội', 2500000, 'completed')
      `);

      console.log('✅ Đã nạp xong CSDL SQLite!');
    }
  });
});

module.exports = db;
