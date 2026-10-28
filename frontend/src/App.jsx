import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerPortal from './components/CustomerPortal';
import AdminPortal from './components/AdminPortal';
import ProductDetailPage from './components/ProductDetailPage';
import { ToastProvider, useToast } from './context/ToastContext';

function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Global Cart State (Đồng bộ giữa Trang Chủ và Trang Chi Tiết Sản Phẩm PDP)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('gt_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Tự động lưu giỏ hàng vào localStorage khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('gt_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Lỗi lưu giỏ hàng:', e);
    }
  }, [cart]);

  // Khôi phục phiên đăng nhập từ localStorage khi mở web
  useEffect(() => {
    const token = localStorage.getItem('gt_token');
    const userStr = localStorage.getItem('gt_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error('Lỗi phân tích thông tin user:', e);
      }
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách sản phẩm:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      // 401/403 là bình thường nếu chưa đăng nhập quyền admin
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (err) {
      // 401/403 là bình thường nếu chưa đăng nhập quyền admin
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      const token = localStorage.getItem('gt_token');
      if (token) {
        await Promise.all([fetchOrders(), fetchStats()]);
      }
      setLoading(false);
    };
    initData();
  }, []);

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('gt_token', token);
    localStorage.setItem('gt_user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(user);
    toast.success(`Chào mừng ${user.name || user.username} đã quay trở lại GT Sport!`);

    if (user.role === 'admin') {
      fetchOrders();
      fetchStats();
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gt_token');
    localStorage.removeItem('gt_user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    toast.info('Đã đăng xuất tài khoản thành công!');
    navigate('/');
  };

  // Hàm thêm vào giỏ hàng dùng chung toàn ứng dụng
  const addToCart = (product, size) => {
    const variant = product.variants ? product.variants.find((v) => v.size === size) : null;
    if (!variant || variant.stock <= 0) {
      toast.error(`❌ Size ${size} của mẫu "${product.name}" hiện tại đã hết hàng!`);
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => item.product_id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= variant.stock) {
        toast.warning(`⚠️ Trong kho chỉ còn ${variant.stock} sản phẩm size ${size}!`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          brand: product.brand,
          stud_type: product.stud_type,
          size: size,
          quantity: 1,
          max_stock: variant.stock
        }
      ]);
    }
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0c10] text-white">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#e11d48]"></div>
            <span className="absolute inset-0 flex items-center justify-center text-xl">⚽</span>
          </div>
          <div>
            <p className="font-black italic text-lg tracking-wider text-white">
              GT <span className="text-[#e11d48]">SPORT</span>
            </p>
            <p className="font-semibold text-xs text-slate-400 mt-1">Đang khởi động hệ thống thể thao...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 1. Trang Cửa Hàng Dành Cho Khách Hàng */}
      <Route
        path="/"
        element={
          <CustomerPortal
            products={products}
            categories={categories}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            fetchProducts={fetchProducts}
            fetchOrders={fetchOrders}
            fetchStats={fetchStats}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            addToCart={addToCart}
          />
        }
      />

      {/* 2. Trang Chi Tiết Sản Phẩm Độc Lập (Day 5 & 6 - Full PDP with CartDrawer) */}
      <Route
        path="/product/:id"
        element={
          <ProductDetailPage
            products={products}
            currentUser={currentUser}
            onLogout={handleLogout}
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            addToCart={addToCart}
            fetchProducts={fetchProducts}
            fetchOrders={fetchOrders}
            fetchStats={fetchStats}
          />
        }
      />

      {/* 3. Cổng Quản Trị Dành Cho Admin */}
      <Route
        path="/admin"
        element={
          <AdminPortal
            stats={stats}
            products={products}
            categories={categories}
            orders={orders}
            fetchProducts={fetchProducts}
            fetchOrders={fetchOrders}
            fetchStats={fetchStats}
          />
        }
      />

      {/* Điều hướng mặc định các đường dẫn lạ về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
