import React, { useState } from 'react';
import { ShoppingBag, Search, User, Shield, LogOut, Menu, X, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({
  cartCount = 0,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onLogout,
  onSearch,
  selectedCategory,
  onSelectCategory
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchInput);
  };

  const navLinks = [
    { label: 'Tất Cả', filter: '' },
    { label: 'Cỏ Nhân Tạo (TF)', filter: 'TF', type: 'stud' },
    { label: 'Sân 11 Cỏ Thật (FG)', filter: 'FG', type: 'stud' },
    { label: 'Futsal (IC)', filter: 'IC', type: 'stud' },
    { label: 'Áo Đấu CLB', filter: 'kit', type: 'category' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0c10]/95 backdrop-blur-md border-b border-[#232a3b]">
      {/* Top Ticker Bar */}
      <div className="bg-gradient-to-r from-[#e11d48] to-[#991b1b] text-white text-[11px] font-bold py-1 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-2">
        <Flame size={14} className="animate-pulse" />
        <span>Miễn Phí Vận Chuyển Toàn Quốc Cho Đơn Từ 1.000.000đ • Đổi Size Miễn Phí 7 Ngày</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e11d48] to-[#881337] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-900/40 group-hover:scale-105 transition">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black italic tracking-tighter text-white">GT</span>
                <span className="text-2xl font-black italic tracking-tighter text-[#e11d48]">SPORT</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Football Boot & Kit Co.
              </p>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm Mercurial, Predator, áo MU..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full bg-[#141822] text-sm text-white placeholder-slate-500 rounded-full pl-10 pr-4 py-2 border border-[#232a3b] focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48] transition"
              />
              <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* User Profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#141822] border border-[#232a3b] rounded-full py-1.5 px-3">
                <div className="w-7 h-7 rounded-full bg-[#e11d48] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {currentUser.name}
                </span>

                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-1 hover:text-[#e11d48] transition text-slate-400"
                    title="Vào trang Quản trị Admin"
                  >
                    <Shield size={16} />
                  </Link>
                )}

                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-rose-400 transition ml-1"
                  title="Đăng xuất"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs font-bold bg-[#141822] hover:bg-[#1b212f] text-slate-200 hover:text-white px-3.5 py-2 rounded-full border border-[#232a3b] transition"
              >
                <User size={15} className="text-[#e11d48]" />
                <span className="hidden sm:inline">Đăng Nhập</span>
              </button>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#e11d48] hover:bg-[#ff2442] text-white shadow-lg shadow-rose-900/50 hover:scale-105 active:scale-95 transition"
              title="Giỏ hàng của bạn"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#e11d48] font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Desktop) */}
        <div className="hidden md:flex items-center gap-2 py-2.5 overflow-x-auto border-t border-[#1a1f2b]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
            Mặt Sân:
          </span>
          {navLinks.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => onSelectCategory && onSelectCategory(tab.filter, tab.type)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer ${
                selectedCategory === tab.filter
                  ? 'bg-[#e11d48] text-white shadow-md shadow-rose-900/40'
                  : 'bg-[#141822] text-slate-400 hover:text-white hover:bg-[#1b212f] border border-[#232a3b]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Quick link to Admin if user wants to log in directly */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/admin"
              className="text-[11px] font-bold text-slate-500 hover:text-[#e11d48] flex items-center gap-1 transition"
            >
              <Shield size={12} />
              <span>Dành cho Quản Lý</span>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1a1f2b] space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Tìm giày đá bóng, áo đấu..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full bg-[#141822] text-sm text-white rounded-lg pl-9 pr-4 py-2 border border-[#232a3b]"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </form>
            <div className="flex flex-wrap gap-2 pt-2">
              {navLinks.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(tab.filter, tab.type);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                    selectedCategory === tab.filter
                      ? 'bg-[#e11d48] text-white'
                      : 'bg-[#141822] text-slate-300 border border-[#232a3b]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-[#1a1f2b]">
              <Link
                to="/admin"
                className="text-xs font-bold text-slate-400 hover:text-[#e11d48] flex items-center gap-1.5 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield size={14} />
                <span>Cổng Quản Trị Admin</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
