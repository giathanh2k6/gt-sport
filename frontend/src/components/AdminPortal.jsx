import React, { useState } from "react";
import {
  DollarSign,
  Package,
  ShoppingBag,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import axios from "axios";

export default function AdminPortal({
  stats,
  products,
  categories,
  orders,
  fetchProducts,
  fetchOrders,
  fetchStats,
}) {
  const [adminTab, setAdminTab] = useState("overview"); // overview, products, orders
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default true for easy viewing, can lock with login
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: 1,
    price: "",
    image_url: "",
    description: "",
    variants: [
      { size: "39", stock: 10 },
      { size: "40", stock: 10 },
    ],
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (fetchStats) fetchStats();
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái đơn hàng!");
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category_id: categories[0]?.id || 1,
      price: 500000,
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      description: "",
      variants: [
        { size: "39", stock: 5 },
        { size: "40", stock: 5 },
        { size: "41", stock: 5 },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id,
      price: product.price,
      image_url: product.image_url || "",
      description: product.description || "",
      variants:
        product.variants && product.variants.length > 0
          ? product.variants.map((v) => ({ size: v.size, stock: v.stock }))
          : [{ size: "39", stock: 0 }],
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?")
    ) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts();
        if (fetchStats) fetchStats();
      } catch (error) {
        alert("Lỗi khi xóa sản phẩm!");
      }
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, formData);
      } else {
        await axios.post("/api/products", formData);
      }
      setIsModalOpen(false);
      fetchProducts();
      if (fetchStats) fetchStats();
    } catch (error) {
      alert("Lỗi khi lưu sản phẩm!");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const query = orderSearchTerm.toLowerCase();
    return (
      o.customer_name.toLowerCase().includes(query) ||
      o.customer_phone.includes(query) ||
      `#ord-${o.id}`.includes(query)
    );
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? p.category_id === parseInt(selectedCategory)
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-center py-2 mb-4 border-b border-slate-800 pb-4">
            <img
              src="/logoGTSport.png"
              alt="GT Sport"
              className="h-16 w-auto object-contain"
            />
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <button
              onClick={() => setAdminTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                adminTab === "overview"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <DollarSign className="w-4 h-4" /> Báo Cáo Doanh Thu & Kho
            </button>

            <button
              onClick={() => setAdminTab("orders")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
                adminTab === "orders"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" /> Đơn Hàng Từ Khách
              </div>
              {orders.filter((o) => o.status === "pending").length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {orders.filter((o) => o.status === "pending").length} mới
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminTab("products")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                adminTab === "products"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Package className="w-4 h-4" /> Quản Lý Kho & Size
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2">
            <img
              src="/AvtAdmin.jpg"
              alt="Avatar Admin"
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-md"
            />
            <div>
              <p className="font-bold text-slate-200">Nguyễn Gia Thanh </p>
              <p className="text-[10px] text-slate-500">Quyền: Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
        {/* TAB 1: OVERVIEW & REVENUE */}
        {adminTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">
                Báo Cáo Doanh Thu & Tình Hình Kinh Doanh
              </h2>
              <p className="text-xs text-slate-400">
                Thống kê tổng quan đơn hàng từ người mua, doanh số và tồn kho
                sản phẩm.
              </p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Tổng Doanh Thu
                  </span>
                  <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {formatCurrency(stats.total_revenue)}
                </div>
                <span className="text-[11px] text-slate-400">
                  {stats.total_orders || 0} đơn đã hoàn thành
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Tổng Số Đơn Hàng
                  </span>
                  <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {orders.length} Đơn
                </div>
                <span className="text-[11px] text-amber-400">
                  {orders.filter((o) => o.status === "pending").length} đơn đang
                  chờ duyệt
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Tổng Mã Sản Phẩm
                  </span>
                  <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {stats.total_products || 0} Sản phẩm
                </div>
                <span className="text-[11px] text-slate-400">
                  Giày TF/FG & Áo đấu CLB
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Cảnh Báo Hết Size
                  </span>
                  <div className="w-8 h-8 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {(stats.low_stock_alerts || []).length} Size
                </div>
                <span className="text-[11px] text-slate-400">
                  Tồn kho ≤ 2 chiếc
                </span>
              </div>
            </div>

            {/* Warning Stock List */}
            {stats.low_stock_alerts && stats.low_stock_alerts.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4">
                <h3 className="font-bold text-amber-300 text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Cảnh Báo: Các Size Sản Phẩm Sắp Hết Hàng Cần Nhập Thêm:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {stats.low_stock_alerts.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/90 p-3 rounded-lg border border-amber-900/60 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-xs text-white">
                          {item.name}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          Kích thước:{" "}
                          <strong className="text-amber-300">
                            Size {item.size}
                          </strong>
                        </span>
                      </div>
                      <span className="bg-red-950 text-red-400 border border-red-800 text-xs font-black px-2 py-0.5 rounded">
                        Còn {item.stock} sp
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders List Preview */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-white">
                  Đơn Hàng Khách Vừa Đặt Gần Đây
                </h3>
                <button
                  onClick={() => setAdminTab("orders")}
                  className="text-xs text-emerald-400 font-bold hover:underline"
                >
                  Xem tất cả đơn hàng →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Mã Đơn</th>
                      <th className="py-3 px-3">Khách Hàng</th>
                      <th className="py-3 px-3">Số Điện Thoại</th>
                      <th className="py-3 px-3">Địa Chỉ Giao Hàng</th>
                      <th className="py-3 px-3">Tổng Tiền</th>
                      <th className="py-3 px-3">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-700/30">
                        <td className="py-3 px-3 font-bold text-emerald-400">
                          #ORD-{o.id}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">
                          {o.customer_name}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {o.customer_phone}
                        </td>
                        <td className="py-3 px-3 text-slate-400 max-w-xs truncate">
                          {o.customer_address}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-400">
                          {formatCurrency(o.total_price)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              o.status === "completed"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : o.status === "shipping"
                                  ? "bg-blue-950 text-blue-400 border border-blue-800"
                                  : o.status === "cancelled"
                                    ? "bg-red-950 text-red-400 border border-red-800"
                                    : "bg-amber-950 text-amber-400 border border-amber-800"
                            }`}
                          >
                            {o.status === "completed"
                              ? "Hoàn thành"
                              : o.status === "shipping"
                                ? "Đang giao"
                                : o.status === "cancelled"
                                  ? "Đã hủy"
                                  : "Chờ xử lý"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {adminTab === "orders" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Quản Lý Chi Tiết Đơn Hàng Khách Đặt
                </h2>
                <p className="text-xs text-slate-400">
                  Danh sách đầy đủ họ tên, SĐT, địa chỉ nhận hàng & cập nhật
                  trạng thái đơn.
                </p>
              </div>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên/SĐT/Mã đơn..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Mã Đơn</th>
                      <th className="py-3 px-3">Tên Khách Hàng</th>
                      <th className="py-3 px-3">Số Điện Thoại</th>
                      <th className="py-3 px-3">Địa Chỉ Nhận Hàng</th>
                      <th className="py-3 px-3">Tổng Tiền Thanh Toán</th>
                      <th className="py-3 px-3">Trạng Thái Đơn</th>
                      <th className="py-3 px-3 text-right">Hành Động Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredOrders.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-slate-700/40 transition"
                      >
                        <td className="py-3 px-3 font-bold text-emerald-400">
                          #ORD-{o.id}
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {o.customer_name}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono">
                          {o.customer_phone}
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-xs">
                          {o.customer_address}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-400 text-sm">
                          {formatCurrency(o.total_price)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              o.status === "completed"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : o.status === "shipping"
                                  ? "bg-blue-950 text-blue-400 border border-blue-800"
                                  : o.status === "cancelled"
                                    ? "bg-red-950 text-red-400 border border-red-800"
                                    : "bg-amber-950 text-amber-400 border border-amber-800"
                            }`}
                          >
                            {o.status === "completed"
                              ? "✓ Đã Hoàn Thành"
                              : o.status === "shipping"
                                ? "🚚 Đang Giao Hàng"
                                : o.status === "cancelled"
                                  ? "✕ Đã Hủy Đơn"
                                  : "⏳ Chờ Xử Lý"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              handleStatusChange(o.id, e.target.value)
                            }
                            className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="shipping">Đang giao hàng</option>
                            <option value="completed">
                              Hoàn thành (Cộng doanh thu)
                            </option>
                            <option value="cancelled">Hủy đơn</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & SIZE INVENTORY */}
        {adminTab === "products" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Quản Lý Sản Phẩm & Biến Thể Size Kho
                </h2>
                <p className="text-xs text-slate-400">
                  Thêm mới, chỉnh sửa giá bán và quản lý số lượng tồn kho từng
                  Size.
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Plus className="w-4 h-4" /> Thêm Sản Phẩm Mới
              </button>
            </div>

            {/* Filter bar */}
            <div className="flex gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm / SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Table */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Sản Phẩm</th>
                      <th className="py-3 px-3">Danh Mục</th>
                      <th className="py-3 px-3">Giá Bán</th>
                      <th className="py-3 px-3">Tồn Kho Theo Size</th>
                      <th className="py-3 px-3 text-center">Tổng Tồn</th>
                      <th className="py-3 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-700/40 transition"
                      >
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img
                            src={
                              p.image_url || "https://via.placeholder.com/40"
                            }
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              SKU: {p.sku}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-medium">
                          {p.category_name}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-400">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {p.variants &&
                              p.variants.map((v, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    v.stock > 2
                                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                      : v.stock > 0
                                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                                        : "bg-red-950 text-red-400 border border-red-800"
                                  }`}
                                >
                                  Size {v.size}: {v.stock}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              p.total_stock > 0
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-red-950 text-red-400 border border-red-800"
                            }`}
                          >
                            {p.total_stock > 0
                              ? `${p.total_stock} sp`
                              : "Hết hàng"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1 text-blue-400 hover:bg-slate-700 rounded mr-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 text-red-400 hover:bg-slate-700 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 text-slate-100">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingProduct
                  ? "Chỉnh Sửa Sản Phẩm"
                  : "Thêm Sản Phẩm Mới Vào Kho"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Tên Sản Phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="VD: Nike Mercurial Superfly 9"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Mã SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Danh Mục *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category_id: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Giá Bán (VND) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    URL Hình Ảnh
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Dynamic Size Variants */}
              <div className="border border-slate-800 p-3 rounded-lg bg-slate-950 space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-emerald-400">
                    Cấu Hình Số Lượng Tồn Kho Theo Size
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        variants: [
                          ...formData.variants,
                          { size: "42", stock: 5 },
                        ],
                      })
                    }
                    className="text-emerald-400 font-bold text-[11px] hover:underline"
                  >
                    + Thêm Size
                  </button>
                </div>

                {formData.variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Size (39, 40, S, M...)"
                      value={v.size}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[i].size = e.target.value;
                        setFormData({ ...formData, variants: updated });
                      }}
                      className="w-1/2 bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                    <input
                      type="number"
                      placeholder="Số lượng tồn"
                      value={v.stock}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[i].stock = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, variants: updated });
                      }}
                      className="w-1/2 bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
