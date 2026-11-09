import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CreditCard,
  Phone,
  MapPin,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  Tag
} from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';

export default function OrderManager({
  orders = [],
  onStatusChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const filteredOrders = orders.filter((o) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      o.customer_name?.toLowerCase().includes(query) ||
      o.customer_phone?.includes(query) ||
      `#ord-${o.id}`.toLowerCase().includes(query) ||
      o.customer_address?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || (o.payment_method || 'cod') === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header and Search Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Quản Lý Chi Tiết Đơn Hàng Khách Đặt
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Theo dõi danh sách khách mua, phương thức thanh toán, mã đơn và cập nhật quy trình giao vận.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Tên / SĐT / #ORD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#141822] border border-[#232a3b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e11d48] transition shadow-inner"
            />
          </div>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#141822] border border-[#232a3b] text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e11d48] transition cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">⏳ Chờ xử lý ({orders.filter((o) => o.status === 'pending').length})</option>
            <option value="shipping">🚚 Đang giao hàng</option>
            <option value="completed">✓ Đã hoàn thành</option>
            <option value="cancelled">✕ Đã hủy</option>
          </select>

          {/* Filter Payment */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#141822] border border-[#232a3b] text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e11d48] transition cursor-pointer"
          >
            <option value="all">Mọi phương thức TT</option>
            <option value="cod">Tiền mặt (COD)</option>
            <option value="vietqr">Chuyển khoản VietQR</option>
          </select>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-[#141822] border border-[#232a3b] rounded-2xl shadow-xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Không tìm thấy đơn hàng nào phù hợp với bộ lọc tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d1017] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232a3b]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Mã Đơn</th>
                  <th className="py-3.5 px-4 font-bold">Khách Hàng</th>
                  <th className="py-3.5 px-4 font-bold">Số Điện Thoại</th>
                  <th className="py-3.5 px-4 font-bold">Địa Chỉ Giao Hàng</th>
                  <th className="py-3.5 px-4 font-bold">Thanh Toán</th>
                  <th className="py-3.5 px-4 font-bold">Tổng Tiền</th>
                  <th className="py-3.5 px-4 font-bold text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 font-bold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232a3b]/60">
                {filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-[#1a202c]/50 transition duration-150"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-bold font-mono text-[#e11d48]">
                      #ORD-{o.id}
                    </td>

                    {/* Customer Name */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{o.customer_name}</div>
                      {o.note && (
                        <div className="text-[10px] text-amber-400/90 italic truncate max-w-[150px]">
                          Note: {o.note}
                        </div>
                      )}
                    </td>

                    {/* Customer Phone */}
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      <a
                        href={`tel:${o.customer_phone}`}
                        className="hover:text-emerald-400 hover:underline"
                      >
                        {o.customer_phone}
                      </a>
                    </td>

                    {/* Delivery Address */}
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={o.customer_address}>
                      {o.customer_address}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4">
                      {o.payment_method === 'vietqr' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-950/70 border border-blue-800 text-blue-300 text-[10px] font-bold">
                          <CreditCard size={11} /> VietQR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
                          💵 COD
                        </span>
                      )}
                      {o.discount_amount > 0 && (
                        <span className="block mt-1 text-[10px] text-amber-400 font-semibold">
                          Giảm {formatCurrency(o.discount_amount)}
                        </span>
                      )}
                    </td>

                    {/* Total Price */}
                    <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                      {formatCurrency(o.total_price)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          o.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : o.status === 'shipping'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : o.status === 'cancelled'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {o.status === 'completed'
                          ? '✓ Hoàn thành'
                          : o.status === 'shipping'
                            ? '🚚 Đang giao'
                            : o.status === 'cancelled'
                              ? '✕ Đã hủy'
                              : '⏳ Chờ duyệt'}
                      </span>
                    </td>

                    {/* Actions: View Detail Modal & Quick Status Select */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(o)}
                          className="p-1.5 rounded-lg bg-[#1f2637] hover:bg-[#2e384f] text-slate-300 hover:text-white transition title-view"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye size={15} />
                        </button>

                        <select
                          value={o.status}
                          onChange={(e) => onStatusChange(o.id, e.target.value)}
                          className="bg-[#0d1017] border border-[#232a3b] text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-[#e11d48] cursor-pointer"
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="shipping">Đang giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Hủy đơn</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        onStatusChange={(id, status) => {
          onStatusChange(id, status);
          if (selectedOrder) {
            setSelectedOrder({ ...selectedOrder, status });
          }
        }}
      />
    </div>
  );
}
