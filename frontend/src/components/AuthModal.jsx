import React, { useState } from 'react';
import { User, Lock, Phone, UserCheck, X } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (isRegisterMode) {
        // Đăng ký
        const res = await axios.post('/api/register', formData);
        alert('🎉 Đăng ký tài khoản thành công! Hãy đăng nhập ngay.');
        setIsRegisterMode(false);
      } else {
        // Đăng nhập
        const res = await axios.post('/api/login', {
          username: formData.username,
          password: formData.password
        });
        onLoginSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const fillQuickAccount = (role) => {
    if (role === 'admin') {
      setFormData({ username: 'admin', password: '123', name: '', phone: '' });
    } else {
      setFormData({ username: 'khach1', password: '123', name: '', phone: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black text-2xl border border-emerald-500/30">
            ⚽
          </div>
          <h3 className="font-extrabold text-xl text-white">
            {isRegisterMode ? 'Đăng Ký Tài Khoản Mới' : 'Đăng Nhập Hệ Thống'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isRegisterMode ? 'Tạo tài khoản để mua hàng & theo dõi đơn' : 'Nhập tài khoản Admin hoặc Khách Hàng để tiếp tục'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded-xl mb-4 font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegisterMode && (
            <div>
              <label className="block font-bold text-slate-300 mb-1">Họ và Tên *</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-300 mb-1">Tên Đăng Nhập (Username) *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                placeholder="VD: admin hoặc khach1"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Mật Khẩu *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block font-bold text-slate-300 mb-1">Số Điện Thoại *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="0987654321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition text-xs"
          >
            {isRegisterMode ? 'Tạo Tài Khoản Khách Hàng' : 'Đăng Nhập'}
          </button>
        </form>

        {/* Dynamic Quick Login Buttons */}
        {!isRegisterMode && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-center space-y-2">
            <p className="text-slate-400">Bấm thử tài khoản mẫu có sẵn:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillQuickAccount('admin')}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-1.5 rounded-lg border border-emerald-900/60"
              >
                🛡️ Tk Admin (`admin`)
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('customer')}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold py-1.5 rounded-lg border border-blue-900/60"
              >
                👤 Tk Khách (`khach1`)
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-slate-400">
          {isRegisterMode ? (
            <p>
              Đã có tài khoản?{' '}
              <button
                onClick={() => setIsRegisterMode(false)}
                className="text-emerald-400 font-bold hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          ) : (
            <p>
              Chưa có tài khoản?{' '}
              <button
                onClick={() => setIsRegisterMode(true)}
                className="text-emerald-400 font-bold hover:underline"
              >
                Đăng ký tài khoản Khách
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
