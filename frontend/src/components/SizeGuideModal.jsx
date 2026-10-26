import React, { useState } from 'react';
import { X, Ruler, Footprints, Shirt, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('shoes'); // 'shoes' hoặc 'kit'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141822] border border-[#232a3b] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#232a3b] bg-[#0a0c10]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#e11d48]/20 flex items-center justify-center text-[#e11d48]">
              <Ruler size={20} />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
                Bảng Hướng Dẫn Đo & Chọn Size Chuẩn
              </h3>
              <p className="text-xs text-slate-400">Tránh lệch size & đổi trả - Hỗ trợ chuẩn phom chân Việt Nam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1b212f] hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#232a3b] bg-[#0f131c]">
          <button
            onClick={() => setTab('shoes')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              tab === 'shoes'
                ? 'text-[#e11d48] border-b-2 border-[#e11d48] bg-[#141822]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints size={16} /> Giày Đá Bóng (Nike / Adidas / Mizuno)
          </button>
          <button
            onClick={() => setTab('kit')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              tab === 'kit'
                ? 'text-[#e11d48] border-b-2 border-[#e11d48] bg-[#141822]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt size={16} /> Áo Đấu CLB / ĐTQG
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
          {tab === 'shoes' ? (
            <>
              {/* Cách đo bàn chân */}
              <div className="bg-[#0a0c10] border border-[#232a3b] rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-rose-400">
                  <HelpCircle size={15} /> 3 Bước Đo Chiều Dài Bàn Chân Tại Nhà:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                  <li>Đặt bàn chân lên một tờ giấy trắng sát mép tường phẳng.</li>
                  <li>Dùng bút vạch một đường thẳng tại điểm đầu ngón chân dài nhất và gót chân.</li>
                  <li>Đo khoảng cách giữa 2 vạch bằng thước kẻ (cm), sau đó cộng thêm <strong className="text-amber-400">0.5cm</strong> để tạo độ thở khi mang vớ/tất chống trượt.</li>
                </ol>
              </div>

              {/* Bảng Size Giày */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1b212f] text-slate-200 uppercase font-black tracking-wider text-[11px]">
                      <th className="p-2.5 rounded-l-lg">Size EU</th>
                      <th className="p-2.5">Chiều dài chân (cm)</th>
                      <th className="p-2.5">Size US</th>
                      <th className="p-2.5 rounded-r-lg">Ghi chú phom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232a3b]">
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-bold text-white">39</td>
                      <td className="p-2.5 text-rose-300 font-semibold">24.0 - 24.5 cm</td>
                      <td className="p-2.5">6.5</td>
                      <td className="p-2.5 text-slate-400">Chuẩn chân nhỏ</td>
                    </tr>
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-bold text-white">40</td>
                      <td className="p-2.5 text-rose-300 font-semibold">24.6 - 25.0 cm</td>
                      <td className="p-2.5">7.0</td>
                      <td className="p-2.5 text-slate-400">Phổ biến</td>
                    </tr>
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-bold text-white">41</td>
                      <td className="p-2.5 text-rose-300 font-semibold">25.1 - 25.5 cm</td>
                      <td className="p-2.5">8.0</td>
                      <td className="p-2.5 text-slate-400">Rất phổ biến</td>
                    </tr>
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-bold text-white">42</td>
                      <td className="p-2.5 text-rose-300 font-semibold">25.6 - 26.0 cm</td>
                      <td className="p-2.5">8.5</td>
                      <td className="p-2.5 text-slate-400">Phổ biến</td>
                    </tr>
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-bold text-white">43</td>
                      <td className="p-2.5 text-rose-300 font-semibold">26.1 - 26.8 cm</td>
                      <td className="p-2.5">9.5</td>
                      <td className="p-2.5 text-slate-400">Chân lớn / Bè nhiều</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Lời khuyên phom chân */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1">
                  <h5 className="font-bold text-amber-300 text-xs">⚡ Bàn Chân Bè Ngang Nhiều:</h5>
                  <p className="text-[11px] text-slate-300">
                    Nên chọn <strong>Mizuno Morelia</strong> (da Kangaroo co giãn êm ái) hoặc tăng <strong>0.5 - 1 size</strong> khi đi các dòng tốc độ ôm chân như Nike Mercurial.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                  <h5 className="font-bold text-emerald-300 text-xs">⚽ Bàn Chân Thon / Bình Thường:</h5>
                  <p className="text-[11px] text-slate-300">
                    Đi đúng size chuẩn (True to size) với các dòng <strong>Nike Mercurial, Phantom GX</strong> hoặc <strong>Adidas Predator</strong>.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Bảng Size Áo Đấu */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1b212f] text-slate-200 uppercase font-black tracking-wider text-[11px]">
                      <th className="p-2.5 rounded-l-lg">Size Áo</th>
                      <th className="p-2.5">Chiều Cao (cm)</th>
                      <th className="p-2.5">Cân Nặng (kg)</th>
                      <th className="p-2.5 rounded-r-lg">Gợi Ý Vóc Dáng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232a3b]">
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-black text-rose-400">S</td>
                      <td className="p-2.5">1m55 - 1m65</td>
                      <td className="p-2.5">48 - 58 kg</td>
                      <td className="p-2.5 text-slate-400">Gầy / Vừa người</td>
                    </tr>
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-black text-rose-400">M</td>
                      <td className="p-2.5">1m65 - 1m73</td>
                      <td className="p-2.5">58 - 68 kg</td>
                      <td className="p-2.5 text-slate-400">Cân đối thể thao</td>
                    </tr>
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-black text-rose-400">L</td>
                      <td className="p-2.5">1m72 - 1m80</td>
                      <td className="p-2.5">68 - 78 kg</td>
                      <td className="p-2.5 text-slate-400">Cao to / Đậm người</td>
                    </tr>
                    <tr className="hover:bg-[#1b212f]/40">
                      <td className="p-2.5 font-black text-rose-400">XL</td>
                      <td className="p-2.5">1m78 - 1m88</td>
                      <td className="p-2.5">78 - 90 kg</td>
                      <td className="p-2.5 text-slate-400">Đô con / Thích mặc rộng</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Chú ý bản Player vs Fan */}
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1.5">
                <h5 className="font-bold text-rose-400 text-xs">⚠️ Phân Biệt Bản Cầu Thủ (Player) & Bản Cổ Động Viên (Fan):</h5>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-[#e11d48] shrink-0 mt-0.5" />
                    <span><strong>Bản Player (HEAT.RDY):</strong> Form áo Slim Fit ôm sát cơ thể cầu thủ. Nếu bạn có bụng hoặc thích mặc thoải mái, <strong>hãy tăng 1 size</strong>.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-[#e11d48] shrink-0 mt-0.5" />
                    <span><strong>Bản Fan (AEROREADY):</strong> Form áo Regular suông rộng rãi, mặc đi chơi hoặc đá bóng đều thoải mái.</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c10] border-t border-[#232a3b] flex justify-between items-center">
          <span className="text-[11px] text-slate-400 italic">
            💡 GT Sport hỗ trợ đổi size miễn phí trong 7 ngày nếu không vừa vặn.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#e11d48] hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-950/40"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
