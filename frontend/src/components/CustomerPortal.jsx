import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  CheckCircle,
  ShieldCheck,
  Search,
  Trophy,
  User,
  History,
  LogOut,
  Lock,
  Flame,
  Check,
  Zap,
  Tag,
  Truck,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import AuthModal from './AuthModal';

export default function CustomerPortal({
  products,
  categories,
  currentUser,
  setCurrentUser,
  fetchProducts,
  fetchOrders,
  fetchStats,
  onLoginSuccess,
  onLogout
}) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStudType, setSelectedStudType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Delivery Form
  const [customerInfo, setCustomerInfo] = useState({
    name: currentUser ? currentUser.name : '',
    phone: currentUser ? currentUser.phone || '' : '',
    address: ''
  });

  useEffect(() => {
    if (currentUser) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone
      }));
      fetchUserHistory();
    }
  }, [currentUser]);

  const fetchUserHistory = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`/api/orders/user/${currentUser.id}`);
      setCustomerOrders(res.data);
    } catch (err) {
      console.error('Lỗi lấy lịch sử đơn hàng:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const handleSelectSize = (productId, size) => {
    setSelectedSize({ ...selectedSize, [productId]: size });
  };

  const handleCategorySelect = (filterValue, filterType) => {
    if (filterType === 'stud') {
      setSelectedStudType(filterValue);
      setSelectedCategory('');
    } else if (filterType === 'category') {
      setSelectedCategory(filterValue);
      setSelectedStudType('');
    } else {
      setSelectedCategory('');
      setSelectedStudType('');
    }
  };

  const addToCart = (product) => {
    const size = selectedSize[product.id];
    if (!size) {
      alert('⚠️ Vui lòng chọn Size (kích thước) trước khi thêm vào giỏ hàng!');
      return;
    }

    const variant = product.variants ? product.variants.find((v) => v.size === size) : null;
    if (!variant || variant.stock <= 0) {
      alert(`❌ Size ${size} của mẫu "${product.name}" hiện tại đã hết hàng!`);
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => item.product_id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= variant.stock) {
        alert(`⚠️ Trong kho chỉ còn ${variant.stock} sản phẩm size ${size}!`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          brand: product.brand,
          stud_type: product.stud_type,
          size: size,
          quantity: 1,
          max_stock: variant.stock
        }
      ]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else if (newQty > updated[index].max_stock) {
      alert(`⚠️ Rất tiếc, size này chỉ còn ${updated[index].max_stock} sản phẩm!`);
      return;
    } else {
      updated[index].quantity = newQty;
    }
    setCart(updated);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setOrderError('');
    setIsSubmitting(true);

    try {
      await axios.post('/api/orders', {
        user_id: currentUser ? currentUser.id : null,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        items: cart
      });

      setOrderSuccess(true);
      setCart([]);
      fetchProducts();
      if (fetchOrders) fetchOrders();
      if (fetchStats) fetchStats();
      if (currentUser) fetchUserHistory();

      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3500);
    } catch (error) {
      setOrderError(error.response?.data?.error || 'Lỗi khi gửi đơn hàng! Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lọc sản phẩm theo tiêu chí
  const filteredProducts = products.filter((p) => {
    // 1. Lọc theo stud_type (TF, FG, IC)
    if (selectedStudType && p.stud_type !== selectedStudType) {
      return false;
    }
    // 2. Lọc theo category_type (kit)
    if (selectedCategory === 'kit' && p.category_type !== 'kit') {
      return false;
    }
    // 3. Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBrand = p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStud = p.stud_type && p.stud_type.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchName && !matchBrand && !matchStud) return false;
    }
    return true;
  });

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col justify-between selection:bg-[#e11d48] selection:text-white">
      {/* High-Tech Header / Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={onLogout}
        onSearch={(keyword) => setSearchTerm(keyword)}
        selectedCategory={selectedStudType || selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Hero Banner - Predator Dark Aesthetic */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141822] via-[#1a0f18] to-[#141822] border border-[#232a3b] p-8 md:p-12 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#e11d48]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#e11d48]/20 border border-[#e11d48]/40 px-3.5 py-1 rounded-full text-xs font-black tracking-wide text-rose-300 uppercase">
              <Flame size={14} className="text-[#e11d48] animate-pulse" />
              <span>BST MỚI 2024/25 • CHÍNH HÃNG 100%</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight">
              TỐC ĐỘ. SỨC MẠNH. <br />
              <span className="text-[#e11d48]">CHINH PHỤC SÂN CỎ.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              Trải nghiệm các dòng giày đá bóng sân cỏ nhân tạo (TF), sân cỏ thật (FG) và áo đấu CLB hàng đầu thế giới từ Nike, Adidas, Puma và Mizuno.
            </p>

            {/* Quick Guarantees */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 bg-[#0a0c10]/80 px-3 py-1.5 rounded-lg border border-[#232a3b]">
                <Truck size={14} className="text-[#e11d48]" /> Giao hàng 2-3 ngày
              </span>
              <span className="flex items-center gap-1.5 bg-[#0a0c10]/80 px-3 py-1.5 rounded-lg border border-[#232a3b]">
                <RotateCcw size={14} className="text-[#e11d48]" /> Đổi size miễn phí
              </span>
              <span className="flex items-center gap-1.5 bg-[#0a0c10]/80 px-3 py-1.5 rounded-lg border border-[#232a3b]">
                <Trophy size={14} className="text-[#e11d48]" /> Cam kết chính hãng
              </span>
            </div>
          </div>
        </div>

        {/* Section Heading & Result Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1a1f2b]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white flex items-center gap-2">
              <Zap size={20} className="text-[#e11d48]" />
              {selectedStudType
                ? `Giày Đá Bóng Đinh ${selectedStudType}`
                : selectedCategory === 'kit'
                ? 'Áo Đấu CLB & Đội Tuyển'
                : 'Tất Cả Sản Phẩm Nổi Bật'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hiển thị {filteredProducts.length} sản phẩm sẵn sàng giao ngay
            </p>
          </div>

          {currentUser && (
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="self-start sm:self-auto flex items-center gap-2 text-xs font-bold bg-[#141822] hover:bg-[#1b212f] text-slate-200 border border-[#232a3b] px-3.5 py-2 rounded-xl transition"
            >
              <History size={15} className="text-[#e11d48]" />
              <span>Xem Lịch Sử Mua Hàng</span>
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-[#141822] rounded-2xl border border-[#232a3b]">
            <p className="text-4xl">⚽</p>
            <h3 className="font-bold text-white text-base">Không tìm thấy sản phẩm phù hợp!</h3>
            <p className="text-xs text-slate-400">Hãy thử chọn bộ lọc khác hoặc tìm kiếm với từ khóa khác.</p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedStudType('');
                setSearchTerm('');
              }}
              className="mt-2 text-xs font-bold text-[#e11d48] hover:underline"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const currentSize = selectedSize[product.id];
              const isKit = product.category_type === 'kit';

              return (
                <div
                  key={product.id}
                  className="group bg-[#141822] border border-[#232a3b] hover:border-[#e11d48]/70 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-950/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Product Image Container */}
                    <div className="relative aspect-4/3 overflow-hidden bg-[#0a0c10]">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/400x300'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Brand Pill */}
                      {product.brand && (
                        <span className="absolute top-3 left-3 bg-[#0a0c10]/90 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-[#232a3b]">
                          {product.brand}
                        </span>
                      )}

                      {/* Stud / Type Badge */}
                      {product.stud_type ? (
                        <span className="absolute top-3 right-3 bg-[#e11d48] text-white text-[11px] font-black tracking-widest px-2.5 py-0.5 rounded-md shadow-md uppercase">
                          Đinh {product.stud_type}
                        </span>
                      ) : product.version_type ? (
                        <span className="absolute top-3 right-3 bg-[#e11d48] text-white text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md shadow-md uppercase">
                          Bản {product.version_type === 'player' ? 'Cầu Thủ' : 'Fan C1'}
                        </span>
                      ) : null}

                      {/* Tier Pill */}
                      {product.tier && (
                        <span className="absolute bottom-3 left-3 bg-amber-500/90 text-black text-[10px] font-black px-2 py-0.5 rounded shadow uppercase">
                          {product.tier}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#e11d48] transition">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {product.description || 'Chính hãng • Đủ size khả dụng'}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-lg font-black text-white flex items-baseline gap-1">
                        <span className="text-[#e11d48]">{formatCurrency(product.price)}</span>
                      </div>

                      {/* Size Selector */}
                      <div className="pt-2 border-t border-[#1a1f2b]">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {isKit ? 'Chọn Size Áo:' : 'Chọn Size Giày:'}
                          </label>
                          <span className="text-[10px] text-slate-500">
                            {currentSize ? `Đã chọn: ${currentSize}` : 'Chưa chọn'}
                          </span>
                        </div>

                        <div className="flex gap-1.5 flex-wrap">
                          {product.variants &&
                            product.variants.map((v) => {
                              const isOutOfStock = v.stock <= 0;
                              const isSelected = currentSize === v.size;

                              return (
                                <button
                                  key={v.size}
                                  type="button"
                                  disabled={isOutOfStock}
                                  onClick={() => handleSelectSize(product.id, v.size)}
                                  className={`px-2.5 py-1 text-xs font-black rounded-lg border transition cursor-pointer ${
                                    isOutOfStock
                                      ? 'bg-[#0a0c10]/40 text-slate-600 border-[#1a1f2b] cursor-not-allowed line-through'
                                      : isSelected
                                      ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-md shadow-rose-900/50'
                                      : 'bg-[#0a0c10] text-slate-300 border-[#232a3b] hover:border-[#e11d48] hover:text-white'
                                  }`}
                                  title={isOutOfStock ? 'Hết hàng' : `Còn ${v.stock} sản phẩm`}
                                >
                                  {v.size}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="w-full bg-[#1b212f] hover:bg-[#e11d48] text-white font-black text-xs py-2.5 rounded-xl border border-[#232a3b] hover:border-[#e11d48] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-rose-900/30 active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingCart size={15} />
                      <span>THÊM VÀO GIỎ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="bg-[#141822] border-l border-[#232a3b] w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-4 border-b border-[#232a3b] mb-4">
                <h3 className="font-black italic uppercase text-white text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#e11d48]" />
                  <span>Giỏ Hàng Của Bạn</span>
                  <span className="text-xs bg-[#e11d48] px-2 py-0.5 rounded-full text-white font-bold ml-1">
                    {totalCartCount}
                  </span>
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1b212f] transition"
                >
                  ✕
                </button>
              </div>

              {orderSuccess ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                    <CheckCircle size={36} />
                  </div>
                  <h4 className="font-black text-white text-xl uppercase">Đặt Hàng Thành Công!</h4>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Đơn hàng đã được lưu và trừ kho an toàn. Nhân viên GT Sport sẽ liên hệ bạn sớm nhất để xác nhận giao hàng!
                  </p>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <p className="text-4xl">🛒</p>
                  <p className="text-sm font-bold text-slate-400">Giỏ hàng của bạn đang trống.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-bold text-[#e11d48] hover:underline"
                  >
                    Tiếp tục mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items List */}
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-[#0a0c10] border border-[#232a3b] p-3 rounded-xl"
                      >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg border border-[#232a3b]"
                        />
                        <div className="flex-1 text-xs">
                          <p className="font-bold text-white line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Size:{' '}
                            <strong className="text-[#e11d48] font-bold">{item.size}</strong>
                          </p>
                          <div className="font-black text-[#e11d48] mt-1">
                            {formatCurrency(item.price)}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-[#141822] border border-[#232a3b] rounded-lg px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, -1)}
                            className="text-slate-400 hover:text-white font-bold px-1"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-white px-1.5">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, 1)}
                            className="text-slate-400 hover:text-white font-bold px-1"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Price Summary */}
                  <div className="pt-3 border-t border-[#232a3b] flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-300">Tổng thanh toán:</span>
                    <span className="text-xl font-black text-[#e11d48]">
                      {formatCurrency(totalCartPrice)}
                    </span>
                  </div>

                  {orderError && (
                    <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                      <ShieldAlert size={16} className="text-rose-400 flex-shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  {/* Delivery Form */}
                  <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-[#232a3b] text-xs">
                    <h4 className="font-black uppercase tracking-wider text-slate-300 text-xs">
                      Thông Tin Giao Hàng:
                    </h4>

                    {!currentUser && (
                      <div className="p-2.5 bg-amber-950/40 border border-amber-800 text-amber-300 rounded-xl flex items-center justify-between text-[11px]">
                        <span>Đăng nhập để tự động điền và tích lũy điểm!</span>
                        <button
                          type="button"
                          onClick={() => setIsAuthOpen(true)}
                          className="font-black text-[#e11d48] underline ml-2"
                        >
                          Đăng nhập
                        </button>
                      </div>
                    )}

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

                    <textarea
                      required
                      rows={2}
                      placeholder="Địa chỉ nhận hàng chi tiết (Số nhà, đường, phường/xã, quận/huyện) *"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full bg-[#0a0c10] border border-[#232a3b] rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#e11d48]"
                    ></textarea>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#e11d48] hover:bg-[#ff2442] active:scale-[0.99] text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-rose-900/40 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'ĐANG XỬ LÝ ĐƠN HÀNG...' : `XÁC NHẬN ĐẶT HÀNG (${formatCurrency(totalCartPrice)})`}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#141822] border border-[#232a3b] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 text-white">
            <div className="flex justify-between items-center pb-3 border-b border-[#232a3b] mb-4">
              <h3 className="font-black italic uppercase text-base flex items-center gap-2">
                <History className="w-5 h-5 text-[#e11d48]" />
                <span>Lịch Sử Đơn Hàng ({currentUser?.name})</span>
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1b212f]"
              >
                ✕
              </button>
            </div>

            {customerOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Bạn chưa có đơn hàng nào.</p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((o) => (
                  <div
                    key={o.id}
                    className="border border-[#232a3b] rounded-xl p-4 space-y-2 bg-[#0a0c10]"
                  >
                    <div className="flex justify-between items-center text-xs font-bold border-b border-[#1a1f2b] pb-2">
                      <span className="text-[#e11d48]">Mã Đơn: #GT-{o.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : o.status === 'shipping'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : o.status === 'cancelled'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {o.status === 'completed'
                          ? '✓ Đã Hoàn Thành'
                          : o.status === 'shipping'
                          ? '🚚 Đang Giao Hàng'
                          : o.status === 'cancelled'
                          ? '✕ Đã Hủy'
                          : '⏳ Chờ Xác Nhận'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>
                        Người nhận: <strong className="text-slate-200">{o.customer_name}</strong> -{' '}
                        {o.customer_phone}
                      </p>
                      <p>Địa chỉ: {o.customer_address}</p>
                      <p className="font-black text-[#e11d48] text-sm pt-1">
                        Tổng tiền: {formatCurrency(o.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal with JWT support */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />

      {/* Footer */}
      <footer className="bg-[#07090e] border-t border-[#1a1f2b] py-8 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black italic text-white">GT<span className="text-[#e11d48]">SPORT</span></span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-500">Football Boots & Kits Specialist</span>
          </div>
          <p className="text-[11px] text-slate-500">
            © 2026 GT Sport. Bản quyền thuộc về Nguyễn Gia Thành. Dự án cá nhân phát triển bài bản.
          </p>
        </div>
      </footer>
    </div>
  );
}
