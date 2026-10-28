import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ShieldAlert,
  Ruler,
  Eye,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import AuthModal from './AuthModal';
import ProductFilterBar from './ProductFilterBar';
import SizeGuideModal from './SizeGuideModal';
import ProductDetailModal from './ProductDetailModal';
import CartDrawer from './CartDrawer';
import { useToast } from '../context/ToastContext';

export default function CustomerPortal({
  products,
  categories,
  currentUser,
  setCurrentUser,
  fetchProducts,
  fetchOrders,
  fetchStats,
  onLoginSuccess,
  onLogout,
  cart: parentCart,
  setCart: setParentCart,
  isCartOpen: parentIsCartOpen,
  setIsCartOpen: setParentIsCartOpen,
  addToCart: parentAddToCart
}) {
  const toast = useToast();
  const navigate = useNavigate();

  // Dùng state từ App nếu có, nếu không thì dùng fallback local state
  const [localCart, setLocalCart] = useState([]);
  const [localIsCartOpen, setLocalIsCartOpen] = useState(false);

  const cart = parentCart !== undefined ? parentCart : localCart;
  const setCart = setParentCart !== undefined ? setParentCart : setLocalCart;
  const isCartOpen = parentIsCartOpen !== undefined ? parentIsCartOpen : localIsCartOpen;
  const setIsCartOpen = setParentIsCartOpen !== undefined ? setParentIsCartOpen : setLocalIsCartOpen;

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [detailModalProduct, setDetailModalProduct] = useState(null);

  const [customerOrders, setCustomerOrders] = useState([]);

  // States bộ lọc đa tiêu chí
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStudType, setSelectedStudType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedSize, setSelectedSize] = useState({});

  useEffect(() => {
    if (currentUser) {
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

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedStudType('');
    setSelectedBrand('');
    setSelectedSizeFilter('');
    setPriceRange('all');
    setSortBy('newest');
    setSearchTerm('');
    toast.info('Đã xóa bộ lọc và hiển thị tất cả sản phẩm!');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedStudType || selectedCategory) count++;
    if (selectedBrand) count++;
    if (selectedSizeFilter) count++;
    if (priceRange !== 'all') count++;
    if (searchTerm) count++;
    return count;
  }, [selectedStudType, selectedCategory, selectedBrand, selectedSizeFilter, priceRange, searchTerm]);

  // Thêm vào giỏ hàng
  const addToCart = (product, specificSize = null) => {
    const size = specificSize || selectedSize[product.id];
    if (!size) {
      toast.warning('⚠️ Vui lòng chọn Kích thước (Size) trước khi thêm vào giỏ hàng!');
      return;
    }

    if (parentAddToCart) {
      parentAddToCart(product, size);
      toast.success(`Đã thêm ${product.name} (Size ${size}) vào giỏ!`);
      return;
    }

    const variant = product.variants ? product.variants.find((v) => v.size === size) : null;
    if (!variant || variant.stock <= 0) {
      toast.error(`❌ Size ${size} của mẫu "${product.name}" hiện tại đã hết hàng!`);
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => item.product_id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= variant.stock) {
        toast.warning(`⚠️ Trong kho chỉ còn ${variant.stock} sản phẩm size ${size}!`);
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
    toast.success(`Đã thêm ${product.name} (Size ${size}) vào giỏ!`);
    setIsCartOpen(true);
  };

  // Lọc và Sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedStudType && p.stud_type !== selectedStudType) return false;
        if (selectedCategory === 'kit' && p.category_type !== 'kit') return false;
        if (selectedBrand && p.brand?.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedSizeFilter) {
          const hasSizeInStock = p.variants?.some(
            (v) => v.size === selectedSizeFilter && v.stock > 0
          );
          if (!hasSizeInStock) return false;
        }
        if (priceRange === 'under-1m' && p.price >= 1000000) return false;
        if (priceRange === '1m-2m' && (p.price < 1000000 || p.price > 2000000)) return false;
        if (priceRange === '2m-3m' && (p.price <= 2000000 || p.price > 3000000)) return false;
        if (priceRange === 'over-3m' && p.price <= 3000000) return false;

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(term);
          const matchBrand = p.brand?.toLowerCase().includes(term);
          const matchStud = p.stud_type?.toLowerCase().includes(term);
          const matchSku = p.sku?.toLowerCase().includes(term);
          const matchDesc = p.description?.toLowerCase().includes(term);
          if (!matchName && !matchBrand && !matchStud && !matchSku && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return b.id - a.id;
      });
  }, [
    products,
    selectedStudType,
    selectedCategory,
    selectedBrand,
    selectedSizeFilter,
    priceRange,
    searchTerm,
    sortBy
  ]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        {/* Hero Banner với hiệu ứng Stadium Glow Pulse & Slide Up */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141822] via-[#1a0f18] to-[#141822] border border-[#232a3b] p-8 md:p-12 shadow-2xl animate-fadeIn">
          {/* Vùng sáng đỏ sân vận động thở nhẹ (Stadium Ambient Glow) */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#e11d48]/20 rounded-full blur-3xl pointer-events-none animate-glow-pulse"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-rose-900/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-[#e11d48]/20 border border-[#e11d48]/40 px-3.5 py-1 rounded-full text-xs font-black tracking-wide text-rose-300 uppercase shadow-lg shadow-rose-950/40">
              <Flame size={14} className="text-[#e11d48] animate-pulse" />
              <span>BST MỚI 2024/25 • CHÍNH HÃNG 100%</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight">
              TỐC ĐỘ. SỨC MẠNH. <br />
              <span className="text-[#e11d48] bg-gradient-to-r from-[#e11d48] to-rose-400 bg-clip-text text-transparent">
                CHINH PHỤC SÂN CỎ.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              Trải nghiệm các dòng giày đá bóng sân cỏ nhân tạo (TF), sân cỏ thật (FG) và áo đấu CLB hàng đầu thế giới từ Nike, Adidas, Puma và Mizuno.
            </p>

            {/* Quick Guarantees & Size Guide Action */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 bg-[#0a0c10]/80 px-3 py-1.5 rounded-xl border border-[#232a3b] hover:border-slate-500 transition">
                <Truck size={14} className="text-[#e11d48]" /> Giao hàng 2-3 ngày
              </span>
              <span className="flex items-center gap-1.5 bg-[#0a0c10]/80 px-3 py-1.5 rounded-xl border border-[#232a3b] hover:border-slate-500 transition">
                <RotateCcw size={14} className="text-[#e11d48]" /> Đổi size miễn phí
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="flex items-center gap-1.5 bg-[#e11d48]/20 hover:bg-[#e11d48] text-rose-300 hover:text-white px-3 py-1.5 rounded-xl border border-[#e11d48]/40 transition cursor-pointer shadow-md"
              >
                <Ruler size={14} /> Bảng Hướng Dẫn Đo Size Chân
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Criteria Filter Bar */}
        <ProductFilterBar
          selectedStudType={selectedStudType}
          setSelectedStudType={setSelectedStudType}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedSizeFilter={selectedSizeFilter}
          setSelectedSizeFilter={setSelectedSizeFilter}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
        />

        {/* Section Heading & Result Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1a1f2b]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white flex items-center gap-2">
              <Zap size={20} className="text-[#e11d48] animate-bounce" />
              {selectedStudType
                ? `Giày Đá Bóng Đinh ${selectedStudType}`
                : selectedCategory === 'kit'
                ? 'Áo Đấu CLB & Đội Tuyển'
                : selectedBrand
                ? `Sản Phẩm Thương Hiệu ${selectedBrand}`
                : 'Tất Cả Sản Phẩm Nổi Bật'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hiển thị {filteredProducts.length} sản phẩm phù hợp với bộ lọc
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSizeGuideOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#141822] hover:bg-[#1b212f] border border-[#232a3b] px-3 py-2 rounded-xl transition"
            >
              <Ruler size={14} className="text-[#e11d48]" />
              <span>Bảng Size Chuẩn</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 text-xs font-bold bg-[#141822] hover:bg-[#1b212f] text-slate-200 border border-[#232a3b] px-3.5 py-2 rounded-xl transition"
              >
                <History size={15} className="text-[#e11d48]" />
                <span>Lịch Sử Mua Hàng</span>
              </button>
            )}
          </div>
        </div>

        {/* Products Grid với hiệu ứng hover-glow-card */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-[#141822] rounded-3xl border border-[#232a3b] animate-fadeIn">
            <p className="text-4xl animate-float">⚽</p>
            <h3 className="font-bold text-white text-base">Không tìm thấy sản phẩm phù hợp!</h3>
            <p className="text-xs text-slate-400">Hãy thử bỏ bớt điều kiện lọc hoặc chọn lại từ khóa khác.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 text-xs font-bold text-[#e11d48] hover:underline"
            >
              Xóa tất cả bộ lọc & Xem toàn bộ sản phẩm
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
                  className="group bg-[#141822] border border-[#232a3b] rounded-3xl overflow-hidden shadow-lg hover-glow-card flex flex-col justify-between"
                >
                  <div>
                    {/* Product Image Container */}
                    <div className="relative aspect-4/3 overflow-hidden bg-[#0a0c10]">
                      <Link to={`/product/${product.id}`} className="block w-full h-full">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/400x300'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500"
                          loading="lazy"
                        />
                      </Link>

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

                      {/* Quick View Button Hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDetailModalProduct(product);
                          }}
                          className="pointer-events-auto bg-[#141822]/95 hover:bg-[#e11d48] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#232a3b] shadow-lg transition active:scale-95"
                          title="Xem nhanh trong modal"
                        >
                          <Eye size={13} /> Xem nhanh
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="pointer-events-auto bg-[#e11d48] hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg transition active:scale-95"
                        >
                          Chi tiết <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <Link
                          to={`/product/${product.id}`}
                          className="font-bold text-white text-sm line-clamp-1 hover:text-[#e11d48] transition block"
                        >
                          {product.name}
                        </Link>
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

                  {/* Add to Cart CTA với hiệu ứng btn-shine-sweep */}
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="w-full bg-[#1b212f] hover:bg-[#e11d48] text-white font-black text-xs py-2.5 rounded-xl border border-[#232a3b] hover:border-[#e11d48] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-rose-900/30 active:scale-[0.98] cursor-pointer btn-shine-sweep"
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

      {/* CartDrawer Slide-Over Độc Lập (Day 6 Feature) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        currentUser={currentUser}
        fetchProducts={fetchProducts}
        fetchOrders={fetchOrders}
        fetchStats={fetchStats}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Order History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
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
                      {o.payment_method && (
                        <p className="text-[11px] text-slate-500">
                          Thanh toán: <strong className="text-white">{o.payment_method === 'vietqr' ? 'Chuyển khoản VietQR' : 'Tiền mặt khi nhận hàng (COD)'}</strong>
                        </p>
                      )}
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

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailModalProduct}
        isOpen={!!detailModalProduct}
        onClose={() => setDetailModalProduct(null)}
        onAddToCart={addToCart}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
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
