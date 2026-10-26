import React, { useState } from 'react';
import { Filter, SlidersHorizontal, X, ArrowUpDown, Tag, Ruler, CircleDollarSign } from 'lucide-react';

export default function ProductFilterBar({
  selectedStudType,
  setSelectedStudType,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedSizeFilter,
  setSelectedSizeFilter,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  activeFilterCount,
  onResetFilters
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const brands = ['Nike', 'Adidas', 'Puma', 'Mizuno', 'Jogarbola'];
  const shoeSizes = ['39', '40', '41', '42', '43'];
  const kitSizes = ['S', 'M', 'L', 'XL'];

  const priceOptions = [
    { label: 'Tất cả mức giá', value: 'all' },
    { label: 'Dưới 1.000.000đ', value: 'under-1m' },
    { label: '1.000.000đ - 2.000.000đ', value: '1m-2m' },
    { label: '2.000.000đ - 3.000.000đ', value: '2m-3m' },
    { label: 'Trên 3.000.000đ', value: 'over-3m' }
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá: Thấp đến Cao', value: 'price-asc' },
    { label: 'Giá: Cao đến Thấp', value: 'price-desc' },
    { label: 'Tên A - Z', value: 'name-asc' }
  ];

  return (
    <div className="bg-[#141822] border border-[#232a3b] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Bar: Bộ lọc chính & Toggle mở rộng */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#e11d48]/20 flex items-center justify-center text-[#e11d48]">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              Bộ Lọc Đa Tiêu Chí
              {activeFilterCount > 0 && (
                <span className="bg-[#e11d48] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">Lọc theo đinh giày, hãng, size & phân khúc giá</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Xóa Bộ Lọc */}
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/50 px-3 py-1.5 rounded-xl transition"
            >
              <X size={14} /> Xóa bộ lọc
            </button>
          )}

          {/* Sắp xếp nhanh */}
          <div className="flex items-center gap-1.5 bg-[#0a0c10] border border-[#232a3b] px-3 py-1.5 rounded-xl text-xs">
            <ArrowUpDown size={14} className="text-[#e11d48]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#141822] text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle mở rộng bộ lọc trên mobile */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden flex items-center gap-1 text-xs font-bold bg-[#1b212f] hover:bg-[#232a3b] text-slate-200 px-3 py-1.5 rounded-xl border border-[#232a3b] transition"
          >
            <SlidersHorizontal size={14} /> {isExpanded ? 'Thu gọn' : 'Thêm bộ lọc'}
          </button>
        </div>
      </div>

      {/* Bộ Lọc Chi Tiết (Hiển thị desktop & khi toggle trên mobile) */}
      <div className={`space-y-4 pt-2 border-t border-[#1f2637] ${isExpanded ? 'block' : 'hidden md:block'}`}>
        {/* 1. Lọc theo Thương Hiệu (Brand) */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
            <Tag size={12} className="text-[#e11d48]" /> Thương Hiệu:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedBrand('')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                !selectedBrand
                  ? 'bg-[#e11d48] text-white shadow-md shadow-rose-950/50'
                  : 'bg-[#0a0c10] text-slate-300 hover:bg-[#1b212f] border border-[#232a3b]'
              }`}
            >
              Tất cả hãng
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  selectedBrand === b
                    ? 'bg-[#e11d48] text-white shadow-md shadow-rose-950/50'
                    : 'bg-[#0a0c10] text-slate-300 hover:bg-[#1b212f] border border-[#232a3b]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Lọc theo Size (Còn hàng) */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
            <Ruler size={12} className="text-[#e11d48]" /> Kích Thước (Size còn hàng):
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedSizeFilter('')}
              className={`text-xs font-bold px-3 py-1 rounded-xl transition ${
                !selectedSizeFilter
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#0a0c10] text-slate-300 hover:bg-[#1b212f] border border-[#232a3b]'
              }`}
            >
              Tất cả size
            </button>
            
            <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase hidden sm:inline">Giày:</span>

            {shoeSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSizeFilter(selectedSizeFilter === s ? '' : s)}
                className={`text-xs font-bold w-9 h-8 rounded-lg flex items-center justify-center transition ${
                  selectedSizeFilter === s
                    ? 'bg-[#e11d48] text-white ring-2 ring-rose-400'
                    : 'bg-[#0a0c10] text-slate-300 hover:bg-[#1b212f] border border-[#232a3b]'
                }`}
              >
                {s}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase hidden sm:inline">Áo:</span>

            {kitSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSizeFilter(selectedSizeFilter === s ? '' : s)}
                className={`text-xs font-bold w-9 h-8 rounded-lg flex items-center justify-center transition ${
                  selectedSizeFilter === s
                    ? 'bg-[#e11d48] text-white ring-2 ring-rose-400'
                    : 'bg-[#0a0c10] text-slate-300 hover:bg-[#1b212f] border border-[#232a3b]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Lọc theo Mức Giá */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
            <CircleDollarSign size={12} className="text-[#e11d48]" /> Khoảng Giá:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {priceOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPriceRange(opt.value)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  priceRange === opt.value
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#0a0c10] text-slate-300 hover:bg-[#1b212f] border border-[#232a3b]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
