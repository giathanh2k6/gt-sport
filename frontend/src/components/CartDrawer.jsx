import React, { useState } from 'react';
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  Tag,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  AlertTriangle,
  ArrowRight,
  Flame,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  setCart,
  currentUser,
  fetchProducts,
  fetchOrders,
  fetchStats,
  onOpenAuth
}) {
  const toast = useToast();

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' hoặc 'vietqr'
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null); // { code, discount, type: 'percent' | 'fixed' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Tính tiền tạm tính
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Mức Freeship: 1.000.000đ
  const freeShippingThreshold = 1000000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Tính số tiền giảm giá
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedVoucher.value) / 100);
    } else if (appliedVoucher.type === 'fixed') {
      discountAmount = appliedVoucher.value;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Cập nhật số lượng
  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;

    if (newQty <= 0) {
      const removedName = updated[index].name;
      updated.splice(index, 1);
      setCart(updated);
      toast.info(`Đã xóa ${removedName} khỏi giỏ hàng.`);
      return;
    }

    if (newQty > updated[index].max_stock) {
      toast.warning(`⚠️ Rất tiếc, size ${updated[index].size} chỉ còn ${updated[index].max_stock} sản phẩm trong kho!`);
      return;
    }

    updated[index].quantity = newQty;
    setCart(updated);
  };

  // Xóa 1 món
  const removeItem = (index) => {
    const removedName = cart[index].name;
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    toast.info(`Đã xóa ${removedName} khỏi giỏ hàng.`);
  };

  // Xóa toàn bộ giỏ
  const clearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
      setCart([]);
      setAppliedVoucher(null);
      toast.info('Đã làm trống giỏ hàng.');
    }
  };

  // Áp dụng Voucher
  const handleApplyVoucher = (codeToApply = null) => {
    const code = (codeToApply || voucherCode).trim().toUpperCase();
    if (!code) {
      toast.warning('Vui lòng nhập mã ưu đãi!');
      return;
    }

    if (code === 'GTSPORT10') {
      setAppliedVoucher({ code: 'GTSPORT10', value: 10, type: 'percent', label: 'Giảm 10% tổng đơn' });
      setVoucherCode('');
      toast.success('🎉 Áp dụng thành công mã GTSPORT10: Giảm 10%!');
    } else if (code === 'KICKOFF50') {
      setAppliedVoucher({ code: 'KICKOFF50', value: 50000, type: 'fixed', label: 'Giảm 50.000đ đơn đầu tiên' });
      setVoucherCode('');
      toast.success('🎉 Áp dụng thành công mã KICKOFF50: Giảm 50.000đ!');
    } else {
      toast.error('❌ Mã ưu đãi không hợp lệ hoặc đã hết lượt sử dụng!');
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    toast.info('Đã hủy áp dụng mã giảm giá.');
  };

  // Xử lý gửi đơn hàng
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      toast.warning('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post('/api/orders', {
        user_id: currentUser ? currentUser.id : null,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        items: cart,
        payment_method: paymentMethod,
        note: customerInfo.note,
        discount_amount: discountAmount
      });

      const orderId = res.data.order_id || Date.now().toString().slice(-6);

      setOrderSuccessData({
        orderId,
        total: finalTotal,
        paymentMethod,
        phone: customerInfo.phone
      });

      setCart([]);
      setAppliedVoucher(null);
      fetchProducts();
      if (fetchOrders) fetchOrders();
      if (fetchStats) fetchStats();

      toast.success('🎉 Đặt hàng thành công! Đơn hàng đã được lưu và trừ kho.');
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Lỗi khi gửi đơn hàng! Vui lòng thử lại.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop mờ tối */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Main Drawer Container */}
      <div className="relative w-full max-w-lg bg-[#141822] border-l border-[#232a3b] text-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#232a3b] bg-[#0a0c10] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e11d48]/20 flex items-center justify-center text-[#e11d48]">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h3 className="font-black italic uppercase text-white text-base tracking-wide flex items-center gap-2">
                Giỏ Hàng Thể Thao
                {cart.length > 0 && (
                  <span className="bg-[#e11d48] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">GT Sport • Kiểm tra size & thanh toán tức thì</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-400 flex items-center gap-1 transition p-1"
                title="Xóa toàn bộ giỏ hàng"
              >
                <Trash2 size={13} /> Xóa hết
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1b212f] hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 flex items-center justify-center transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Màn hình Đặt Hàng Thành Công */}
        {orderSuccessData ? (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/40 animate-bounce">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#e11d48]">Xác Nhận Thành Công</span>
              <h4 className="font-black text-white text-2xl uppercase">ĐÃ ĐẶT HÀNG!</h4>
              <p className="text-xs text-slate-400">
                Mã đơn hàng: <strong className="text-white">#GT-{orderSuccessData.orderId}</strong>
              </p>
            </div>

            {/* Khung VietQR nếu chọn chuyển khoản */}
            {orderSuccessData.paymentMethod === 'vietqr' ? (
              <div className="w-full bg-[#0a0c10] border border-[#232a3b] p-4 rounded-2xl space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-[#1f2637] pb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <QrCode size={15} className="text-[#e11d48]" /> Quét Mã VietQR Thanh Toán:
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                    Khuyên Dùng
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
                  {/* Mã QR Sinh Động */}
                  <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=2|99|0901234567|NGUYEN%20GIA%20THANH|${orderSuccessData.total}|GTSPORT%20${orderSuccessData.orderId}`}
                      alt="VietQR Code"
                      className="w-32 h-32 object-contain"
                    />
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-300 flex-1">
                    <p>Ngân hàng: <strong className="text-white">MB Bank (Quân Đội)</strong></p>
                    <p>Số tài khoản: <strong className="text-rose-400 text-sm font-mono tracking-wider">0901234567</strong></p>
                    <p>Chủ tài khoản: <strong className="text-white">NGUYEN GIA THANH</strong></p>
                    <p>Số tiền: <strong className="text-[#e11d48] text-sm">{formatCurrency(orderSuccessData.total)}</strong></p>
                    <p className="text-[11px] text-slate-400">
                      Nội dung: <span className="bg-[#1b212f] text-amber-300 font-mono px-1.5 py-0.5 rounded">GTSPORT {orderSuccessData.orderId}</span>
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center pt-1 border-t border-[#1f2637]">
                  💡 Hệ thống sẽ tự động xác nhận đơn và giao hàng ngay sau khi nhận tiền.
                </p>
              </div>
            ) : (
              <div className="w-full bg-[#0a0c10] border border-[#232a3b] p-4 rounded-2xl text-xs text-slate-300 text-left space-y-2">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Banknote size={15} className="text-emerald-400" /> Thanh Toán Tiền Mặt Khi Nhận Hàng (COD):
                </p>
                <p className="text-slate-400 text-[11px]">
                  Bạn sẽ thanh toán số tiền <strong className="text-[#e11d48]">{formatCurrency(orderSuccessData.total)}</strong> cho nhân viên giao hàng khi nhận và kiểm tra giày/áo đúng size.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setOrderSuccessData(null);
                onClose();
              }}
              className="w-full py-3 bg-[#e11d48] hover:bg-rose-600 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg transition"
            >
              Tiếp Tục Mua Sắm
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Giỏ hàng trống */
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#0a0c10] border border-[#232a3b] flex items-center justify-center text-4xl shadow-inner animate-float">
              🛒
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-white text-lg">Giỏ hàng của bạn đang trống!</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Chưa có đôi giày hay chiếc áo đấu nào được chọn. Hãy khám phá ngay các BST mới nhất!
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#e11d48] hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition"
            >
              Khám Phá Sản Phẩm Ngay
            </button>
          </div>
        ) : (
          /* Danh sách món đồ & Checkout Form */
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 1. Thanh Tiến Trình Miễn Phí Vận Chuyển (Free Shipping Bar) */}
            <div className="bg-[#0a0c10] border border-[#232a3b] p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Truck size={15} className="text-[#e11d48]" />
                  {isFreeShipping ? (
                    <span className="text-emerald-400">🎉 Đơn hàng đủ điều kiện FREESHIP Toàn Quốc!</span>
                  ) : (
                    <span>Mua thêm <strong className="text-[#e11d48]">{formatCurrency(remainingForFreeShipping)}</strong> để được FREESHIP!</span>
                  )}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{freeShippingProgress}%</span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 bg-[#1b212f] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeShipping
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-[#e11d48] to-rose-400'
                  }`}
                  style={{ width: `${freeShippingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* 2. Danh sách sản phẩm trong giỏ */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sản Phẩm Trong Giỏ ({cart.length}):
              </span>

              {cart.map((item, idx) => (
                <div
                  key={`${item.product_id}-${item.size}`}
                  className="flex gap-3 bg-[#0a0c10] border border-[#232a3b] hover:border-slate-600 p-3 rounded-2xl transition"
                >
                  <img
                    src={item.image_url || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl border border-[#232a3b] shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-white text-xs truncate">{item.name}</h5>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="bg-[#1b212f] text-rose-300 text-[10px] font-black px-2 py-0.5 rounded">
                          Size: {item.size}
                        </span>
                        {item.stud_type && (
                          <span className="text-[10px] text-slate-400">Đinh {item.stud_type}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-black text-[#e11d48] text-xs">
                        {formatCurrency(item.price)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-[#141822] border border-[#232a3b] rounded-lg px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, -1)}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-black text-white px-1 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, 1)}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Khung Áp Mã Ưu Đãi (Coupon Code) */}
            <div className="bg-[#0a0c10] border border-[#232a3b] p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Tag size={14} className="text-[#e11d48]" /> Mã Ưu Đãi / Voucher:
                </span>
                {appliedVoucher && (
                  <button
                    type="button"
                    onClick={removeVoucher}
                    className="text-[10px] font-bold text-rose-400 hover:underline"
                  >
                    Hủy mã
                  </button>
                )}
              </div>

              {appliedVoucher ? (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl flex items-center justify-between text-xs font-bold">
                  <span>✓ Đã áp dụng: <strong>{appliedVoucher.code}</strong> ({appliedVoucher.label})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập GTSPORT10 hoặc KICKOFF50..."
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 bg-[#141822] border border-[#232a3b] rounded-xl px-3 py-1.5 text-xs text-white uppercase placeholder:normal-case placeholder-slate-500 focus:outline-none focus:border-[#e11d48]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyVoucher()}
                    className="bg-[#1b212f] hover:bg-[#e11d48] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-[#232a3b] transition"
                  >
                    Áp Dụng
                  </button>
                </div>
              )}

              {/* Gợi ý mã voucher */}
              {!appliedVoucher && (
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 flex-wrap">
                  <span>Gợi ý:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyVoucher('GTSPORT10')}
                    className="bg-[#141822] border border-dashed border-rose-900/60 hover:border-[#e11d48] text-rose-300 px-2 py-0.5 rounded font-mono transition"
                  >
                    GTSPORT10 (-10%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyVoucher('KICKOFF50')}
                    className="bg-[#141822] border border-dashed border-rose-900/60 hover:border-[#e11d48] text-rose-300 px-2 py-0.5 rounded font-mono transition"
                  >
                    KICKOFF50 (-50K)
                  </button>
                </div>
              )}
            </div>

            {/* 4. Chọn Phương Thức Thanh Toán */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Phương Thức Thanh Toán:
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-rose-950/20 border-[#e11d48] text-white ring-1 ring-[#e11d48]'
                      : 'bg-[#0a0c10] border-[#232a3b] text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Banknote size={18} className={paymentMethod === 'cod' ? 'text-[#e11d48]' : 'text-slate-500'} />
                  <div className="pt-2">
                    <p className="text-xs font-black text-white">Thanh Toán COD</p>
                    <p className="text-[10px] text-slate-400">Tiền mặt khi nhận</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('vietqr')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    paymentMethod === 'vietqr'
                      ? 'bg-rose-950/20 border-[#e11d48] text-white ring-1 ring-[#e11d48]'
                      : 'bg-[#0a0c10] border-[#232a3b] text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <QrCode size={18} className={paymentMethod === 'vietqr' ? 'text-[#e11d48]' : 'text-slate-500'} />
                  <div className="pt-2">
                    <p className="text-xs font-black text-white">Chuyển Khoản VietQR</p>
                    <p className="text-[10px] text-slate-400">Quét mã tiện lợi</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 5. Form Thông Tin Nhận Hàng */}
            <form onSubmit={handleCheckout} className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Thông Tin Giao Hàng:
                </span>
                {!currentUser && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="text-[11px] font-bold text-[#e11d48] hover:underline"
                  >
                    Đăng nhập nhanh
                  </button>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Họ và tên người nhận *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full bg-[#0a0c10] border border-[#232a3b] rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#e11d48]"
                />

                <input
                  type="tel"
                  required
                  placeholder="Số điện thoại nhận hàng *"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full bg-[#0a0c10] border border-[#232a3b] rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#e11d48]"
                />

                <input
                  type="text"
                  required
                  placeholder="Địa chỉ giao hàng chi tiết (Số nhà, đường, quận/huyện) *"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="w-full bg-[#0a0c10] border border-[#232a3b] rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#e11d48]"
                />

                <input
                  type="text"
                  placeholder="Ghi chú giao hàng (vd: Giao giờ hành chính, gọi trước khi đến...)"
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                  className="w-full bg-[#0a0c10] border border-[#232a3b] rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#e11d48]"
                />
              </div>

              {/* Price Breakdown Summary */}
              <div className="pt-3 border-t border-[#232a3b] space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Voucher giảm giá:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Phí vận chuyển:</span>
                  <span className={isFreeShipping ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {isFreeShipping ? 'MIỄN PHÍ' : '30.000đ'}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#1f2637]">
                  <span className="font-bold text-white text-sm">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-[#e11d48]">
                    {formatCurrency(finalTotal + (isFreeShipping ? 0 : 30000))}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button với hiệu ứng vệt sáng */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#e11d48] hover:bg-rose-600 active:scale-98 text-white font-black uppercase tracking-wider text-xs rounded-2xl shadow-xl shadow-rose-950/60 transition disabled:opacity-50 btn-shine-sweep cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>ĐANG XỬ LÝ ĐƠN HÀNG...</span>
                ) : (
                  <>
                    <span>XÁC NHẬN ĐẶT HÀNG</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Drawer Footer info */}
        <div className="p-3 bg-[#0a0c10] border-t border-[#232a3b] text-center text-[10px] text-slate-500">
          🔒 Bảo mật thông tin đơn hàng 100% • GT Sport Cam Kết Chính Hãng
        </div>
      </div>
    </div>
  );
}
