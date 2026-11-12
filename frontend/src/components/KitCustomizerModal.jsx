import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  RotateCw,
  Sparkles,
  Shirt,
  ShoppingBag,
  Award,
  Check,
  Zap,
  Play,
  Pause,
  MoveHorizontal
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function KitCustomizerModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  initialSize = ''
}) {
  const toast = useToast();

  // Customization State
  const [customName, setCustomName] = useState('GIA THANH');
  const [customNumber, setCustomNumber] = useState('7');
  const [fontStyle, setFontStyle] = useState('ucl'); // 'ucl', 'epl', 'classic'
  const [colorScheme, setColorScheme] = useState('gold'); // 'gold', 'white', 'black', 'red'
  const [selectedBadge, setSelectedBadge] = useState('c1'); // 'none', 'c1', 'epl'
  const [selectedSize, setSelectedSize] = useState(initialSize || 'L');

  // 3D Rotation State
  // Default to 180 deg (Back view) so customer immediately sees the name and number
  const [rotationY, setRotationY] = useState(180);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const animationFrameRef = useRef(null);

  // Sync initial size when modal opens
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      if (!selectedSize || !product.variants.find((v) => v.size === selectedSize)) {
        setSelectedSize(product.variants[0].size);
      }
    }
  }, [product, isOpen]);

  // Auto rotation loop
  useEffect(() => {
    if (autoRotate && isOpen) {
      const step = () => {
        setRotationY((prev) => (prev + 0.6) % 360);
        animationFrameRef.current = requestAnimationFrame(step);
      };
      animationFrameRef.current = requestAnimationFrame(step);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [autoRotate, isOpen]);

  // Drag interaction handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setRotationY((prev) => prev + deltaX * 0.7);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setAutoRotate(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    setRotationY((prev) => prev + deltaX * 0.7);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Flip 180 degrees
  const handleFlipView = () => {
    setAutoRotate(false);
    // If closest to front (around 0/360), flip to back (180), else flip to front (0)
    const normalized = ((rotationY % 360) + 360) % 360;
    if (normalized > 90 && normalized < 270) {
      setRotationY(0); // Go to front
    } else {
      setRotationY(180); // Go to back
    }
  };

  // Auto-focus back view when user types name or number
  const focusBackView = () => {
    const normalized = ((rotationY % 360) + 360) % 360;
    if (normalized < 90 || normalized > 270) {
      setRotationY(180);
    }
  };

  // Theme kit colors based on product SKU or Name
  const kitTheme = useMemo(() => {
    const sku = (product?.sku || '').toUpperCase();
    const name = (product?.name || '').toUpperCase();

    if (sku.includes('RMA') || name.includes('REAL MADRID')) {
      return {
        team: 'Real Madrid',
        primary: '#F9FAFB', // White
        secondary: '#D4AF37', // Gold
        accent: '#0A0A0A',
        collar: '#111827',
        sponsor: 'Emirates FLY BETTER',
        brand: 'adidas',
        textColor: '#1E293B',
        badge: 'c1',
        presets: [
          { name: 'BELLINGHAM', number: '5' },
          { name: 'VINICIUS JR', number: '7' },
          { name: 'MBAPPE', number: '9' },
          { name: 'MODRIC', number: '10' }
        ]
      };
    }

    if (sku.includes('MU') || name.includes('MANCHESTER UNITED')) {
      return {
        team: 'Manchester United',
        primary: '#DC2626', // Crimson Red
        secondary: '#000000', // Black
        accent: '#FFFFFF',
        collar: '#1F2937',
        sponsor: 'Snapdragon',
        brand: 'adidas',
        textColor: '#FFFFFF',
        badge: 'epl',
        presets: [
          { name: 'BRUNO F.', number: '8' },
          { name: 'GARNACHO', number: '17' },
          { name: 'MAINOO', number: '37' },
          { name: 'RONALDO', number: '7' }
        ]
      };
    }

    if (sku.includes('VN') || name.includes('VIỆT NAM')) {
      return {
        team: 'ĐT Việt Nam',
        primary: '#B91C1C', // Deep Red
        secondary: '#FACC15', // Golden Yellow
        accent: '#FEF08A',
        collar: '#7F1D1D',
        sponsor: 'VIETNAM',
        brand: 'Jogarbola',
        textColor: '#FACC15',
        badge: 'none',
        presets: [
          { name: 'QUANG HẢI', number: '19' },
          { name: 'TIẾN LINH', number: '9' },
          { name: 'HOÀNG ĐỨC', number: '14' },
          { name: 'VĂN LÂM', number: '1' }
        ]
      };
    }

    // Default High-Tech Sport Kit
    return {
      team: 'GT Sport Elite',
      primary: '#0F172A', // Pitch Navy
      secondary: '#E11D48', // Crimson Red
      accent: '#38BDF8',
      collar: '#020617',
      sponsor: 'GT SPORT ELITE',
      brand: 'nike',
      textColor: '#FFFFFF',
      badge: 'c1',
      presets: [
        { name: 'GIA THANH', number: '7' },
        { name: 'RONALDO', number: '7' },
        { name: 'MESSI', number: '10' },
        { name: 'DE BRUYNE', number: '17' }
      ]
    };
  }, [product]);

  // Pricing calculations
  const printingFee = customName.trim() || customNumber.trim() ? 80000 : 0;
  const badgeFee = selectedBadge !== 'none' ? 30000 : 0;
  const totalPrice = (product?.price || 0) + printingFee + badgeFee;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Color scheme style definitions
  const activeColor = useMemo(() => {
    switch (colorScheme) {
      case 'white':
        return { fill: '#FFFFFF', stroke: '#0F172A', shadow: 'rgba(0,0,0,0.8)' };
      case 'black':
        return { fill: '#0F172A', stroke: '#FFFFFF', shadow: 'rgba(255,255,255,0.4)' };
      case 'red':
        return { fill: '#E11D48', stroke: '#FFFFFF', shadow: 'rgba(0,0,0,0.8)' };
      case 'gold':
      default:
        return { fill: '#F59E0B', stroke: '#1E293B', shadow: 'rgba(245,158,11,0.5)' };
    }
  }, [colorScheme]);

  // Font family class
  const fontClass = useMemo(() => {
    switch (fontStyle) {
      case 'epl':
        return 'font-mono font-black tracking-widest';
      case 'classic':
        return 'font-serif font-black tracking-normal';
      case 'ucl':
      default:
        return 'font-sans font-black tracking-wider';
    }
  }, [fontStyle]);

  // Handle Add To Cart
  const handleConfirmAddToCart = () => {
    if (!selectedSize) {
      toast.warning('Vui lòng chọn size áo trước khi thêm vào giỏ hàng!');
      return;
    }

    const customizationInfo = {
      name: customName.trim().toUpperCase() || 'KHÔNG IN',
      number: customNumber.trim() || '-',
      font: fontStyle === 'ucl' ? 'Champions League' : fontStyle === 'epl' ? 'Premier League' : 'Classic Sports',
      badge:
        selectedBadge === 'c1'
          ? 'Cúp C1 15 Stars'
          : selectedBadge === 'epl'
          ? 'Ngoại Hạng Anh'
          : 'Không dán badge',
      color: colorScheme,
      printing_fee: printingFee,
      badge_fee: badgeFee
    };

    onAddToCart(
      {
        ...product,
        price: totalPrice,
        customization: customizationInfo
      },
      selectedSize
    );

    toast.success(
      `Đã thêm áo đấu in tên "${customizationInfo.name} #${customizationInfo.number}" vào giỏ hàng!`
    );
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in select-none">
      <div className="bg-[#10141e] border border-[#232a3b] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#232a3b] bg-[#0a0c10]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e11d48] to-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-950/50">
              <Sparkles size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white tracking-wide">
                  Interactive Kit Customizer 3D
                </h3>
                <span className="bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/30 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                  Live Preview Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tự tay thiết kế tên số áo thi đấu & xoay góc nhìn 360° theo thời gian thực
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#1a202c] hover:bg-[#252d40] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Body (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Column 1: Interactive 3D Jersey Visualizer (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-[#0a0c10] to-[#141822] p-6 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-[#232a3b] relative overflow-hidden">
            {/* Visualizer Floating Controls */}
            <div className="w-full flex items-center justify-between z-10 text-xs">
              <div className="flex items-center gap-2 bg-[#0a0c10]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#232a3b] text-slate-300">
                <MoveHorizontal size={14} className="text-[#e11d48] animate-pulse" />
                <span className="text-[11px] font-medium hidden sm:inline">
                  Kéo chuột trái/phải để xoay 360°
                </span>
                <span className="text-[11px] font-bold text-[#e11d48]">
                  {Math.round(((rotationY % 360) + 360) % 360)}°
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                    autoRotate
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg'
                      : 'bg-[#1a202c] text-slate-300 border-[#232a3b] hover:bg-[#252d40]'
                  }`}
                  title="Tự động xoay quanh áo"
                >
                  {autoRotate ? <Pause size={12} /> : <Play size={12} />}
                  <span>{autoRotate ? 'Dừng xoay' : 'Tự xoay 360°'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlipView}
                  className="px-3 py-1.5 rounded-full bg-[#e11d48] hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition cursor-pointer"
                  title="Lật giữa Mặt Trước và Mặt Sau"
                >
                  <RotateCw size={12} />
                  <span>Lật Áo 180°</span>
                </button>
              </div>
            </div>

            {/* 3D Jersey Container */}
            <div
              className="relative w-full h-[380px] sm:h-[420px] flex items-center justify-center my-auto cursor-grab active:cursor-grabbing"
              style={{ perspective: '1200px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Spinning 3D Card */}
              <div
                className="relative w-[300px] h-[360px] sm:w-[340px] sm:h-[400px] transition-transform duration-75"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${rotationY}deg)`
                }}
              >
                {/* 1. FRONT FACE (rotateY: 0deg) */}
                <div
                  className="absolute inset-0 backface-hidden flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)'
                  }}
                >
                  <svg
                    viewBox="0 0 340 400"
                    className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] filter"
                  >
                    <defs>
                      <linearGradient id="frontGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={kitTheme.primary} />
                        <stop offset="50%" stopColor={kitTheme.primary} />
                        <stop offset="100%" stopColor={kitTheme.collar} />
                      </linearGradient>
                      <filter id="shadowFront" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.4" />
                      </filter>
                    </defs>

                    {/* Left Sleeve */}
                    <path
                      d="M 60,65 L 10,135 L 50,165 L 85,115 Z"
                      fill={kitTheme.primary}
                      stroke={kitTheme.collar}
                      strokeWidth="2"
                    />
                    {/* Left Sleeve Cuff */}
                    <polygon
                      points="10,135 50,165 44,175 4,145"
                      fill={kitTheme.secondary}
                    />

                    {/* Right Sleeve */}
                    <path
                      d="M 280,65 L 330,135 L 290,165 L 255,115 Z"
                      fill={kitTheme.primary}
                      stroke={kitTheme.collar}
                      strokeWidth="2"
                    />
                    {/* Right Sleeve Cuff */}
                    <polygon
                      points="330,135 290,165 296,175 336,145"
                      fill={kitTheme.secondary}
                    />

                    {/* Sleeve League Badge (Right Sleeve) */}
                    {selectedBadge !== 'none' && (
                      <g transform="translate(290, 120)">
                        <circle cx="12" cy="12" r="14" fill="#0F172A" stroke={kitTheme.secondary} strokeWidth="1.5" />
                        <text
                          x="12"
                          y="16"
                          textAnchor="middle"
                          fill={kitTheme.secondary}
                          fontSize="9"
                          fontWeight="900"
                        >
                          {selectedBadge === 'c1' ? '★15' : 'EPL'}
                        </text>
                      </g>
                    )}

                    {/* Main Torso */}
                    <path
                      d="M 80,60 L 130,75 C 150,90 190,90 210,75 L 260,60 L 255,360 L 85,360 Z"
                      fill="url(#frontGradient)"
                      stroke={kitTheme.collar}
                      strokeWidth="2.5"
                    />

                    {/* Dynamic Collar */}
                    <path
                      d="M 130,75 C 150,115 190,115 210,75 C 190,88 150,88 130,75 Z"
                      fill={kitTheme.secondary}
                    />

                    {/* Club Crest / Left Chest */}
                    <g transform="translate(105, 105)">
                      <circle cx="15" cy="15" r="16" fill="#1E293B" stroke={kitTheme.secondary} strokeWidth="2" />
                      <text
                        x="15"
                        y="19"
                        textAnchor="middle"
                        fill={kitTheme.secondary}
                        fontSize="10"
                        fontWeight="900"
                      >
                        ⚽
                      </text>
                    </g>

                    {/* Manufacturer Logo / Right Chest */}
                    <g transform="translate(205, 112)">
                      <text
                        x="10"
                        y="14"
                        textAnchor="middle"
                        fill={kitTheme.secondary}
                        fontSize="11"
                        fontWeight="900"
                        letterSpacing="1"
                      >
                        {kitTheme.brand.toUpperCase()}
                      </text>
                    </g>

                    {/* Center Chest Sponsor */}
                    <g transform="translate(170, 195)">
                      <rect
                        x="-70"
                        y="-15"
                        width="140"
                        height="30"
                        rx="6"
                        fill="rgba(0,0,0,0.25)"
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill={kitTheme.textColor}
                        fontSize="13"
                        fontWeight="900"
                        letterSpacing="2"
                      >
                        {kitTheme.sponsor}
                      </text>
                    </g>

                    {/* Side Ventilations & Seams */}
                    <line x1="100" y1="130" x2="95" y2="340" stroke={kitTheme.secondary} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="240" y1="130" x2="245" y2="340" stroke={kitTheme.secondary} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

                    {/* Authentic Tag at Bottom Hem */}
                    <rect x="95" y="335" width="28" height="15" rx="3" fill="#0A0A0A" stroke={kitTheme.secondary} strokeWidth="1" />
                    <text x="109" y="346" textAnchor="middle" fill={kitTheme.secondary} fontSize="7" fontWeight="bold">
                      AUTHENTIC
                    </text>
                  </svg>
                </div>

                {/* 2. BACK FACE (rotateY: 180deg) */}
                <div
                  className="absolute inset-0 backface-hidden flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <svg
                    viewBox="0 0 340 400"
                    className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] filter"
                  >
                    <defs>
                      <linearGradient id="backGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={kitTheme.primary} />
                        <stop offset="60%" stopColor={kitTheme.primary} />
                        <stop offset="100%" stopColor={kitTheme.collar} />
                      </linearGradient>
                      <path
                        id="nameCurve"
                        d="M 85,120 Q 170,105 255,120"
                        fill="none"
                      />
                    </defs>

                    {/* Left Sleeve (from back) */}
                    <path
                      d="M 60,65 L 10,135 L 50,165 L 85,115 Z"
                      fill={kitTheme.primary}
                      stroke={kitTheme.collar}
                      strokeWidth="2"
                    />
                    <polygon
                      points="10,135 50,165 44,175 4,145"
                      fill={kitTheme.secondary}
                    />

                    {/* Right Sleeve (from back) */}
                    <path
                      d="M 280,65 L 330,135 L 290,165 L 255,115 Z"
                      fill={kitTheme.primary}
                      stroke={kitTheme.collar}
                      strokeWidth="2"
                    />
                    <polygon
                      points="330,135 290,165 296,175 336,145"
                      fill={kitTheme.secondary}
                    />

                    {/* Sleeve Badge (from back) */}
                    {selectedBadge !== 'none' && (
                      <g transform="translate(35, 120)">
                        <circle cx="12" cy="12" r="14" fill="#0F172A" stroke={kitTheme.secondary} strokeWidth="1.5" />
                        <text
                          x="12"
                          y="16"
                          textAnchor="middle"
                          fill={kitTheme.secondary}
                          fontSize="9"
                          fontWeight="900"
                        >
                          {selectedBadge === 'c1' ? '★15' : 'EPL'}
                        </text>
                      </g>
                    )}

                    {/* Main Torso Back */}
                    <path
                      d="M 80,60 L 130,68 C 150,75 190,75 210,68 L 260,60 L 255,360 L 85,360 Z"
                      fill="url(#backGradient)"
                      stroke={kitTheme.collar}
                      strokeWidth="2.5"
                    />

                    {/* Back Collar */}
                    <path
                      d="M 130,68 C 150,76 190,76 210,68 C 190,62 150,62 130,68 Z"
                      fill={kitTheme.secondary}
                    />

                    {/* Small Club Symbol Under Collar */}
                    <circle cx="170" cy="85" r="4" fill={kitTheme.secondary} />

                    {/* Player Custom Name (Curved Path) */}
                    <text
                      fill={activeColor.fill}
                      stroke={activeColor.stroke}
                      strokeWidth="1.5"
                      fontSize={customName.length > 9 ? '18' : '22'}
                      fontWeight="900"
                      letterSpacing="3"
                      className={fontClass}
                      style={{
                        paintOrder: 'stroke fill',
                        filter: `drop-shadow(0px 3px 6px ${activeColor.shadow})`
                      }}
                    >
                      <textPath href="#nameCurve" startOffset="50%" textAnchor="middle">
                        {customName || 'NAME'}
                      </textPath>
                    </text>

                    {/* Big Jersey Number */}
                    <g transform="translate(170, 235)">
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={activeColor.fill}
                        stroke={activeColor.stroke}
                        strokeWidth="3.5"
                        fontSize={customNumber.length > 1 ? '95' : '115'}
                        fontWeight="900"
                        letterSpacing="1"
                        className={fontClass}
                        style={{
                          paintOrder: 'stroke fill',
                          filter: `drop-shadow(0px 6px 12px ${activeColor.shadow})`
                        }}
                      >
                        {customNumber || '7'}
                      </text>

                      {/* Small League / Club Emblem at bottom of number */}
                      <circle cx="0" cy="48" r="6" fill={activeColor.stroke} />
                      <text x="0" y="51" textAnchor="middle" fill={activeColor.fill} fontSize="6" fontWeight="bold">
                        ⚽
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Visualizer Bar */}
            <div className="w-full flex items-center justify-between z-10 pt-2 text-[11px] text-slate-400 border-t border-[#232a3b]/60">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Shirt size={14} className="text-[#e11d48]" />
                {kitTheme.team} • {product.season || '2024/25'}
              </span>
              <span className="text-slate-400">
                Góc nhìn:{' '}
                <strong className="text-white">
                  {Math.abs(rotationY % 360) > 90 && Math.abs(rotationY % 360) < 270
                    ? 'Lưng Áo (In Tên & Số)'
                    : 'Mặt Trước Áo'}
                </strong>
              </span>
            </div>
          </div>

          {/* Column 2: Control Panel (5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-5 bg-[#10141e] overflow-y-auto">
            <div className="space-y-4 text-xs">
              {/* Presets Row */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Award size={13} className="text-amber-400" />
                  Gợi Ý Cầu Thủ Nổi Tiếng:
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {kitTheme.presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomName(preset.name);
                        setCustomNumber(preset.number);
                        focusBackView();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#1a202c] hover:bg-[#e11d48] text-slate-200 hover:text-white font-bold text-[11px] border border-[#232a3b] hover:border-[#e11d48] transition cursor-pointer"
                    >
                      {preset.number}. {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Number Inputs */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Tên In Sau Lưng (Max 12 ký tự) *
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={customName}
                    onFocus={focusBackView}
                    onChange={(e) => {
                      setCustomName(e.target.value.toUpperCase());
                      focusBackView();
                    }}
                    placeholder="VD: GIA THANH"
                    className="w-full bg-[#0a0c10] border border-[#232a3b] rounded-xl px-3 py-2 text-white font-black text-sm uppercase focus:outline-none focus:border-[#e11d48] tracking-wider"
                  />
                </div>

                <div className="col-span-4">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Số Áo (0-99) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={customNumber}
                    onFocus={focusBackView}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 2);
                      setCustomNumber(val);
                      focusBackView();
                    }}
                    className="w-full bg-[#0a0c10] border border-[#232a3b] rounded-xl px-3 py-2 text-center text-white font-black text-sm focus:outline-none focus:border-[#e11d48]"
                  />
                </div>
              </div>

              {/* Font Style Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Kiểu Font Thi Đấu:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFontStyle('ucl');
                      focusBackView();
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      fontStyle === 'ucl'
                        ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-md'
                        : 'bg-[#1a202c] text-slate-300 border-[#232a3b] hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-xs">Cúp C1 (UCL)</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Uốn cong sang trọng</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFontStyle('epl');
                      focusBackView();
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      fontStyle === 'epl'
                        ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-md'
                        : 'bg-[#1a202c] text-slate-300 border-[#232a3b] hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-xs">Ngoại Hạng (EPL)</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Góc cạnh hiện đại</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFontStyle('classic');
                      focusBackView();
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      fontStyle === 'classic'
                        ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-md'
                        : 'bg-[#1a202c] text-slate-300 border-[#232a3b] hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-xs">Classic World Cup</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Số khối thể thao</div>
                  </button>
                </div>
              </div>

              {/* Color Scheme Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Màu In & Viền Số:
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'gold', name: 'Vàng Kim', bg: 'bg-amber-400 text-black border-amber-300' },
                    { id: 'white', name: 'Trắng Viền', bg: 'bg-white text-black border-slate-300' },
                    { id: 'black', name: 'Đen Viền', bg: 'bg-slate-900 text-white border-slate-600' },
                    { id: 'red', name: 'Đỏ Rực', bg: 'bg-rose-600 text-white border-rose-400' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setColorScheme(c.id);
                        focusBackView();
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        colorScheme === c.id
                          ? 'ring-2 ring-[#e11d48] border-[#e11d48] scale-[1.03]'
                          : 'opacity-70 hover:opacity-100'
                      } ${c.bg}`}
                    >
                      {colorScheme === c.id && <Check size={12} />}
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleeve Badge Option */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Huy Hiệu Giải Đấu Bắp Tay:</span>
                  <span className="text-amber-400 text-[10px]">+30.000đ</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBadge('none')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      selectedBadge === 'none'
                        ? 'bg-[#1e293b] text-white border-[#e11d48]'
                        : 'bg-[#141822] text-slate-400 border-[#232a3b]'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Không Dán</div>
                    <div className="text-[9px] text-slate-400">+0đ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBadge('c1')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      selectedBadge === 'c1'
                        ? 'bg-blue-950/70 text-blue-200 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : 'bg-[#141822] text-slate-400 border-[#232a3b]'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-amber-300">★ Cúp C1 15 Stars</div>
                    <div className="text-[9px] text-slate-400">+30.000đ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBadge('epl')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      selectedBadge === 'epl'
                        ? 'bg-purple-950/70 text-purple-200 border-purple-500 shadow-md ring-1 ring-purple-500'
                        : 'bg-[#141822] text-slate-400 border-[#232a3b]'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-purple-300">🦁 Premier League</div>
                    <div className="text-[9px] text-slate-400">+30.000đ</div>
                  </button>
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Kích Thước Áo (Size):
                </label>
                <div className="flex gap-2">
                  {product.variants &&
                    product.variants.map((v) => (
                      <button
                        key={v.size}
                        type="button"
                        disabled={v.stock <= 0}
                        onClick={() => setSelectedSize(v.size)}
                        className={`flex-1 py-2 rounded-xl border font-black text-xs transition cursor-pointer ${
                          v.stock <= 0
                            ? 'opacity-30 line-through bg-slate-900 border-slate-800'
                            : selectedSize === v.size
                            ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-md ring-2 ring-rose-500/50'
                            : 'bg-[#1a202c] text-slate-300 border-[#232a3b] hover:border-slate-500'
                        }`}
                      >
                        {v.size}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Bottom Checkout Summary */}
            <div className="pt-4 border-t border-[#232a3b] space-y-3">
              <div className="bg-[#0a0c10] p-3 rounded-2xl border border-[#232a3b] space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Giá áo niêm yết:</span>
                  <span className="font-semibold text-white">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Phí in tên số nhiệt:</span>
                  <span className="font-semibold text-amber-400">+{formatCurrency(printingFee)}</span>
                </div>
                {selectedBadge !== 'none' && (
                  <div className="flex justify-between text-slate-400">
                    <span>Huy hiệu tay áo:</span>
                    <span className="font-semibold text-blue-400">+{formatCurrency(badgeFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-1.5 border-t border-[#1a1f2b] font-bold text-sm">
                  <span className="text-white">Tổng cộng:</span>
                  <span className="text-[#e11d48] font-black text-base">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmAddToCart}
                className="w-full bg-gradient-to-r from-[#e11d48] to-rose-700 hover:from-rose-500 hover:to-[#e11d48] text-white font-black py-3.5 px-4 rounded-2xl shadow-xl shadow-rose-950/60 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 cursor-pointer btn-shine-sweep"
              >
                <Zap size={16} />
                <span>Xác Nhận & Thêm Vào Giỏ Hàng</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
