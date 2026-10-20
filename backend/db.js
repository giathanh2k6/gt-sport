const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

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

  // 2. Bảng Danh Mục (Categories)
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    )
  `);

  // 3. Bảng Sản Phẩm (Products) - Đã nâng cấp các trường chuyên biệt cho giày & áo đấu
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category_id INTEGER,
      brand TEXT DEFAULT 'Nike',                 -- Nike, Adidas, Puma, Mizuno, Jogarbola
      category_type TEXT DEFAULT 'shoes',        -- 'shoes' (giày) hoặc 'kit' (áo đấu)
      stud_type TEXT,                            -- 'TF' (cỏ nhân tạo), 'FG' (cỏ tự nhiên), 'IC' (futsal)
      tier TEXT,                                 -- 'Elite', 'Pro', 'Academy'
      season TEXT,                               -- '2024/25' (cho áo đấu)
      version_type TEXT,                         -- 'player' (bản cầu thủ) hoặc 'fan' (bản cổ động viên)
      price INTEGER NOT NULL,
      image_url TEXT,
      description TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Tự động thêm các cột mới nếu CSDL cũ chưa có (Schema Migration an toàn)
  const newColumns = [
    { name: 'brand', type: "TEXT DEFAULT 'Nike'" },
    { name: 'category_type', type: "TEXT DEFAULT 'shoes'" },
    { name: 'stud_type', type: 'TEXT' },
    { name: 'tier', type: 'TEXT' },
    { name: 'season', type: 'TEXT' },
    { name: 'version_type', type: 'TEXT' }
  ];

  newColumns.forEach((col) => {
    db.run(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`, () => {
      // Bỏ qua nếu cột đã tồn tại
    });
  });

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

  // 5. Bảng Đơn Hàng (Orders)
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, confirmed, shipping, completed, cancelled
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 6. Bảng Chi Tiết Đơn Hàng (Order Items)
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

  // 7. Seed Người Dùng Mẫu (Có băm bcrypt) nếu bảng trống
  db.get('SELECT COUNT(*) AS count FROM users', async (err, row) => {
    if (row && row.count === 0) {
      console.log('🌱 Đang tạo tài khoản mẫu Admin & Khách hàng (băm bcrypt)...');
      const hash123 = await bcrypt.hash('123', 10);
      const stmt = db.prepare('INSERT INTO users (username, password, name, phone, role) VALUES (?, ?, ?, ?, ?)');
      stmt.run('admin', hash123, 'Quản Trị Viên (Admin)', '0901234567', 'admin');
      stmt.run('khach1', hash123, 'Nguyễn Văn An', '0987654321', 'customer');
      stmt.finalize();
    }
  });

  // 8. Seed Dữ liệu Danh mục & Sản phẩm bóng đá thực tế
  db.get('SELECT COUNT(*) AS count FROM products WHERE stud_type IS NOT NULL OR category_type = "kit"', (err, rowCheck) => {
    // Nếu chưa có sản phẩm chuẩn bóng đá mới, ta nạp bộ sản phẩm xịn
    if (!rowCheck || rowCheck.count === 0) {
      console.log('🌱 Đang nạp danh mục và dàn Giày/Áo đấu thực tế cực chất...');

      // Xóa dữ liệu cũ nếu có để nạp lại bộ chuẩn
      db.run('DELETE FROM categories');
      db.run('DELETE FROM products');
      db.run('DELETE FROM product_variants');

      // 1. Danh mục
      const stmtCat = db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)');
      stmtCat.run(1, 'Giày Sân Cỏ Nhân Tạo (TF)', 'giay-tf');
      stmtCat.run(2, 'Giày Sân Cỏ Tự Nhiên (FG)', 'giay-fg');
      stmtCat.run(3, 'Giày Futsal / Trong Nhà (IC)', 'giay-ic');
      stmtCat.run(4, 'Áo Đấu CLB & Đội Tuyển', 'ao-dau');
      stmtCat.finalize();

      // 2. Danh sách sản phẩm thực tế đỉnh cao
      const seedProducts = [
        {
          name: 'Nike Mercurial Vapor 16 Pro TF - Blueprint Pack',
          sku: 'NK-VAP16-TF-BLU',
          category_id: 1,
          brand: 'Nike',
          category_type: 'shoes',
          stud_type: 'TF',
          tier: 'Pro',
          season: null,
          version_type: null,
          price: 2450000,
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
          description: 'Mẫu giày tốc độ mới nhất của Nike với đệm Air Zoom 3/4 êm ái, bám sân cỏ nhân tạo cực tốt.',
          variants: [
            { size: '39', stock: 4 },
            { size: '40', stock: 8 },
            { size: '41', stock: 2 },
            { size: '42', stock: 1 },
            { size: '43', stock: 0 } // demo hết hàng
          ]
        },
        {
          name: 'Adidas Predator 24 Elite FG - Solar Energy',
          sku: 'AD-PRED24-FG-BLK',
          category_id: 2,
          brand: 'Adidas',
          category_type: 'shoes',
          stud_type: 'FG',
          tier: 'Elite',
          season: null,
          version_type: null,
          price: 4200000,
          image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80',
          description: 'Huyền thoại săn bàn trở lại với vây StrikeSkin cao cấp, đinh FG chuyên biệt cho sân 11 cỏ tự nhiên.',
          variants: [
            { size: '40', stock: 3 },
            { size: '41', stock: 5 },
            { size: '42', stock: 2 },
            { size: '43', stock: 4 }
          ]
        },
        {
          name: 'Mizuno Morelia Neo IV Pro AS TF - White Gold',
          sku: 'MZ-NEO4-TF-WHT',
          category_id: 1,
          brand: 'Mizuno',
          category_type: 'shoes',
          stud_type: 'TF',
          tier: 'Pro',
          season: null,
          version_type: null,
          price: 2850000,
          image_url: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600&auto=format&fit=crop&q=80',
          description: 'Da Kangaroo mềm như nhung, siêu nhẹ, phom giày hợp tuyệt đối với bàn chân bè của cầu thủ Việt Nam.',
          variants: [
            { size: '39', stock: 6 },
            { size: '40', stock: 7 },
            { size: '41', stock: 2 },
            { size: '42', stock: 5 }
          ]
        },
        {
          name: 'Nike Phantom GX 2 Academy TF - Shadow Pack',
          sku: 'NK-GX2-TF-BLK',
          category_id: 1,
          brand: 'Nike',
          category_type: 'shoes',
          stud_type: 'TF',
          tier: 'Academy',
          season: null,
          version_type: null,
          price: 1750000,
          image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
          description: 'Thiết kế cổ lửng ôm chân, vân xoáy NikeSkin hỗ trợ chuyền bóng và dứt điểm chuẩn xác.',
          variants: [
            { size: '39', stock: 5 },
            { size: '40', stock: 10 },
            { size: '41', stock: 6 },
            { size: '42', stock: 4 },
            { size: '43', stock: 2 }
          ]
        },
        {
          name: 'Puma Future 7 Match TT - Sunset Pack',
          sku: 'PM-FUT7-TT-ORG',
          category_id: 1,
          brand: 'Puma',
          category_type: 'shoes',
          stud_type: 'TF',
          tier: 'Pro',
          season: null,
          version_type: null,
          price: 1950000,
          image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
          description: 'Dải nẹp FUZIONFIT360 ôm khít mu bàn chân, cho phép bạn thi đấu có dây hoặc không dây tùy thích.',
          variants: [
            { size: '40', stock: 4 },
            { size: '41', stock: 3 },
            { size: '42', stock: 7 }
          ]
        },
        {
          name: 'Nike Premier 3 Sala IC - Futsal & Street',
          sku: 'NK-PREM3-IC-WHT',
          category_id: 3,
          brand: 'Nike',
          category_type: 'shoes',
          stud_type: 'IC',
          tier: 'Pro',
          season: null,
          version_type: null,
          price: 1890000,
          image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
          description: 'Đế cao su phẳng non-marking bám dính mặt sàn gỗ Futsal và sân bê tông cực tốt, da lộn êm ái.',
          variants: [
            { size: '39', stock: 3 },
            { size: '40', stock: 5 },
            { size: '41', stock: 4 },
            { size: '42', stock: 2 }
          ]
        },
        {
          name: 'Áo Đấu Manchester United 2024/25 Home (Bản Cầu Thủ Player Issue)',
          sku: 'AD-MU24-KIT-PLY',
          category_id: 4,
          brand: 'Adidas',
          category_type: 'kit',
          stud_type: null,
          tier: null,
          season: '2024/25',
          version_type: 'player',
          price: 950000,
          image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
          description: 'Áo đấu chính thức Quỷ Đỏ bản HEAT.RDY ôm form thể thao, logo in dập nhiệt nổi 3D siêu nhẹ.',
          variants: [
            { size: 'S', stock: 5 },
            { size: 'M', stock: 10 },
            { size: 'L', stock: 8 },
            { size: 'XL', stock: 3 }
          ]
        },
        {
          name: 'Áo Đấu Real Madrid 2024/25 Home (Bản Fan C1 15 Stars)',
          sku: 'AD-RMA24-KIT-FAN',
          category_id: 4,
          brand: 'Adidas',
          category_type: 'kit',
          stud_type: null,
          tier: null,
          season: '2024/25',
          version_type: 'fan',
          price: 350000,
          image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80',
          description: 'Mẫu áo sân nhà Hoàng Gia Tây Ban Nha đính kèm Patch Cúp C1 15 lần vô địch, chất vải thoáng mát.',
          variants: [
            { size: 'S', stock: 12 },
            { size: 'M', stock: 20 },
            { size: 'L', stock: 15 },
            { size: 'XL', stock: 8 }
          ]
        },
        {
          name: 'Áo Đấu Đội Tuyển Việt Nam 2024/25 Đỏ - Chiến Binh Sao Vàng',
          sku: 'JG-VN24-KIT-RED',
          category_id: 4,
          brand: 'Jogarbola',
          category_type: 'kit',
          stud_type: null,
          tier: null,
          season: '2024/25',
          version_type: 'player',
          price: 590000,
          image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80',
          description: 'Trang phục thi đấu chính thức ĐTQG Việt Nam, họa tiết cánh chim Lạc cùng chất liệu co giãn 4 chiều.',
          variants: [
            { size: 'S', stock: 8 },
            { size: 'M', stock: 15 },
            { size: 'L', stock: 12 },
            { size: 'XL', stock: 6 }
          ]
        }
      ];

      const stmtP = db.prepare(`
        INSERT INTO products (
          name, sku, category_id, brand, category_type, stud_type, tier, season, version_type, price, image_url, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const stmtV = db.prepare('INSERT INTO product_variants (product_id, size, stock) VALUES (?, ?, ?)');

      seedProducts.forEach((p) => {
        stmtP.run(
          p.name, p.sku, p.category_id, p.brand, p.category_type, p.stud_type, p.tier, p.season, p.version_type, p.price, p.image_url, p.description,
          function (errInsert) {
            if (errInsert) {
              console.error('Lỗi chèn sản phẩm:', errInsert.message);
              return;
            }
            const pId = this.lastID;
            p.variants.forEach((v) => stmtV.run(pId, v.size, v.stock));
          }
        );
      });

      console.log('✅ Đã nạp thành công dàn sản phẩm bóng đá & áo đấu cực chất!');
    }
  });
});

module.exports = db;
