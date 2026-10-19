import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerPortal from './components/CustomerPortal';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const [viewMode, setViewMode] = useState('customer'); // 'customer' or 'admin'
  const [currentUser, setCurrentUser] = useState(null); // Currently logged-in user
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

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
      console.error('Lỗi lấy đơn hàng:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Lỗi lấy thống kê:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories(), fetchOrders(), fetchStats()]);
      setLoading(false);
    };
    initData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="font-bold text-sm text-slate-300">Đang nạp hệ thống KickOff Sport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top System Switcher Bar */}
      <div className="bg-slate-950 text-slate-400 text-xs py-1.5 px-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Dự Án Fullstack KickOff Sport - Trạng thái: <strong>Đang hoạt động</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Chuyển giao diện:</span>
          <button
            onClick={() => setViewMode('customer')}
            className={`px-2.5 py-0.5 rounded font-bold transition ${
              viewMode === 'customer' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🛒 Cửa Hàng Khách Mua
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`px-2.5 py-0.5 rounded font-bold transition ${
              viewMode === 'admin' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Trang Quản Lý Admin
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {viewMode === 'customer' ? (
        <CustomerPortal
          products={products}
          categories={categories}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          fetchProducts={fetchProducts}
          fetchOrders={fetchOrders}
          fetchStats={fetchStats}
          onSwitchToAdmin={() => setViewMode('admin')}
        />
      ) : (
        <AdminPortal
          stats={stats}
          products={products}
          categories={categories}
          orders={orders}
          fetchProducts={fetchProducts}
          fetchOrders={fetchOrders}
          fetchStats={fetchStats}
        />
      )}
    </div>
  );
}
