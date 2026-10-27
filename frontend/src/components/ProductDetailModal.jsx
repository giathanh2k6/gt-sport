import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, CheckCircle, ShieldCheck, Truck, RotateCcw, Ruler, Flame, Zap, ExternalLink } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenSizeGuide
}) {
  const [selectedSize, setSelectedSize] = useState(null);
  const toast = useToast();

  if (!isOpen || !product) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const handleAdd = () => {
    if (!selectedSize) {
      toast.warning('⚠️ Vui lòng chọn một kích thước (Size) trước khi thêm vào giỏ hàng!');
      return;
    }
    onAddToCart(product, selectedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141822] border border-[#232a3b] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Left: Product Image */}
        <div className="md:w-1/2 relative bg-[#0a0c10] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#232a3b]">
          <img
            src={product.image_url || 'https://via.placeholder.com/600'}
            alt={product.name}
            className="w-full max-h-80 md:max-h-96 object-contain rounded-xl hover:scale-105 transition-transform duration-500"
          />

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.brand && (
              <span className="bg-[#0a0c10]/90 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#232a3b]">
                {product.brand}
              </span>
            )}
            {product.tier && (
              <span className="bg-amber-500/90 text-black text-[10px] font-black px-2 py-0.5 rounded shadow uppercase">
                Tier: {product.tier}
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4">
            {product.stud_type ? (
              <span className="bg-[#e11d48] text-white text-[11px] font-black tracking-widest px-2.5 py-1 rounded-md shadow-md uppercase">
                Đinh {product.stud_type}
              </span>
            ) : product.version_type ? (
              <span className="bg-[#e11d48] text-white text-[11px] font-black tracking-wider px-2 py-0.5 rounded-md shadow-md uppercase">
                Bản {product.version_type === 'player' ? 'Cầu Thủ' : 'Fan C1'}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-5">
          <div className="space-y-4">
            {/* Top close button & full page link */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                SKU: <span className="text-white">{product.sku}</span>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-[#1b212f] px-2.5 py-1 rounded-lg transition"
                  title="Mở toàn màn hình"
                >
                  <ExternalLink size={12} /> Xem trang riêng
                </Link>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-[#1b212f] hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 flex items-center justify-center transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Product Title & Price */}
            <div>
              <h2 className="text-xl font-black text-white leading-snug">
                {product.name}
              </h2>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-black text-[#e11d48]">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs text-slate-400">Đã bao gồm VAT & Hộp chính hãng</span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-300 leading-relaxed bg-[#0a0c10] p-3.5 rounded-xl border border-[#232a3b]">
              <p>{product.description || 'Sản phẩm thể thao cao cấp chính hãng, phân phối bởi GT Sport.'}</p>
            </div>

            {/* Select Size Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Chọn Kích Thước (Size):
                </label>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                >
                  <Ruler size={13} /> Xem hướng dẫn đo size
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants && product.variants.map((v) => {
                  const isOutOfStock = v.stock <= 0;
                  const isSelected = selectedSize === v.size;

                  return (
                    <button
                      key={v.size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(v.size)}
                      className={`min-w-12 px-3 py-2 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
                        isOutOfStock
                          ? 'bg-[#141822]/40 text-slate-600 border-[#232a3b] cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-lg shadow-rose-950/50'
                          : 'bg-[#0a0c10] text-slate-300 border-[#232a3b] hover:border-slate-500'
                      }`}
                    >
                      <span>{v.size}</span>
                      <span className="text-[9px] font-normal opacity-80">
                        {isOutOfStock ? 'Hết' : `${v.stock} sẵn`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 bg-[#0a0c10] p-2 rounded-lg border border-[#232a3b]">
                <Truck size={14} className="text-[#e11d48]" /> Giao hàng toàn quốc
              </div>
              <div className="flex items-center gap-1.5 bg-[#0a0c10] p-2 rounded-lg border border-[#232a3b]">
                <RotateCcw size={14} className="text-[#e11d48]" /> Đổi trả 7 ngày
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="pt-4 border-t border-[#232a3b]">
            <button
              onClick={handleAdd}
              className="w-full bg-[#e11d48] hover:bg-rose-600 active:scale-95 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 cursor-pointer"
            >
              <ShoppingBag size={16} /> Thêm Vào Giỏ Hàng Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
