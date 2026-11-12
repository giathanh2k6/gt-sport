import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Tag,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  Package
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onStatusChange
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  useEffect(() => {
    if (order && isOpen) {
      setLoading(true);
      axios
        .get(`/api/orders/${order.id}/items`)
        .then((res) => {
          setItems(res.data || []);
        })
        .catch((err) => {
          console.error('Lỗi tải sản phẩm trong đơn:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#141822] border border-[#232a3b] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#232a3b] bg-[#0d1017]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/30 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">
                  Chi Tiết Đơn Hàng #{order.id}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    order.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : order.status === 'shipping'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : order.status === 'cancelled'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {order.status === 'completed'
                    ? '✓ Đã hoàn thành'
                    : order.status === 'shipping'
                      ? '🚚 Đang giao hàng'
                      : order.status === 'cancelled'
                        ? '✕ Đã hủy đơn'
                        : '⏳ Chờ xử lý'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ngày đặt: {order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : 'Mới tạo gần đây'}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Customer & Delivery Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0d1017] p-4 rounded-xl border border-[#232a3b] space-y-2">
              <span className="text-[10px] font-black uppercase text-[#e11d48] tracking-wider block">
                Thông Tin Khách Hàng
              </span>
              <div className="flex items-center gap-2 text-white font-bold">
                <User size={14} className="text-slate-400 shrink-0" />
                <span>{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <a
                  href={`tel:${order.customer_phone}`}
                  className="hover:text-emerald-400 hover:underline font-mono"
                >
                  {order.customer_phone}
                </a>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{order.customer_address}</span>
              </div>
            </div>

            <div className="bg-[#0d1017] p-4 rounded-xl border border-[#232a3b] space-y-2">
              <span className="text-[10px] font-black uppercase text-[#e11d48] tracking-wider block">
                Hình Thức & Thanh Toán
              </span>
              <div className="flex items-center justify-between text-slate-300">
                <span>Phương thức:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard size={14} className="text-[#e11d48]" />
                  {order.payment_method === 'vietqr' ? 'Chuyển khoản VietQR' : 'Thanh toán COD'}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex items-center justify-between text-amber-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> Voucher giảm giá:
                  </span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-[#232a3b]">
                <span className="font-bold">Tổng thanh toán:</span>
                <span className="text-emerald-400 font-black text-sm">
                  {formatCurrency(order.total_price)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Note */}
          {order.note && (
            <div className="bg-[#1f2637]/40 border border-[#2e384f] p-3 rounded-xl flex items-start gap-2.5">
              <FileText size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 text-[11px] block">
                  Ghi chú từ người mua:
                </span>
                <p className="text-slate-300 text-xs italic mt-0.5">{order.note}</p>
              </div>
            </div>
          )}

          {/* Items In Order */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <Package size={14} className="text-[#e11d48]" />
              <span>Sản Phẩm Trong Đơn Hàng</span>
            </span>

            {loading ? (
              <div className="p-6 text-center text-slate-400">Đang tải sản phẩm trong đơn...</div>
            ) : items.length === 0 ? (
              <div className="p-4 bg-[#0d1017] rounded-xl border border-[#232a3b] text-center text-slate-400">
                Không tìm thấy danh sách sản phẩm (có thể do đơn hàng tạo từ phiên bản trước).
              </div>
            ) : (
              <div className="bg-[#0d1017] rounded-xl border border-[#232a3b] overflow-hidden divide-y divide-[#232a3b]">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-[#161c28]/40 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded-lg border border-[#232a3b] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate">
                          {item.product_name || `Sản phẩm #${item.product_id}`}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-[#1f2637] text-amber-300 font-bold border border-[#2e384f]">
                            Size {item.size}
                          </span>
                          {item.stud_type && (
                            <span className="px-1.5 py-0.5 rounded bg-[#e11d48]/10 text-[#e11d48] font-bold">
                              Đinh {item.stud_type}
                            </span>
                          )}
                          <span className="text-slate-400">
                            Số lượng: <strong className="text-white">x{item.quantity}</strong>
                          </span>
                        </div>

                        {/* Chi tiết yêu cầu in áo cho Admin */}
                        {item.customization && (() => {
                          let cust = null;
                          try {
                            cust = typeof item.customization === 'string' ? JSON.parse(item.customization) : item.customization;
                          } catch (e) {
                            cust = { name: item.customization };
                          }
                          return (
                            <div className="mt-2 p-2 bg-gradient-to-r from-rose-950/70 to-amber-950/50 border border-[#e11d48]/50 rounded-lg text-[10px] space-y-0.5">
                              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                                <span>⚡ YÊU CẦU IN ÁO ĐẤU:</span>
                                <span className="text-white font-black uppercase tracking-wider">
                                  {cust.name} #{cust.number}
                                </span>
                              </div>
                              <div className="text-slate-300">
                                Font: <strong className="text-white">{cust.font || 'Mặc định'}</strong> • Huy hiệu: <strong className="text-white">{cust.badge || 'Không dán'}</strong>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-emerald-400 text-xs">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(item.price)} / đôi
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Status Update Section */}
          <div className="pt-3 border-t border-[#232a3b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-medium">
              Chuyển nhanh trạng thái đơn:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStatusChange(order.id, 'shipping')}
                disabled={order.status === 'shipping'}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[11px] flex items-center gap-1 transition"
              >
                <Truck size={13} /> Giao Hàng
              </button>
              <button
                onClick={() => onStatusChange(order.id, 'completed')}
                disabled={order.status === 'completed'}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-[11px] flex items-center gap-1 transition"
              >
                <CheckCircle size={13} /> Hoàn Thành
              </button>
              <button
                onClick={() => onStatusChange(order.id, 'cancelled')}
                disabled={order.status === 'cancelled'}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-[11px] flex items-center gap-1 transition"
              >
                <XCircle size={13} /> Hủy Đơn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
