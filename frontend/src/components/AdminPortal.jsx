import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import AdminSidebar from './admin/AdminSidebar';
import DashboardOverview from './admin/DashboardOverview';
import OrderManager from './admin/OrderManager';
import ProductManager from './admin/ProductManager';

export default function AdminPortal({
  stats = {},
  products = [],
  categories = [],
  orders = [],
  fetchProducts,
  fetchOrders,
  fetchStats
}) {
  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'orders', 'products'
  const toast = useToast();

  // Đổi trạng thái đơn hàng (pending, shipping, completed, cancelled)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Đã cập nhật đơn hàng #ORD-${orderId} sang trạng thái "${newStatus}"!`);
      if (fetchOrders) fetchOrders();
      if (fetchStats) fetchStats();
    } catch (error) {
      console.error('Lỗi khi đổi trạng thái đơn:', error);
      toast.error(error.response?.data?.error || 'Lỗi khi cập nhật trạng thái đơn hàng!');
    }
  };

  // Thêm hoặc Chỉnh sửa sản phẩm
  const handleSaveProduct = async (formData, editingProductId) => {
    try {
      if (editingProductId) {
        await axios.put(`/api/products/${editingProductId}`, formData);
        toast.success(`Đã cập nhật thành công sản phẩm "${formData.name}"!`);
      } else {
        await axios.post('/api/products', formData);
        toast.success(`Đã tạo mới và thêm sản phẩm "${formData.name}" vào kho!`);
      }
      if (fetchProducts) fetchProducts();
      if (fetchStats) fetchStats();
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      toast.error(error.response?.data?.error || 'Lỗi khi lưu sản phẩm vào kho!');
    }
  };

  // Xóa sản phẩm khỏi kho
  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mẫu "${name || 'này'}" khỏi kho hàng?`)) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success(`Đã xóa sản phẩm "${name || id}" khỏi hệ thống!`);
        if (fetchProducts) fetchProducts();
        if (fetchStats) fetchStats();
      } catch (error) {
        console.error('Lỗi xóa sản phẩm:', error);
        toast.error(error.response?.data?.error || 'Lỗi khi xóa sản phẩm!');
      }
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-[#e11d48] selection:text-white">
      {/* 1. Admin Sidebar (Left Pane) */}
      <AdminSidebar
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0c10]">
        <div className="max-w-7xl mx-auto">
          {/* TAB 1: OVERVIEW */}
          {adminTab === 'overview' && (
            <DashboardOverview
              stats={stats}
              orders={orders}
              onNavigateTab={(tab) => setAdminTab(tab)}
              onOpenAddProduct={() => setAdminTab('products')}
            />
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {adminTab === 'orders' && (
            <OrderManager
              orders={orders}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* TAB 3: PRODUCTS & SIZE INVENTORY */}
          {adminTab === 'products' && (
            <ProductManager
              products={products}
              categories={categories}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
        </div>
      </main>
    </div>
  );
}
