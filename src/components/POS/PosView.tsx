import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  UserPlus,
  CreditCard,
  Banknote,
  Building,
  Check,
  AlertCircle,
  Percent,
  FileText,
  Tag,
  ArrowRight,
  User,
  Sparkles,
  Info,
  Crown,
  Award,
  Gem,
  Gift,
  Star,
  CheckCircle2,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, PaymentMethod, Product, TelecomCategory, VipTier } from '../../types';
import { TicketModal } from './TicketModal';
import { VipModal } from '../Customers/VipModal';

const CATEGORIES: ('TODOS' | TelecomCategory)[] = [
  'TODOS',
  'Fibra Óptica',
  'Routers & Redes',
  'Antenas & Wireless',
  'Switches & PoE',
  'Cables & Conectores',
  'Herramientas & Medición',
  'CCTV & Seguridad',
  'Servidores & Racks',
];

export const PosView: React.FC = () => {
  const {
    products,
    currentBranch,
    getProductStock,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartDiscount,
    applyCartDiscountPercent,
    clearCart,
    cartTotals,
    customers,
    addCustomer,
    toggleCustomerVip,
    processSale,
    selectedSaleForTicket,
    setSelectedSaleForTicket,
    currentUser,
  } = useApp();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'TODOS' | TelecomCategory>('TODOS');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Cart Customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    customerType: 'INSTALADOR' as const,
  });

  // VIP in POS state
  const [applyVipDiscount, setApplyVipDiscount] = useState<boolean>(true);
  const [showVipBenefitsPopover, setShowVipBenefitsPopover] = useState<boolean>(false);
  const [editingVipCustomer, setEditingVipCustomer] = useState<Customer | null>(null);

  // Quick Customer VIP form states
  const [quickVipActive, setQuickVipActive] = useState<boolean>(false);
  const [quickVipTier, setQuickVipTier] = useState<VipTier>('GOLD');
  const [quickVipDiscount, setQuickVipDiscount] = useState<number>(15);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'TODOS' || p.category === selectedCategory;

      const q = searchTerm.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        (p.model && p.model.toLowerCase().includes(q));

      return matchesCat && matchesQuery;
    });
  }, [products, selectedCategory, searchTerm]);

  // Selected customer object
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const isVipCustomer = Boolean(currentCustomer?.isVip);
  const vipDiscountPercent = currentCustomer?.vipDiscountPercent ?? 15;

  // Synchronize VIP discount to cart items when customer or toggle changes
  useEffect(() => {
    if (isVipCustomer && applyVipDiscount) {
      applyCartDiscountPercent(vipDiscountPercent);
    } else if (isVipCustomer && !applyVipDiscount) {
      applyCartDiscountPercent(0);
    }
  }, [selectedCustomerId, applyVipDiscount, isVipCustomer, vipDiscountPercent]);

  // Wrapper for adding to cart that respects active VIP discount
  const handleAddToCartWithVip = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
    if (isVipCustomer && applyVipDiscount) {
      setTimeout(() => {
        applyCartDiscountPercent(vipDiscountPercent);
      }, 0);
    }
  };

  // Handle quick barcode scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(
      (p) =>
        p.barcode === barcodeInput.trim() ||
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (found) {
      const stock = getProductStock(found);
      if (stock > 0) {
        handleAddToCartWithVip(found, 1);
        setBarcodeInput('');
      } else {
        alert(`El producto "${found.name}" no tiene stock en esta sucursal.`);
      }
    } else {
      alert(`Código o SKU "${barcodeInput}" no encontrado.`);
    }
  };

  // Open Payment modal
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setAmountPaidInput(cartTotals.total.toString());
    setShowPaymentModal(true);
  };

  // Process checkout
  const handleConfirmSale = (isQuote = false) => {
    setIsProcessing(true);

    const paidNum = parseFloat(amountPaidInput) || cartTotals.total;
    const isVipActive = Boolean(isVipCustomer && applyVipDiscount);

    processSale({
      customerId: currentCustomer?.id,
      customerName: currentCustomer ? currentCustomer.name : 'Público en General',
      customerPhone: currentCustomer?.phone,
      paymentMethod,
      amountPaid: isQuote ? 0 : paidNum,
      notes: saleNotes,
      isQuote,
      isVipSale: isVipActive,
      vipTier: isVipActive ? currentCustomer?.vipTier : undefined,
      vipDiscountPercent: isVipActive ? vipDiscountPercent : 0,
      vipDiscountAmount: isVipActive ? cartTotals.discountTotal : 0,
    });

    setIsProcessing(false);
    setShowPaymentModal(false);
    setSaleNotes('');
  };

  // Create new quick customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;

    const created = addCustomer({
      name: newCustomerForm.name.trim(),
      companyName: newCustomerForm.companyName.trim() || undefined,
      phone: newCustomerForm.phone.trim() || '961-580-24-90',
      email: 'contacto@cliente.mx',
      address: 'Tuxtla Gutiérrez, Chiapas',
      city: 'Tuxtla Gutiérrez',
      customerType: newCustomerForm.customerType,
      creditLimit: 10000,
      currentCredit: 0,
      notes: 'Registrado desde terminal POS',
      isVip: quickVipActive,
      vipTier: quickVipActive ? quickVipTier : undefined,
      vipDiscountPercent: quickVipActive ? quickVipDiscount : 0,
      vipSpecialBenefits: quickVipActive
        ? ['Soporte Técnico Prioritario', 'Precios de Mayoreo WISP', 'Garantía Express 24h']
        : undefined,
    });

    setSelectedCustomerId(created.id);
    if (quickVipActive) {
      setApplyVipDiscount(true);
    }
    setShowNewCustomerModal(false);
    setNewCustomerForm({
      name: '',
      companyName: '',
      phone: '',
      customerType: 'INSTALADOR',
    });
    setQuickVipActive(false);
  };

  const amountPaidNum = parseFloat(amountPaidInput) || 0;
  const changeDue = Math.max(0, amountPaidNum - cartTotals.total);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-transparent text-slate-100">
      {/* Left Column: Catalog & Search */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/10 h-full overflow-hidden">
        {/* Top Search & Barcode Bar */}
        <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-xl border-b border-white/10 space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                id="pos-search-input"
                placeholder="Buscar por equipo, SKU, modelo, antena, router, fibra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 backdrop-blur-md"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Barcode Scanner Form */}
            <form onSubmit={handleBarcodeSubmit} className="relative sm:w-64">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                id="pos-barcode-input"
                placeholder="Escanear Código / SKU + Enter"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 backdrop-blur-md"
              />
            </form>
          </div>

          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`cat-pill-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition backdrop-blur-md ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border border-sky-400/40 font-semibold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>
              Mostrando <strong className="text-white">{filteredProducts.length}</strong> productos en{' '}
              <strong className="text-sky-400">{currentBranch.name}</strong>
            </span>
            <span className="text-[11px] text-slate-400">Clic para agregar al carrito</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const stock = getProductStock(product);
              const inCart = cart.find((i) => i.product.id === product.id);
              const cartQty = inCart ? inCart.quantity : 0;
              const isLowStock = stock <= product.minStock && stock > 0;
              const isOutOfStock = stock <= 0;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.sku}`}
                  onClick={() => {
                    if (stock > 0 && cartQty < stock) {
                      addToCart(product, 1);
                    }
                  }}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group backdrop-blur-md ${
                    isOutOfStock
                      ? 'bg-white/[0.02] border-white/5 opacity-50'
                      : cartQty > 0
                      ? 'bg-white/10 border-sky-400/50 shadow-lg shadow-sky-500/15'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08] shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    {/* Top Row: Category & Stock Badge */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30 truncate max-w-[130px]">
                        {product.category}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isOutOfStock
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : isLowStock
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isOutOfStock ? 'Agotado' : `${stock} ${product.unit}`}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-blue-300 transition line-clamp-2 leading-snug">
                      {product.name}
                    </h3>

                    {/* Brand & SKU */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                      <span>{product.brand}</span>
                      <span>•</span>
                      <span>{product.sku}</span>
                    </div>

                    {/* Short Spec */}
                    {product.specifications && (
                      <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-1">
                        {product.specifications}
                      </p>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-none">Precio Venta</span>
                      <span className="font-extrabold text-base text-white">
                        ${product.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      id={`btn-add-cart-${product.sku}`}
                      disabled={isOutOfStock || cartQty >= stock}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCartWithVip(product, 1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isOutOfStock || cartQty >= stock
                          ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                          : 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/25'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{cartQty > 0 ? `(${cartQty}) Más` : 'Agregar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Info className="w-10 h-10 text-slate-500 mb-2" />
              <p className="font-semibold text-slate-300">No se encontraron productos</p>
              <p className="text-xs text-slate-500 mt-1">
                Prueba con otro término de búsqueda o cambia la categoría seleccionada.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active Cart / POS Register */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white/5 backdrop-blur-2xl flex flex-col h-auto lg:h-full border-t lg:border-t-0 border-l border-white/10 shadow-2xl">
        {/* Cart Header */}
        <div className="p-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-sky-400" />
              <h2 className="font-bold text-sm text-white">Ticket Actual</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                {cartTotals.itemCount} arts
              </span>
            </div>

            {cart.length > 0 && (
              <button
                id="btn-clear-cart"
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <select
                id="pos-customer-select"
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setApplyVipDiscount(true);
                }}
                className="w-full py-2 pl-3 pr-8 rounded-xl bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-sky-400 appearance-none backdrop-blur-md"
              >
                <option value="" className="bg-slate-900 text-white">Público en General</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.isVip ? `👑 [VIP ${c.vipTier || 'ORO'}] ` : ''}
                    {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.customerType}
                  </option>
                ))}
              </select>
              <User className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <button
              id="btn-quick-new-customer"
              onClick={() => setShowNewCustomerModal(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
              title="Registrar cliente rápido"
            >
              <UserPlus className="w-4 h-4 text-sky-400" />
            </button>
          </div>

          {currentCustomer && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>{currentCustomer.phone}</span>
              {currentCustomer.creditLimit > 0 && (
                <span className="text-emerald-400 font-medium">
                  Crédito disp: ${(currentCustomer.creditLimit - currentCustomer.currentCredit).toLocaleString('es-MX')}
                </span>
              )}
            </div>
          )}

          {/* VIP Status & Discount Banner */}
          {currentCustomer && currentCustomer.isVip && (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-sky-500/15 border border-amber-400/30 backdrop-blur-md space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[11px] text-amber-200 uppercase tracking-wider">
                        Cliente VIP {currentCustomer.vipTier}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {currentCustomer.vipDiscountPercent}% OFF
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowVipBenefitsPopover(!showVipBenefitsPopover)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Ver beneficios VIP"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingVipCustomer(currentCustomer)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Editar configuración VIP de este cliente"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* VIP Discount Action Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                <button
                  type="button"
                  id="btn-toggle-vip-discount"
                  onClick={() => setApplyVipDiscount(!applyVipDiscount)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                    applyVipDiscount
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md shadow-amber-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${applyVipDiscount ? 'text-slate-900' : 'text-slate-500'}`} />
                  <span>{applyVipDiscount ? 'Descuento VIP Activo' : 'Aplicar Descuento VIP'}</span>
                </button>

                {applyVipDiscount && cartTotals.discountTotal > 0 && (
                  <span className="text-amber-300 font-bold font-mono text-[11px]">
                    Ahorro: -${cartTotals.discountTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Active Special Benefits Drawer */}
              {showVipBenefitsPopover && (
                <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 space-y-1.5 animate-in fade-in duration-100">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Beneficios Preferenciales:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(currentCustomer.vipSpecialBenefits || [
                      'Soporte Técnico Prioritario Nivel 2',
                      'Garantía Express 24 hrs',
                      'Precios de Mayoreo WISP',
                    ]).map((ben, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium"
                      >
                        • {ben}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prompt to make customer VIP if not already */}
          {currentCustomer && !currentCustomer.isVip && (
            <div className="mt-2 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-slate-500" />
                <span>Cliente Regular</span>
              </span>
              <button
                type="button"
                id="btn-promote-to-vip"
                onClick={() => setEditingVipCustomer(currentCustomer)}
                className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30 text-[10px] transition flex items-center gap-1"
              >
                <Crown className="w-3 h-3" />
                <span>Asignar VIP</span>
              </button>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[40vh] lg:max-h-none">
          {cart.map((item) => {
            const availStock = getProductStock(item.product);
            return (
              <div
                key={item.product.id}
                className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-white leading-tight truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SKU: {item.product.sku} | ${item.unitPrice.toLocaleString('es-MX')} c/u
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quantity & Discount & Line Subtotal */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                  {/* Qty Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={availStock}
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-10 text-center py-0.5 rounded-lg bg-white/5 border border-white/15 text-xs font-bold text-white"
                    />
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= availStock}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 flex items-center justify-center text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-slate-400">/ max {availStock}</span>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <span className="font-bold text-xs text-white">
                      ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Serial Number preview for telecom devices */}
                {item.product.trackSerial && (
                  <div className="text-[10px] text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded-lg border border-sky-500/20 flex items-center justify-between">
                    <span>S/N Equipo:</span>
                    <span className="font-mono">{item.selectedSerials?.[0] || 'Auto-asignado'}</span>
                  </div>
                )}
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400">
              <ShoppingCart className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-300">El carrito está vacío</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Selecciona equipos del catálogo para iniciar la venta
              </p>
            </div>
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Buttons */}
        <div className="p-4 bg-white/[0.03] backdrop-blur-xl border-t border-white/10 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>${cartTotals.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            {cartTotals.discountTotal > 0 && (
              <div className="flex justify-between items-center text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <span className="flex items-center gap-1">
                  {isVipCustomer && applyVipDiscount ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      <span>Descuento VIP ({currentCustomer?.vipTier || ''} {vipDiscountPercent}%):</span>
                    </>
                  ) : (
                    <span>Descuento aplicado:</span>
                  )}
                </span>
                <span className="font-bold">-${cartTotals.discountTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white pt-1 border-t border-white/10">
              <span>TOTAL:</span>
              <span className="text-emerald-400">
                ${cartTotals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="btn-quote-cart"
              disabled={cart.length === 0}
              onClick={() => handleConfirmSale(true)}
              className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Cotización</span>
            </button>

            <button
              id="btn-checkout-cart"
              disabled={cart.length === 0}
              onClick={handleOpenPayment}
              className="py-3 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-xs font-extrabold text-white shadow-lg shadow-sky-500/25 flex items-center justify-center gap-1.5 transition"
            >
              <Banknote className="w-4 h-4" />
              <span>Cobrar (F4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Procesar Cobro de Venta</h3>
                <p className="text-[11px] text-slate-400">
                  {currentBranch.name} • Atiende: {currentUser.name}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Total display */}
              <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-slate-400 text-xs block">Total a Pagar</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  ${cartTotals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cliente: <strong className="text-slate-200">{currentCustomer ? currentCustomer.name : 'Público en General'}</strong>
                </p>
                {isVipCustomer && applyVipDiscount && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                    <Crown className="w-3 h-3" />
                    <span>Tarifa Preferencial VIP {currentCustomer?.vipTier} ({vipDiscountPercent}% Desc incluido)</span>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
                    { id: 'TARJETA', label: 'Tarjeta Débito/Crédito', icon: CreditCard },
                    { id: 'TRANSFERENCIA', label: 'Transferencia SPEI', icon: Building },
                    { id: 'CREDITO', label: 'Crédito Cliente', icon: Tag },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold transition ${
                          paymentMethod === m.id
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/10'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Denominations and Received */}
              {paymentMethod === 'EFECTIVO' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">Efectivo Recibido</label>
                    <button
                      type="button"
                      onClick={() => setAmountPaidInput(cartTotals.total.toString())}
                      className="text-[10px] text-sky-400 hover:underline font-semibold"
                    >
                      Monto Exacto
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="any"
                      id="input-cash-amount"
                      value={amountPaidInput}
                      onChange={(e) => setAmountPaidInput(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-base font-bold text-white focus:outline-none focus:border-sky-400 backdrop-blur-md"
                    />
                  </div>

                  {/* Cash suggestions */}
                  <div className="flex gap-1.5 overflow-x-auto pt-1">
                    {[100, 200, 500, 1000, 2000].map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => setAmountPaidInput(bill.toString())}
                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-slate-300"
                      >
                        ${bill}
                      </button>
                    ))}
                  </div>

                  {/* Change calculation */}
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Cambio a Entregar:</span>
                    <span className="font-mono text-base font-extrabold text-emerald-400">
                      ${changeDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Notas de Venta / Facturación</label>
                <input
                  type="text"
                  placeholder="Ej. Requiere factura, entrega en taller, orden compra..."
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 backdrop-blur-md"
                />
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition"
              >
                Regresar
              </button>

              <button
                type="button"
                id="btn-confirm-payment-complete"
                onClick={() => handleConfirmSale(false)}
                disabled={isProcessing || (paymentMethod === 'EFECTIVO' && amountPaidNum < cartTotals.total)}
                className="flex-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-xs font-bold text-white shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar y Emitir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md">
          <form
            onSubmit={handleCreateCustomer}
            className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-sm w-full shadow-2xl p-5 space-y-3 text-xs animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="font-bold text-sm text-white">Alta Rápida de Cliente</h3>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Ing. Juan Pérez López"
                value={newCustomerForm.name}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Empresa / WISP</label>
              <input
                type="text"
                placeholder="Ej. Redes del Sureste WISP"
                value={newCustomerForm.companyName}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                placeholder="Ej. 961-580-24-90"
                value={newCustomerForm.phone}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Tipo de Cliente</label>
              <select
                value={newCustomerForm.customerType}
                onChange={(e) =>
                  setNewCustomerForm({
                    ...newCustomerForm,
                    customerType: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
              >
                <option value="WISP_ISP">Proveedor de Internet (WISP/ISP)</option>
                <option value="INSTALADOR">Técnico / Instalador</option>
                <option value="EMPRESA">Empresa / Corporativo</option>
                <option value="PARTICULAR">Cliente Particular</option>
              </select>
            </div>

            {/* VIP Registration Option */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickVipActive}
                  onChange={(e) => setQuickVipActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-white/20"
                />
                <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Asignar estatus VIP de bienvenida</span>
                </span>
              </label>

              {quickVipActive && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-300 block mb-0.5">Nivel VIP</label>
                    <select
                      value={quickVipTier}
                      onChange={(e) => {
                        const t = e.target.value as VipTier;
                        setQuickVipTier(t);
                        if (t === 'BRONZE') setQuickVipDiscount(5);
                        else if (t === 'SILVER') setQuickVipDiscount(10);
                        else if (t === 'GOLD') setQuickVipDiscount(15);
                        else if (t === 'PLATINUM') setQuickVipDiscount(20);
                      }}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-white text-xs"
                    >
                      <option value="BRONZE">Bronce (5%)</option>
                      <option value="SILVER">Plata (10%)</option>
                      <option value="GOLD">Oro (15%)</option>
                      <option value="PLATINUM">Platino (20%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 block mb-0.5">Descuento %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={quickVipDiscount}
                      onChange={(e) => setQuickVipDiscount(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-bold text-white shadow-md shadow-sky-500/25"
              >
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIP Modal for editing customer VIP status directly from POS */}
      {editingVipCustomer && (
        <VipModal
          customer={editingVipCustomer}
          onClose={() => setEditingVipCustomer(null)}
        />
      )}

      {/* Ticket Modal if sale completed */}
      {selectedSaleForTicket && (
        <TicketModal
          sale={selectedSaleForTicket}
          onClose={() => setSelectedSaleForTicket(null)}
        />
      )}
    </div>
  );
};
