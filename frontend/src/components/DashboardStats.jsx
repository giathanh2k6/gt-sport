import React from 'react';
import { DollarSign, Package, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* 4 Cards Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-500">Doanh Thu Đơn Thành Công</span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(stats.total_revenue)}</div>
          <span className="text-[11px] text-emerald-600 font-medium">{stats.total_orders || 0} đơn đã hoàn thành</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-500">Tổng Số Sản Phẩm</span>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{stats.total_products || 0} Mã</div>
          <span className="text-[11px] text-slate-500">Giày TF/FG & Áo đấu CLB</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-500">Đơn Hàng Gần Đây</span>
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{stats.total_orders || 0} Đơn</div>
          <span className="text-[11px] text-indigo-600 font-medium">Hệ thống ghi nhận</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-500">Cảnh Báo Sắp Hết Size</span>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600">{(stats.low_stock_alerts || []).length} Mẫu/Size</div>
          <span className="text-[11px] text-amber-600 font-medium">Tồn kho ≤ 2 sản phẩm</span>
        </div>
      </div>

      {/* Cảnh Báo Tồn Kho Chi Tiết */}
      {stats.low_stock_alerts && stats.low_stock_alerts.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Danh Sách Size Cần Nhập Thêm Hàng Gấp:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.low_stock_alerts.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-amber-200 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-xs text-slate-800">{item.name}</p>
                  <span className="text-[11px] text-slate-500">Kích thước: <strong className="text-slate-700">Size {item.size}</strong></span>
                </div>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Còn {item.stock} sp
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
