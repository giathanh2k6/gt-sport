import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, Store, Tag } from 'lucide-react';
import axios from 'axios';

export default function CustomerStore({ products, fetchProducts, fetchOrders, fetchStats }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Customer Form
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const handleSelectSize = (productId, size) => {
    setSelectedSize({ ...selectedSize, [productId]: size });
  };

  const addToCart = (product) => {
    const size = selectedSize[product.id];
    if (!size) {
      alert('Vui lòng chọn Kích thước (Size) trước khi thêm vào giỏ hàng!');
      return;
    }

    // Kiểm tra tồn kho của size
    const variant = product.variants.find(v => v.size === size);
    if (!variant || variant.stock <= 0) {
      alert(`Size ${size} của sản phẩm này đã hết hàng!`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.product_id === product.id && item.size === size);
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
          quantity: 1
        }
      ]);
    }
    setIsCartOpen(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      await axios.post('/api/orders', {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        items: cart
      });

      setOrderSuccess(true);
      setCart([]);
      fetchProducts();
      fetchOrders();
      if (fetchStats) fetchStats();

      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (error) {
      alert('Lỗi khi gửi đơn hàng! Vui lòng thử lại.');
    }
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Banner Khách Hàng */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <span className="bg-emerald-500/30 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold">
            ⚽ Cửa Hàng Giày & Áo Bóng Đá Chính Hãng
          </span>
          <h2 className="text-2xl font-extrabold mt-2">KickOff Football Shop</h2>
          <p className="text-emerald-100 text-xs mt-1">Trải nghiệm mua sắm đồ thể thao cực đỉnh - Đủ Size, sẵn hàng!</p>
        </div>
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 text-xs"
        >
          <ShoppingCart className="w-5 h-5" /> Giỏ Hàng
          {cart.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Grid Sản Phẩm Shop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const currentSize = selectedSize[product.id];
          return (
            <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <img
                  src={product.image_url || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {product.category_name}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{product.name}</h3>
                  <div className="text-base font-extrabold text-emerald-600">
                    {formatCurrency(product.price)}
                  </div>

                  {/* Chọn Size */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Chọn Kích Thước (Size):</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {product.variants && product.variants.map((v) => (
                        <button
                          key={v.size}
                          disabled={v.stock <= 0}
                          onClick={() => handleSelectSize(product.id, v.size)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                            v.stock <= 0
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                              : currentSize === v.size
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                          }`}
                        >
                          {v.size} {v.stock <= 0 ? '(Hết)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Thêm Vào Giỏ Hàng
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart & Checkout Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" /> Giỏ Hàng Của Bạn
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                  ✕
                </button>
              </div>

              {orderSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="font-bold text-slate-800 text-lg">Đặt Hàng Thành Công!</h4>
                  <p className="text-xs text-slate-500">Đơn hàng của bạn đã được chuyển đến bộ phận quản lý kho shop.</p>
                </div>
              ) : cart.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Giỏ hàng đang trống. Hãy chọn size và thêm món đồ bạn thích nhé!</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                        <span className="text-[11px] text-slate-500">Size: <strong className="text-slate-700">{item.size}</strong></span>
                        <div className="font-bold text-emerald-600">{formatCurrency(item.price)} x {item.quantity}</div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-800 text-sm">
                    <span>Tổng Tiền Thanh Toán:</span>
                    <span className="text-emerald-600 text-base">{formatCurrency(totalCartPrice)}</span>
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleCheckout} className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                    <h4 className="font-bold text-slate-700">Thông Tin Giao Hàng:</h4>
                    <input
                      type="text"
                      required
                      placeholder="Họ và Tên khách hàng *"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Số Điện Thoại *"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    />
                    <textarea
                      required
                      rows={2}
                      placeholder="Địa chỉ nhận hàng *"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    ></textarea>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition"
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
    </div>
  );
}
