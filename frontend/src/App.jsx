import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerPortal from './components/CustomerPortal';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    navigate('/');
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
          />
        }
      />

      {/* 2. Cổng Quản Trị Dành Cho Admin */}
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
