import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import ProductFormModal from './ProductFormModal';

export default function ProductManager({
  products = [],
  categories = [],
  onSaveProduct,
  onDeleteProduct
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStud, setSelectedStud] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const filteredProducts = products.filter((p) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query);

    const matchesCategory = selectedCategory
      ? String(p.category_id) === String(selectedCategory)
      : true;

    const matchesBrand = selectedBrand
      ? p.brand?.toLowerCase() === selectedBrand.toLowerCase()
      : true;

    const matchesStud = selectedStud
      ? p.stud_type?.toUpperCase() === selectedStud.toUpperCase()
      : true;

    return matchesSearch && matchesCategory && matchesBrand && matchesStud;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData) => {
    onSaveProduct(formData, editingProduct?.id);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Quản Lý Sản Phẩm & Biến Thể Size Kho
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cập nhật cấu hình giày bóng đá, đinh TF/FG/IC, áo đấu CLB và quản lý tồn kho từng size.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#f43f5e] hover:to-[#e11d48] text-white text-xs font-black shadow-lg shadow-[#e11d48]/30 transition hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus size={16} />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-[#141822] p-3 rounded-2xl border border-[#232a3b] shadow-lg">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo Tên hoặc SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#0d1017] border border-[#232a3b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e11d48]"
          />
        </div>

        {/* Danh Mục */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#0d1017] border border-[#232a3b] text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e11d48] cursor-pointer"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Thương Hiệu */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="bg-[#0d1017] border border-[#232a3b] text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e11d48] cursor-pointer"
        >
          <option value="">Tất cả thương hiệu</option>
          <option value="Nike">Nike</option>
          <option value="Adidas">Adidas</option>
          <option value="Puma">Puma</option>
          <option value="Mizuno">Mizuno</option>
        </select>

        {/* Loại Đinh */}
        <select
          value={selectedStud}
          onChange={(e) => setSelectedStud(e.target.value)}
          className="bg-[#0d1017] border border-[#232a3b] text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e11d48] cursor-pointer"
        >
          <option value="">Tất cả loại đinh</option>
          <option value="TF">Đinh TF (Sân cỏ nhân tạo)</option>
          <option value="FG">Đinh FG (Sân tự nhiên)</option>
          <option value="IC">Đinh IC (Futsal)</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[#141822] border border-[#232a3b] rounded-2xl shadow-xl overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Không tìm thấy sản phẩm nào khớp với tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d1017] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232a3b]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Sản Phẩm</th>
                  <th className="py-3.5 px-4 font-bold">Phân Loại</th>
                  <th className="py-3.5 px-4 font-bold">Giá Bán</th>
                  <th className="py-3.5 px-4 font-bold">Tồn Kho Từng Size</th>
                  <th className="py-3.5 px-4 font-bold text-center">Tổng Tồn</th>
                  <th className="py-3.5 px-4 font-bold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232a3b]/60">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#1a202c]/50 transition duration-150"
                  >
                    {/* Sản Phẩm (Thumbnail & Name) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url || 'https://via.placeholder.com/60'}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl border border-[#232a3b] shrink-0 bg-slate-950"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs hover:text-[#e11d48] transition cursor-pointer">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                            <span className="text-slate-400 font-mono">SKU: {p.sku}</span>
                            {p.brand && (
                              <span className="px-1.5 py-0.2 rounded bg-[#1f2637] text-slate-300 font-bold border border-[#2e384f]">
                                {p.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phân Loại */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{p.category_name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {p.stud_type && (
                          <span className="px-2 py-0.5 rounded-md bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/30 font-bold text-[10px]">
                            Đinh {p.stud_type}
                          </span>
                        )}
                        {p.version_type && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 border border-blue-800/60 font-bold text-[10px]">
                            Bản {p.version_type}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Giá Bán */}
                    <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                      {formatCurrency(p.price)}
                    </td>

                    {/* Tồn Kho Theo Size */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.variants && p.variants.length > 0 ? (
                          p.variants.map((v, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                v.stock > 2
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                                  : v.stock > 0
                                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                                    : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                              }`}
                            >
                              Size {v.size}: {v.stock}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Chưa có size</span>
                        )}
                      </div>
                    </td>

                    {/* Tổng Tồn Kho */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          p.total_stock > 0
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {p.total_stock > 0 ? `${p.total_stock} đôi` : 'Hết hàng'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-[#1f2637] hover:bg-[#2e384f] text-blue-400 hover:text-blue-300 transition"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-[#1f2637] hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-800 transition"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Product */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleModalSubmit}
        editingProduct={editingProduct}
        categories={categories}
      />
    </div>
  );
}
