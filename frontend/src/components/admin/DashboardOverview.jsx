import React from 'react';
import {
  DollarSign,
  Package,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Plus
} from 'lucide-react';

export default function DashboardOverview({
  stats = {},
  orders = [],
  onNavigateTab,
  onOpenAddProduct
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#141822] via-[#1a202c] to-[#141822] p-6 rounded-2xl border border-[#232a3b] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#e11d48]/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e11d48]/10 border border-[#e11d48]/30 text-[#e11d48] text-xs font-bold mb-2">
            <TrendingUp size={13} />
            <span>Hệ Thống Quản Trị Cửa Hàng Thể Thao GT Sport</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-wide">
            Báo Cáo Doanh Thu & Tình Hình Kinh Doanh
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Tổng hợp dữ liệu theo thời gian thực về đơn đặt hàng, doanh thu thực thu và cảnh báo hàng tồn kho từng size giày/áo.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#f43f5e] hover:to-[#e11d48] text-white text-xs font-black shadow-lg shadow-[#e11d48]/30 hover:scale-[1.02] active:scale-[0.98] transition duration-200"
          >
            <Plus size={16} />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Doanh Thu */}
        <div className="bg-[#141822] border border-[#232a3b] hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng Doanh Thu
            </span>
            <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition duration-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(stats.total_revenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Đã hoàn thành:</span>
            <strong className="text-emerald-400 font-bold">{completedOrders.length} đơn</strong>
          </div>
        </div>

        {/* Metric 2: Tổng Đơn Hàng */}
        <div className="bg-[#141822] border border-[#232a3b] hover:border-blue-500/40 rounded-2xl p-5 shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng Số Đơn Hàng
            </span>
            <div className="w-9 h-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition duration-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {orders.length} <span className="text-sm font-semibold text-slate-400">Đơn</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Đang chờ duyệt:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              pendingOrders.length > 0
                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                : 'text-slate-400'
            }`}>
              {pendingOrders.length} đơn mới
            </span>
          </div>
        </div>

        {/* Metric 3: Tổng Mã Hàng */}
        <div className="bg-[#141822] border border-[#232a3b] hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mã Sản Phẩm
            </span>
            <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition duration-300">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {stats.total_products || 0} <span className="text-sm font-semibold text-slate-400">Mẫu</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Phân loại:</span>
            <strong className="text-indigo-300">Giày TF/FG/IC & Áo đấu</strong>
          </div>
        </div>

        {/* Metric 4: Cảnh Báo Kho Size */}
        <div className="bg-[#141822] border border-[#232a3b] hover:border-amber-500/40 rounded-2xl p-5 shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cảnh Báo Hết Size
            </span>
            <div className="w-9 h-9 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition duration-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-amber-400 tracking-tight">
            {(stats.low_stock_alerts || []).length}{' '}
            <span className="text-sm font-semibold text-slate-400">Size sắp hết</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Ngưỡng cảnh báo:</span>
            <strong className="text-amber-400 font-bold">Tồn kho ≤ 2 chiếc</strong>
          </div>
        </div>
      </div>

      {/* Cảnh Báo Chi Tiết Kho Size */}
      {stats.low_stock_alerts && stats.low_stock_alerts.length > 0 && (
        <div className="bg-gradient-to-b from-[#22170b] to-[#171008] border border-amber-800/60 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Cảnh Báo: Các Size Sản Phẩm Sắp Hết Hàng Trong Kho</span>
            </h3>
            <span className="text-[11px] text-amber-300/80 font-medium">
              Cần lên kế hoạch bổ sung hàng
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.low_stock_alerts.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#141822]/90 p-3.5 rounded-xl border border-amber-800/40 flex justify-between items-center hover:border-amber-500/50 transition duration-200"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-xs text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kích thước: <strong className="text-amber-300 font-bold">Size {item.size}</strong>
                  </p>
                </div>
                <span className="shrink-0 bg-red-950/80 text-rose-300 border border-rose-800/80 text-xs font-black px-2.5 py-1 rounded-lg">
                  Còn {item.stock} đôi
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bảng Đơn Hàng Gần Đây */}
      <div className="bg-[#141822] border border-[#232a3b] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#232a3b]">
          <div>
            <h3 className="font-black text-base text-white tracking-wide flex items-center gap-2">
              <span>Đơn Đặt Hàng Gần Đây Của Khách</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#232a3b] text-slate-300 font-bold">
                5 đơn mới nhất
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Khách đặt qua cửa hàng trực tuyến và thanh toán COD hoặc VietQR
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('orders')}
            className="inline-flex items-center gap-1.5 text-xs text-[#e11d48] hover:text-[#f43f5e] font-black group transition"
          >
            <span>Xem và quản lý tất cả đơn hàng</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Chưa có đơn hàng nào được tạo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d1017] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232a3b]">
                <tr>
                  <th className="py-3 px-4 font-bold">Mã Đơn</th>
                  <th className="py-3 px-4 font-bold">Khách Hàng</th>
                  <th className="py-3 px-4 font-bold">Số Điện Thoại</th>
                  <th className="py-3 px-4 font-bold">Thanh Toán</th>
                  <th className="py-3 px-4 font-bold">Tổng Tiền</th>
                  <th className="py-3 px-4 font-bold text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232a3b]/60">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#1a202c]/50 transition duration-150">
                    <td className="py-3 px-4 font-bold font-mono text-[#e11d48]">
                      #ORD-{o.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {o.customer_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {o.customer_phone}
                    </td>
                    <td className="py-3 px-4">
                      {o.payment_method === 'vietqr' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/70 border border-blue-800 text-blue-300 text-[10px] font-bold">
                          <CreditCard size={11} /> VietQR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
                          💵 COD
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-400">
                      {formatCurrency(o.total_price)}
                    </td>
                    <td className="py-3 px-4 text-center">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
