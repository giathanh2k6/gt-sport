import React from 'react';
import { LayoutDashboard, Shirt, ShoppingCart, Store, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'products', label: 'Quản Lý Sản Phẩm', icon: Shirt },
    { id: 'orders', label: 'Quản Lý Đơn Hàng', icon: ShoppingCart },
    { id: 'store', label: 'Giao Diện Khách Mua', icon: Store },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            ⚽
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">KickOff Sport</h1>
            <span className="text-xs text-slate-500 font-medium">Quản Lý Shop Bóng Đá</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
          SV
        </div>
        <div className="text-xs overflow-hidden">
          <p className="font-semibold text-slate-800 truncate">Sinh Viên Thực Tập</p>
          <p className="text-slate-500 truncate">Vibe Coding Node.js + React</p>
        </div>
      </div>
    </aside>
  );
}
