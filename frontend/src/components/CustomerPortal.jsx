import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";
import AuthModal from "./AuthModal";

export default function CustomerPortal({
  products,
  categories,
  currentUser,
  setCurrentUser,
  fetchProducts,
  fetchOrders,
  fetchStats,
  onSwitchToAdmin,
}) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Customer Delivery Form
  const [customerInfo, setCustomerInfo] = useState({
    name: currentUser ? currentUser.name : "",
    phone: currentUser ? currentUser.phone || "" : "",
    address: "",
  });

  useEffect(() => {
    if (currentUser) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: currentUser.name || "",
        phone: currentUser.phone || "",
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
      console.error("Lỗi lấy lịch sử đơn hàng:", err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const handleSelectSize = (productId, size) => {
    setSelectedSize({ ...selectedSize, [productId]: size });
  };

  const addToCart = (product) => {
    const size = selectedSize[product.id];
    if (!size) {
      alert("⚠️ Vui lòng chọn Size (kích thước) trước khi thêm vào giỏ hàng!");
      return;
    }

    const variant = product.variants
      ? product.variants.find((v) => v.size === size)
      : null;
    if (!variant || variant.stock <= 0) {
      alert(`❌ Size ${size} của sản phẩm này hiện tại đã hết hàng!`);
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => item.product_id === product.id && item.size === size,
    );
    if (existingIndex > -1) {
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
          size: size,
          quantity: 1,
        },
      ]);
    }
    setIsCartOpen(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // BẮT BUỘC ĐĂNG NHẬP THEO THỐNG NHẤT
    if (!currentUser) {
      alert(
        "🔒 Bắt buộc Khách Hàng phải Đăng nhập / Đăng ký tài khoản trước khi đặt hàng!",
      );
      setIsAuthOpen(true);
      return;
    }

    try {
      await axios.post("/api/orders", {
        user_id: currentUser.id,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        items: cart,
      });

      setOrderSuccess(true);
      setCart([]);
      fetchProducts();
      fetchOrders();
      fetchUserHistory();
      if (fetchStats) fetchStats();

      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3500);
    } catch (error) {
      alert("Lỗi khi gửi đơn hàng! Vui lòng thử lại.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory
      ? p.category_id === parseInt(selectedCategory)
      : true;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logoGTSport.png"
              alt="GT Sport"
              className="h-12 w-auto object-contain rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow"
            >
              <ShoppingCart className="w-4 h-4" /> Giỏ Hàng
              {cart.length > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <History className="w-4 h-4" /> Đơn Hàng Của Tôi
                </button>

                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                  <p className="font-bold text-white text-[11px]">
                    Chào, {currentUser.name}
                  </p>
                  <span className="text-[9px] text-slate-400">
                    Tài khoản Khách Hàng
                  </span>
                </div>

                <button
                  onClick={() => setCurrentUser(null)}
                  className="text-slate-400 hover:text-red-400 p-2 text-xs font-bold"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <User className="w-4 h-4" /> Đăng Nhập Khách Hàng
              </button>
            )}

            <button
              onClick={onSwitchToAdmin}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-teal-900 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border border-emerald-900/50">
          <div className="space-y-3 max-w-xl">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/30">
              🔥 BST Giày Sân Cỏ Nhân Tạo & Áo Đấu Mới 2024/25
            </span>
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-white">
              Nguyễn Thanh Sport - Hãy nói theo cách của bạn!
            </h2>
            <p className="text-xs text-slate-300">
              Cung cấp giày bóng đá chính hãng Nike, Adidas và đồng phục câu lạc
              bộ cao cấp.
            </p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-800/60 text-center shadow-lg">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-1" />
            <p className="font-extrabold text-sm text-white">100% Chính Hãng</p>
            <span className="text-[10px] text-slate-400">
              Đổi trả size miễn phí
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === ""
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất Cả Sản Phẩm
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id.toString())}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === c.id.toString()
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm giày / áo đấu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const currentSize = selectedSize[product.id];
            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative">
                    <img
                      src={
                        product.image_url || "https://via.placeholder.com/300"
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      {product.category_name}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="text-lg font-black text-emerald-600">
                      {formatCurrency(product.price)}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Chọn Kích Thước (Size):
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {product.variants &&
                          product.variants.map((v) => (
                            <button
                              key={v.size}
                              disabled={v.stock <= 0}
                              onClick={() =>
                                handleSelectSize(product.id, v.size)
                              }
                              className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                                v.stock <= 0
                                  ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through"
                                  : currentSize === v.size
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500"
                              }`}
                            >
                              Size {v.size} {v.stock <= 0 ? "(Hết)" : ""}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow"
                  >
                    <ShoppingCart className="w-4 h-4" /> Thêm Vào Giỏ Hàng
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" /> Giỏ Hàng
                  Của Bạn
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {orderSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="font-extrabold text-slate-900 text-xl">
                    Đặt Hàng Thành Công!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Đơn hàng của bạn đã chuyển ngay đến hệ thống Admin duyệt
                    đơn.
                  </p>
                </div>
              ) : cart.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">
                  Giỏ hàng đang trống.
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 border-b border-slate-100 pb-3"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <span className="text-[11px] text-slate-500">
                          Size:{" "}
                          <strong className="text-emerald-700">
                            {item.size}
                          </strong>
                        </span>
                        <div className="font-extrabold text-emerald-600 mt-0.5">
                          {formatCurrency(item.price)} x {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Tổng Tiền Thanh Toán:</span>
                    <span className="text-emerald-600 text-base font-black">
                      {formatCurrency(totalCartPrice)}
                    </span>
                  </div>

                  {/* Checkout Form */}
                  <form
                    onSubmit={handleCheckout}
                    className="space-y-3 pt-4 border-t border-slate-100 text-xs"
                  >
                    <h4 className="font-extrabold text-slate-900">
                      Thông Tin Nhận Hàng:
                    </h4>

                    {!currentUser && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          Bạn chưa đăng nhập! Hãy đăng nhập để thanh toán.
                        </span>
                      </div>
                    )}

                    <input
                      type="text"
                      required
                      placeholder="Họ và Tên người nhận *"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          name: e.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg p-2.5"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Số Điện Thoại liên hệ *"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg p-2.5"
                    />
                    <textarea
                      required
                      rows={2}
                      placeholder="Địa chỉ giao hàng chi tiết *"
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: e.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg p-2.5"
                    ></textarea>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition text-sm"
                    >
                      Xác Nhận Đặt Hàng ({formatCurrency(totalCartPrice)})
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" /> Lịch Sử Đơn
                Hàng Của {currentUser?.name}
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {customerOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Bạn chưa đặt đơn hàng nào.
              </p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((o) => (
                  <div
                    key={o.id}
                    className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50"
                  >
                    <div className="flex justify-between items-center text-xs font-bold border-b border-slate-200 pb-2">
                      <span className="text-emerald-700">
                        Mã Đơn: #ORD-{o.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                          o.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "shipping"
                              ? "bg-blue-100 text-blue-800"
                              : o.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.status === "completed"
                          ? "✓ Đã Hoàn Thành"
                          : o.status === "shipping"
                            ? "🚚 Đang Giao Hàng"
                            : o.status === "cancelled"
                              ? "✕ Đã Hủy"
                              : "⏳ Chờ Xử Lý"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        Người nhận: <strong>{o.customer_name}</strong> -{" "}
                        {o.customer_phone}
                      </p>
                      <p>Địa chỉ: {o.customer_address}</p>
                      <p className="font-extrabold text-emerald-600 text-sm">
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === "admin") {
            onSwitchToAdmin();
          }
        }}
      />
    </div>
  );
}
