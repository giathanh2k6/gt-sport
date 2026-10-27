import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  AlertTriangle,
  Flame,
  Check,
  Star,
  Info,
  Footprints,
  Eye,
  CheckCircle2
} from 'lucide-react';
import Navbar from './Navbar';
import SizeGuideModal from './SizeGuideModal';
import { useToast } from '../context/ToastContext';

export default function ProductDetailPage({
  products,
  currentUser,
  onLogout,
  onOpenAuth,
  cart,
  setCart,
  isCartOpen,
  setIsCartOpen,
  addToCart
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Lấy chi tiết sản phẩm từ danh sách có sẵn hoặc gọi API
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const found = products?.find((p) => String(p.id) === String(id));
    if (found) {
      setProduct(found);
      setLoading(false);
      setSelectedSize('');
    } else {
      setLoading(true);
      axios
        .get(`/api/products/${id}`)
        .then((res) => {
          setProduct(res.data);
          setLoading(false);
          setSelectedSize('');
        })
        .catch((err) => {
          console.error('Lỗi tải sản phẩm:', err);
          toast.error('Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng kinh doanh!');
          setLoading(false);
        });
    }
  }, [id, products]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Danh sách hình ảnh mẫu bổ trợ cho sản phẩm (Gallery view)
  const productImages = useMemo(() => {
    if (!product) return [];
    const mainImg = product.image_url || 'https://via.placeholder.com/600';
    // Mô phỏng 3 góc chụp thể thao sắc nét
    return [
      mainImg,
      mainImg + '&angle=side',
      mainImg + '&angle=sole'
    ];
  }, [product]);

  // Các sản phẩm tương tự (cùng brand hoặc cùng stud_type)
  const relatedProducts = useMemo(() => {
    if (!product || !products) return [];
    return products
      .filter((p) => p.id !== product.id && (p.brand === product.brand || p.stud_type === product.stud_type || p.category_type === product.category_type))
      .slice(0, 4);
  }, [product, products]);

  const handleAddToCartClick = () => {
    if (!selectedSize) {
      toast.warning('⚠️ Vui lòng chọn Kích thước (Size) trước khi thêm vào giỏ hàng!');
      return;
    }
    const variant = product.variants?.find((v) => v.size === selectedSize);
    if (!variant || variant.stock <= 0) {
      toast.error(`❌ Size ${selectedSize} hiện tại đã hết hàng trong kho!`);
      return;
    }

    addToCart(product, selectedSize);
    toast.success(`Đã thêm ${product.name} (Size ${selectedSize}) vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.warning('⚠️ Vui lòng chọn Kích thước (Size) trước khi thanh toán!');
      return;
    }
    const variant = product.variants?.find((v) => v.size === selectedSize);
    if (!variant || variant.stock <= 0) {
      toast.error(`❌ Size ${selectedSize} hiện tại đã hết hàng trong kho!`);
      return;
    }

    addToCart(product, selectedSize);
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col justify-between">
        <Navbar cartCount={cart?.reduce((sum, item) => sum + item.quantity, 0) || 0} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e11d48] mx-auto"></div>
            <p className="text-sm font-bold text-slate-400">Đang tải chi tiết sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col justify-between">
        <Navbar cartCount={cart?.reduce((sum, item) => sum + item.quantity, 0) || 0} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <p className="text-5xl">⚽</p>
          <h2 className="text-2xl font-black text-white">Không tìm thấy thông tin sản phẩm!</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Mẫu giày hoặc áo đấu bạn tìm kiếm có thể đã đổi mã hoặc tạm thời hết hàng trên toàn hệ thống.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-[#e11d48] hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition"
          >
            Quay Về Cửa Hàng
          </Link>
        </div>
      </div>
    );
  }

  const isKit = product.category_type === 'kit';
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col justify-between selection:bg-[#e11d48] selection:text-white">
      {/* Navbar Header */}
      <Navbar
        cartCount={cart?.reduce((sum, item) => sum + item.quantity, 0) || 0}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-white transition flex items-center gap-1">
            <ChevronLeft size={16} /> Cửa Hàng
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">
            {isKit ? 'Áo Đấu CLB' : `Giày Đinh ${product.stud_type || 'TF'}`}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-[#e11d48] truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Gallery Images (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Showcase Image */}
            <div className="relative aspect-4/3 rounded-3xl bg-[#141822] border border-[#232a3b] p-6 flex items-center justify-center overflow-hidden shadow-2xl group">
              <img
                src={productImages[activeImageIndex] || product.image_url}
                alt={product.name}
                className="w-full h-full object-contain max-h-[460px] group-hover:scale-105 transition-transform duration-500"
              />

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.brand && (
                  <span className="bg-[#0a0c10]/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-[#232a3b]">
                    {product.brand}
                  </span>
                )}
                {product.tier && (
                  <span className="bg-amber-500/90 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow">
                    Phân khúc: {product.tier}
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4">
                {product.stud_type ? (
                  <span className="bg-[#e11d48] text-white text-xs font-black tracking-widest px-3 py-1 rounded-lg shadow-lg shadow-rose-950/60 uppercase">
                    Đinh {product.stud_type}
                  </span>
                ) : product.version_type ? (
                  <span className="bg-[#e11d48] text-white text-xs font-black tracking-wider px-3 py-1 rounded-lg shadow-lg uppercase">
                    Bản {product.version_type === 'player' ? 'Cầu Thủ' : 'Fan C1'}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl bg-[#141822] border p-2 flex items-center justify-center transition shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#e11d48] shadow-lg shadow-rose-950/40 ring-2 ring-[#e11d48]/50'
                      : 'border-[#232a3b] hover:border-slate-500 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Guarantees Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-[#141822] border border-[#232a3b] p-3 rounded-2xl flex flex-col items-center text-center gap-1.5">
                <Truck size={20} className="text-[#e11d48]" />
                <span className="font-bold text-white text-[11px]">Giao Hàng 2-3 Ngày</span>
                <span className="text-[10px] text-slate-400">Toàn quốc từ 1M</span>
              </div>
              <div className="bg-[#141822] border border-[#232a3b] p-3 rounded-2xl flex flex-col items-center text-center gap-1.5">
                <RotateCcw size={20} className="text-[#e11d48]" />
                <span className="font-bold text-white text-[11px]">Đổi Size 7 Ngày</span>
                <span className="text-[10px] text-slate-400">Miễn phí nếu không vừa</span>
              </div>
              <div className="bg-[#141822] border border-[#232a3b] p-3 rounded-2xl flex flex-col items-center text-center gap-1.5">
                <ShieldCheck size={20} className="text-[#e11d48]" />
                <span className="font-bold text-white text-[11px]">Chính Hãng 100%</span>
                <span className="text-[10px] text-slate-400">Đền x10 nếu fake</span>
              </div>
              <div className="bg-[#141822] border border-[#232a3b] p-3 rounded-2xl flex flex-col items-center text-center gap-1.5">
                <Footprints size={20} className="text-[#e11d48]" />
                <span className="font-bold text-white text-[11px]">Bảo Hành Keo 6T</span>
                <span className="text-[10px] text-slate-400">Hỗ trợ khâu đế chuẩn</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Size Selection, CTA (5 cols) */}
          <div className="lg:col-span-5 space-y-6 bg-[#141822] border border-[#232a3b] p-6 sm:p-8 rounded-3xl shadow-xl">
            {/* Header info */}
            <div className="space-y-2 border-b border-[#232a3b] pb-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="tracking-widest uppercase">MÃ SKU: <strong className="text-white">{product.sku}</strong></span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${totalStock > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                  {totalStock > 0 ? `Sẵn hàng (${totalStock} chiếc)` : 'Tạm hết hàng'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                {product.name}
              </h1>

              {/* Price section */}
              <div className="pt-2 flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#e11d48]">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.price * 1.15)}
                </span>
                <span className="bg-rose-500/20 text-[#e11d48] text-[10px] font-black px-2 py-0.5 rounded">
                  TIẾT KIỆM 15%
                </span>
              </div>
            </div>

            {/* Smart Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <span>{isKit ? 'Chọn Size Áo Đấu:' : 'Chọn Size Giày Đá Bóng:'}</span>
                  {selectedSize && (
                    <span className="text-[#e11d48] font-black">({selectedSize})</span>
                  )}
                </label>

                {/* Nút mở Bảng hướng dẫn đo size */}
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Ruler size={14} /> Hướng dẫn đo size
                </button>
              </div>

              {/* Variants grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.variants?.map((v) => {
                  const isOutOfStock = v.stock <= 0;
                  const isLowStock = v.stock > 0 && v.stock <= 2;
                  const isSelected = selectedSize === v.size;

                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(v.size)}
                      className={`relative p-2.5 rounded-xl text-xs font-black border transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        isOutOfStock
                          ? 'bg-[#0a0c10]/40 text-slate-600 border-[#1f2637] cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-lg shadow-rose-950/60 ring-2 ring-rose-400/50'
                          : 'bg-[#0a0c10] text-slate-200 border-[#232a3b] hover:border-slate-500'
                      }`}
                    >
                      <span className="text-sm">{v.size}</span>
                      <span className={`text-[9px] font-medium ${isLowStock ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                        {isOutOfStock ? 'Hết' : isLowStock ? `Còn ${v.stock}!` : `${v.stock} sẵn`}
                      </span>

                      {/* Scarcity badge nếu còn ít */}
                      {isLowStock && (
                        <span className="absolute -top-1.5 -right-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded-full animate-pulse">
                          HOT
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scarcity Alert Message */}
              {selectedSize && (() => {
                const curVariant = product.variants?.find((v) => v.size === selectedSize);
                if (curVariant && curVariant.stock <= 2 && curVariant.stock > 0) {
                  return (
                    <div className="p-2.5 bg-amber-950/30 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                      <AlertTriangle size={15} className="shrink-0" />
                      <span>Cảnh báo: Size <strong>{selectedSize}</strong> chỉ còn <strong>{curVariant.stock} đôi duy nhất</strong> trong kho. Hãy đặt ngay!</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Action Buttons: Add to cart & Buy now */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  className="flex-1 bg-[#1b212f] hover:bg-[#252d40] text-white font-black py-3.5 px-4 rounded-2xl border border-[#232a3b] hover:border-[#e11d48] transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md active:scale-95 cursor-pointer"
                >
                  <ShoppingBag size={17} className="text-[#e11d48]" />
                  <span>Thêm Vào Giỏ</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#e11d48] hover:bg-rose-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-xl shadow-rose-950/60 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 cursor-pointer"
                >
                  <Zap size={17} />
                  <span>Mua Ngay</span>
                </button>
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div className="pt-4 border-t border-[#232a3b] space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Info size={15} className="text-[#e11d48]" /> Thông Số Kỹ Thuật:
              </h4>

              <div className="space-y-2 bg-[#0a0c10] p-4 rounded-2xl border border-[#232a3b]">
                <div className="flex justify-between py-1 border-b border-[#1a1f2b]">
                  <span className="text-slate-400">Thương hiệu:</span>
                  <span className="font-bold text-white">{product.brand || 'Chính hãng'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1f2b]">
                  <span className="text-slate-400">{isKit ? 'Mùa giải:' : 'Loại mặt sân:'}</span>
                  <span className="font-bold text-[#e11d48]">
                    {isKit ? product.season || '2024/25' : `Đinh ${product.stud_type || 'TF'} (${product.stud_type === 'TF' ? 'Sân cỏ nhân tạo 5-7 người' : product.stud_type === 'FG' ? 'Sân cỏ tự nhiên 11 người' : 'Sàn gỗ Futsal'})`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1f2b]">
                  <span className="text-slate-400">Phân khúc / Phiên bản:</span>
                  <span className="font-bold text-white">
                    {product.tier ? `Bản ${product.tier}` : product.version_type === 'player' ? 'Player Issue (Bản cầu thủ)' : 'Fan Issue (Cổ động viên)'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Phom chân khuyến nghị:</span>
                  <span className="font-bold text-emerald-400">
                    {product.brand === 'Mizuno' ? 'Chân bè ngang nhiều' : product.brand === 'Nike' ? 'Chân thon / thon vừa' : 'Chân bình thường'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description summary */}
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-300">Mô Tả Sản Phẩm:</h4>
              <p className="bg-[#0a0c10] p-3.5 rounded-2xl border border-[#232a3b]">
                {product.description || 'Sản phẩm thể thao cao cấp chính hãng, phân phối bởi GT Sport.'}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-[#1a1f2b] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                  <Flame size={20} className="text-[#e11d48]" />
                  <span>Sản Phẩm Tương Tự Có Thể Bạn Thích</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Các mẫu cùng thương hiệu {product.brand} hoặc cùng loại đinh</p>
              </div>
              <Link to="/" className="text-xs font-bold text-rose-400 hover:text-white transition">
                Xem tất cả &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/product/${rel.id}`)}
                  className="bg-[#141822] border border-[#232a3b] hover:border-[#e11d48]/70 rounded-2xl p-4 space-y-3 cursor-pointer group transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20"
                >
                  <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-[#0a0c10]">
                    <img
                      src={rel.image_url}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {rel.brand && (
                      <span className="absolute top-2 left-2 bg-[#0a0c10]/90 text-white text-[10px] font-black px-2 py-0.5 rounded border border-[#232a3b]">
                        {rel.brand}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs line-clamp-1 group-hover:text-[#e11d48] transition">
                      {rel.name}
                    </h4>
                    <div className="text-sm font-black text-[#e11d48] mt-1">
                      {formatCurrency(rel.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
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
