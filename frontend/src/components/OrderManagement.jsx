import React from 'react';
import axios from 'axios';

export default function OrderManagement({ orders, fetchOrders, fetchStats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (fetchStats) fetchStats();
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái đơn hàng!');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">Đã Hoàn Thành</span>;
      case 'shipping':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">Đang Giao Hàng</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">Đã Hủy</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">Chờ Xử Lý</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-base text-slate-800">Quản Lý Đơn Hàng Cửa Hàng</h3>
          <p className="text-xs text-slate-500">Danh sách các đơn hàng từ phía khách đặt qua trang web</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Mã Đơn</th>
              <th className="py-3 px-4">Khách Hàng</th>
              <th className="py-3 px-4">Số Điện Thoại</th>
              <th className="py-3 px-4">Địa Chỉ</th>
              <th className="py-3 px-4">Tổng Tiền</th>
              <th className="py-3 px-4">Trạng Thái</th>
              <th className="py-3 px-4 text-right">Cập Nhật Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-800">#ORD-{o.id}</td>
                <td className="py-3 px-4 font-medium text-slate-800">{o.customer_name}</td>
                <td className="py-3 px-4 text-slate-600">{o.customer_phone}</td>
                <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{o.customer_address}</td>
                <td className="py-3 px-4 font-bold text-emerald-600">{formatCurrency(o.total_price)}</td>
                <td className="py-3 px-4">{getStatusBadge(o.status)}</td>
                <td className="py-3 px-4 text-right">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="border border-slate-200 text-xs rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Hủy đơn</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
