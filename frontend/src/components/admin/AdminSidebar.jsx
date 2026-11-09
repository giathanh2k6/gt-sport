import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function AdminSidebar({
  adminTab,
  setAdminTab,
  pendingOrdersCount = 0
}) {
  return (
    <aside className="w-64 bg-[#0d1017] border-r border-[#1f2637] flex flex-col justify-between p-4 shrink-0 shadow-2xl z-20">
      <div>
        {/* Logo & Brand Header */}
        <div className="flex flex-col items-center justify-center py-2 mb-5 border-b border-[#1f2637] pb-4">
          <Link to="/" className="group flex items-center gap-2">
            <img
              src="/logoGTSport.png"
              alt="GT Sport Logo"
              className="h-14 w-auto object-contain transition-transform group-hover:scale-105 duration-300 drop-shadow-[0_0_12px_rgba(225,29,72,0.4)]"
            />
          </Link>
          <div className="mt-2 text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e11d48] flex items-center justify-center gap-1">
              <Sparkles size={10} /> Control Center <Sparkles size={10} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5 text-xs font-bold">
          <button
            onClick={() => setAdminTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
              adminTab === 'overview'
                ? 'bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white shadow-lg shadow-[#e11d48]/25 font-black scale-[1.02]'
                : 'text-slate-400 hover:bg-[#161c28] hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Báo Cáo & Tổng Quan</span>
          </button>

          <button
            onClick={() => setAdminTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
              adminTab === 'orders'
                ? 'bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white shadow-lg shadow-[#e11d48]/25 font-black scale-[1.02]'
                : 'text-slate-400 hover:bg-[#161c28] hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Đơn Hàng Khách Đặt</span>
            </div>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow animate-pulse">
                {pendingOrdersCount} mới
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('products')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
              adminTab === 'products'
                ? 'bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white shadow-lg shadow-[#e11d48]/25 font-black scale-[1.02]'
                : 'text-slate-400 hover:bg-[#161c28] hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Quản Lý Sản Phẩm & Size</span>
          </button>
        </nav>
      </div>

      {/* Footer Profile & Back Link */}
      <div className="pt-4 border-t border-[#1f2637] space-y-3 px-1 text-xs">
        <div className="flex items-center gap-3 bg-[#141822] p-2.5 rounded-xl border border-[#232a3b]">
          <img
            src="/AvtAdmin.jpg"
            alt="Avatar Super Admin"
            className="w-10 h-10 rounded-full object-cover border-2 border-[#e11d48] shadow-md shrink-0"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
            }}
          />
          <div className="min-w-0">
            <p className="font-black text-slate-200 truncate flex items-center gap-1">
              Nguyễn Gia Thành <ShieldCheck size={12} className="text-[#e11d48]" />
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">Quyền: Super Admin</p>
          </div>
        </div>

        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#141822] hover:bg-[#1f2637] border border-[#232a3b] hover:border-[#e11d48]/50 text-slate-300 hover:text-white font-bold transition duration-200 text-xs shadow-sm"
        >
          <ArrowLeft size={14} className="text-[#e11d48]" />
          <span>Quay Lại Cửa Hàng</span>
        </Link>
      </div>
    </aside>
  );
}
