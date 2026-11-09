import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, Sparkles } from 'lucide-react';

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  categories = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: 1,
    brand: 'Nike',
    category_type: 'shoes',
    stud_type: 'TF',
    tier: 'Pro',
    season: '2024-2025',
    version_type: 'player',
    price: 500000,
    image_url: '',
    description: '',
    variants: [
      { size: '39', stock: 10 },
      { size: '40', stock: 10 },
      { size: '41', stock: 10 }
    ]
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        category_id: editingProduct.category_id || (categories[0]?.id || 1),
        brand: editingProduct.brand || 'Nike',
        category_type: editingProduct.category_type || 'shoes',
        stud_type: editingProduct.stud_type || 'TF',
        tier: editingProduct.tier || 'Pro',
        season: editingProduct.season || '2024-2025',
        version_type: editingProduct.version_type || 'player',
        price: editingProduct.price || 0,
        image_url: editingProduct.image_url || '',
        description: editingProduct.description || '',
        variants:
          editingProduct.variants && editingProduct.variants.length > 0
            ? editingProduct.variants.map((v) => ({ size: v.size, stock: v.stock }))
            : [{ size: '40', stock: 5 }]
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category_id: categories[0]?.id || 1,
        brand: 'Nike',
        category_type: 'shoes',
        stud_type: 'TF',
        tier: 'Pro',
        season: '2024-2025',
        version_type: 'player',
        price: 1500000,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        description: '',
        variants: [
          { size: '39', stock: 5 },
          { size: '40', stock: 8 },
          { size: '41', stock: 10 },
          { size: '42', stock: 6 },
          { size: '43', stock: 4 }
        ]
      });
    }
  }, [editingProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleApplyPresetSizes = (type) => {
    if (type === 'shoes') {
      setFormData((prev) => ({
        ...prev,
        category_type: 'shoes',
        variants: [
          { size: '39', stock: 5 },
          { size: '40', stock: 8 },
          { size: '41', stock: 10 },
          { size: '42', stock: 6 },
          { size: '43', stock: 4 }
        ]
      }));
    } else if (type === 'kits') {
      setFormData((prev) => ({
        ...prev,
        category_type: 'kit',
        variants: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 15 },
          { size: 'XL', stock: 8 }
        ]
      }));
    }
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: '42', stock: 5 }]
    }));
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#141822] border border-[#232a3b] rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#232a3b] bg-[#0d1017]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/30 flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới Vào Kho'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Cập nhật thông số giày bóng đá, đinh, hãng và các biến thể size
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1f2637] hover:bg-[#2e384f] text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Tên sản phẩm */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Tên Sản Phẩm *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Nike Mercurial Vapor 15 Pro TF"
              className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#e11d48]"
            />
          </div>

          {/* SKU & Danh Mục */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Mã SKU *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#e11d48]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Danh Mục *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#e11d48] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hãng & Phân loại */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Thương Hiệu</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#e11d48] cursor-pointer"
              >
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Puma">Puma</option>
                <option value="Mizuno">Mizuno</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Phân Loại</label>
              <select
                value={formData.category_type}
                onChange={(e) => setFormData({ ...formData, category_type: e.target.value })}
                className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#e11d48] cursor-pointer"
              >
                <option value="shoes">Giày Đá Bóng</option>
                <option value="kit">Áo Đấu CLB / ĐTQG</option>
              </select>
            </div>
            <div>
              {formData.category_type === 'shoes' ? (
                <>
                  <label className="block font-bold text-slate-300 mb-1">Mặt Đinh</label>
                  <select
                    value={formData.stud_type || 'TF'}
                    onChange={(e) => setFormData({ ...formData, stud_type: e.target.value })}
                    className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#e11d48] cursor-pointer"
                  >
                    <option value="TF">Đinh TF (Sân cỏ nhân tạo)</option>
                    <option value="FG">Đinh FG (Sân cỏ tự nhiên)</option>
                    <option value="IC">Đinh IC (Futsal / Sàn gỗ)</option>
                  </select>
                </>
              ) : (
                <>
                  <label className="block font-bold text-slate-300 mb-1">Phiên Bản Áo</label>
                  <select
                    value={formData.version_type || 'player'}
                    onChange={(e) => setFormData({ ...formData, version_type: e.target.value })}
                    className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#e11d48] cursor-pointer"
                  >
                    <option value="player">Bản Player (Cầu thủ)</option>
                    <option value="fan">Bản Fan (Cổ động viên)</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Giá Bán & Link Ảnh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Giá Bán (VND) *</label>
              <input
                type="number"
                required
                min={0}
                step={10000}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#e11d48]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">URL Hình Ảnh</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#e11d48]"
              />
            </div>
          </div>

          {/* Mô tả sản phẩm */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Mô Tả Sản Phẩm</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Chất liệu da tổng hợp, công nghệ đệm Nike Air Zoom phản hồi lực..."
              className="w-full bg-[#0d1017] border border-[#232a3b] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#e11d48]"
            />
          </div>

          {/* Dynamic Size Variants */}
          <div className="border border-[#232a3b] p-4 rounded-xl bg-[#0d1017] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#232a3b]">
              <div>
                <label className="font-bold text-emerald-400 block text-xs">
                  Cấu Hình Tồn Kho Theo Size
                </label>
                <span className="text-[10px] text-slate-400">
                  Hệ thống tự động trừ tồn kho theo từng kích thước này
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPresetSizes('shoes')}
                  className="px-2 py-1 rounded bg-[#1f2637] hover:bg-[#2e384f] text-[10px] text-slate-300 font-bold"
                >
                  Size Giày (39-43)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetSizes('kits')}
                  className="px-2 py-1 rounded bg-[#1f2637] hover:bg-[#2e384f] text-[10px] text-slate-300 font-bold"
                >
                  Size Áo (S-XL)
                </button>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-2.5 py-1 rounded bg-[#e11d48]/10 border border-[#e11d48]/40 text-[#e11d48] hover:bg-[#e11d48]/20 font-bold text-[10px] flex items-center gap-1"
                >
                  <Plus size={11} /> Thêm Size
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {formData.variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#141822] p-2 rounded-lg border border-[#232a3b]">
                  <input
                    type="text"
                    placeholder="Size"
                    value={v.size}
                    onChange={(e) => {
                      const updated = [...formData.variants];
                      updated[i].size = e.target.value;
                      setFormData({ ...formData, variants: updated });
                    }}
                    className="w-1/2 bg-[#0d1017] border border-[#232a3b] rounded-lg p-1.5 text-center font-bold text-white uppercase text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Tồn kho"
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...formData.variants];
                      updated[i].stock = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, variants: updated });
                    }}
                    className="w-1/2 bg-[#0d1017] border border-[#232a3b] rounded-lg p-1.5 text-center font-bold text-emerald-400 text-xs"
                  />
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(i)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#232a3b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#232a3b] rounded-xl text-slate-300 hover:bg-[#1f2637] transition font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#f43f5e] hover:to-[#e11d48] text-white font-black rounded-xl shadow-lg shadow-[#e11d48]/30 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              {editingProduct ? 'Lưu Cập Nhật' : 'Tạo Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
