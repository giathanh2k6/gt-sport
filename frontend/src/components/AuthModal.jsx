import React, { useState } from 'react';
import { User, Lock, Phone, UserCheck, X, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        // Đăng ký
        const res = await axios.post('/api/auth/register', formData);
        setSuccessMsg('🎉 Đăng ký thành công! Đang tự động đăng nhập...');
        setTimeout(() => {
          if (res.data.token && res.data.user) {
            onLoginSuccess(res.data.token, res.data.user);
            onClose();
          } else {
            setIsRegisterMode(false);
          }
        }, 1000);
      } else {
        // Đăng nhập
        const res = await axios.post('/api/auth/login', {
          username: formData.username,
          password: formData.password
        });
        onLoginSuccess(res.data.token, res.data.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (role) => {
    if (role === 'admin') {
      setFormData({ username: 'admin', password: '123', name: '', phone: '' });
    } else {
      setFormData({ username: 'khach1', password: '123', name: '', phone: '' });
    }
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#141822] border border-[#232a3b] rounded-2xl shadow-2xl w-full max-w-md p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a1f2b] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#e11d48]/15 text-[#e11d48] rounded-2xl flex items-center justify-center mx-auto mb-2 font-black text-2xl border border-[#e11d48]/30 shadow-lg shadow-rose-900/30">
            ⚽
          </div>
          <h3 className="font-black italic text-2xl text-white uppercase tracking-tight">
            {isRegisterMode ? 'Đăng Ký Thành Viên' : 'Đăng Nhập GT SPORT'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isRegisterMode ? 'Tạo tài khoản để đặt hàng và theo dõi đơn' : 'Đăng nhập để trải nghiệm mua sắm đồ bóng đá đỉnh cao'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Fill Buttons */}
        {!isRegisterMode && (
          <div className="mb-4 p-3 bg-[#0a0c10] rounded-xl border border-[#232a3b]">
            <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-[#e11d48]" /> Tài khoản thử nghiệm nhanh:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickAccount('admin')}
                className="py-1 px-2.5 rounded-lg text-xs font-bold bg-[#141822] hover:bg-[#1b212f] text-rose-400 border border-rose-900/40 hover:border-rose-700 transition"
              >
                🛡️ Admin: admin / 123
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('khach')}
                className="py-1 px-2.5 rounded-lg text-xs font-bold bg-[#141822] hover:bg-[#1b212f] text-slate-300 border border-[#232a3b] hover:border-slate-500 transition"
              >
                🛒 Khách: khach1 / 123
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Họ Và Tên *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-[#0a0c10] border border-[#232a3b] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Đăng Nhập *</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-[#0a0c10] border border-[#232a3b] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mật Khẩu *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-[#0a0c10] border border-[#232a3b] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Số Điện Thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ví dụ: 0912345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-[#0a0c10] border border-[#232a3b] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-[#e11d48] hover:bg-[#ff2442] active:scale-[0.99] text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-rose-900/40 transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (isRegisterMode ? 'Xác Nhận Đăng Ký' : 'Đăng Nhập Ngay')}
          </button>
        </form>

        <div className="mt-5 text-center border-t border-[#232a3b] pt-4">
          <p className="text-xs text-slate-400">
            {isRegisterMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-[#e11d48] font-bold hover:underline ml-1"
            >
              {isRegisterMode ? 'Đăng nhập tại đây' : 'Đăng ký miễn phí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
