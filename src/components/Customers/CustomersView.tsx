import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  Building,
  MapPin,
  CreditCard,
  MessageCircle,
  FileText,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  Crown,
  Sparkles,
  Award,
  Gem,
  Percent,
  Gift,
  Star,
  Check,
} from 'lucide-react';
import { useApp, WHATSAPP_SUPPORT_NUMBER } from '../../context/AppContext';
import { Customer, CustomerType, VipTier } from '../../types';
import { VipModal } from './VipModal';

const TIER_INFO: Record<VipTier, { label: string; icon: string; badgeClass: string; borderGlow: string }> = {
  BRONZE: {
    label: 'VIP Bronce',
    icon: '🥉',
    badgeClass: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    borderGlow: 'border-amber-600/40 hover:border-amber-500/60 shadow-amber-600/10',
  },
  SILVER: {
    label: 'VIP Plata',
    icon: '🥈',
    badgeClass: 'bg-slate-400/20 text-slate-200 border-slate-300/40',
    borderGlow: 'border-slate-300/40 hover:border-slate-200/60 shadow-slate-300/10',
  },
  GOLD: {
    label: 'VIP Oro',
    icon: '🥇',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
    borderGlow: 'border-yellow-400/40 hover:border-yellow-300/60 shadow-yellow-500/15',
  },
  PLATINUM: {
    label: 'VIP Platino',
    icon: '💎',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    borderGlow: 'border-cyan-400/40 hover:border-cyan-300/60 shadow-cyan-500/15',
  },
};

export const CustomersView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerVip,
    sales,
    setSelectedSaleForTicket,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'TODOS' | CustomerType>('TODOS');
  const [vipFilter, setVipFilter] = useState<'ALL' | 'VIP_ONLY' | 'NON_VIP' | VipTier>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // VIP Quick Modal
  const [selectedCustomerForVip, setSelectedCustomerForVip] = useState<Customer | null>(null);

  // Customer history view modal
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    rfc: '',
    phone: '',
    email: '',
    address: '',
    city: 'Tuxtla Gutiérrez, Chiapas',
    customerType: 'INSTALADOR' as CustomerType,
    creditLimit: 15000,
    currentCredit: 0,
    notes: '',
    isVip: false,
    vipTier: 'GOLD' as VipTier,
    vipDiscountPercent: 15,
  });

  const openNewCustomer = () => {
    setCustomerToEdit(null);
    setFormData({
      name: '',
      companyName: '',
      rfc: '',
      phone: '',
      email: '',
      address: '',
      city: 'Tuxtla Gutiérrez, Chiapas',
      customerType: 'INSTALADOR',
      creditLimit: 15000,
      currentCredit: 0,
      notes: '',
      isVip: false,
      vipTier: 'GOLD',
      vipDiscountPercent: 15,
    });
    setShowModal(true);
  };

  const openEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setFormData({
      name: customer.name,
      companyName: customer.companyName || '',
      rfc: customer.rfc || '',
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      customerType: customer.customerType,
      creditLimit: customer.creditLimit,
      currentCredit: customer.currentCredit,
      notes: customer.notes || '',
      isVip: customer.isVip ?? false,
      vipTier: customer.vipTier || 'GOLD',
      vipDiscountPercent: customer.vipDiscountPercent ?? 15,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nombre y teléfono son requeridos.');
      return;
    }

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, formData);
    } else {
      addCustomer(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Deseas eliminar al cliente ${name}?`)) {
      deleteCustomer(id);
    }
  };

  // VIP Statistics
  const vipStats = useMemo(() => {
    const total = customers.length;
    const vips = customers.filter((c) => c.isVip);
    const vipCount = vips.length;
    const totalDiscount = vips.reduce((acc, c) => acc + (c.vipDiscountPercent || 0), 0);
    const avgDiscount = vipCount > 0 ? Math.round(totalDiscount / vipCount) : 0;
    const platinumCount = vips.filter((c) => c.vipTier === 'PLATINUM').length;
    const goldCount = vips.filter((c) => c.vipTier === 'GOLD').length;
    const silverCount = vips.filter((c) => c.vipTier === 'SILVER').length;
    const bronzeCount = vips.filter((c) => c.vipTier === 'BRONZE').length;

    return {
      total,
      vipCount,
      avgDiscount,
      platinumCount,
      goldCount,
      silverCount,
      bronzeCount,
    };
  }, [customers]);

  // Filter
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesType = selectedType === 'TODOS' || c.customerType === selectedType;

      let matchesVip = true;
      if (vipFilter === 'VIP_ONLY') {
        matchesVip = !!c.isVip;
      } else if (vipFilter === 'NON_VIP') {
        matchesVip = !c.isVip;
      } else if (vipFilter === 'PLATINUM' || vipFilter === 'GOLD' || vipFilter === 'SILVER' || vipFilter === 'BRONZE') {
        matchesVip = !!c.isVip && c.vipTier === vipFilter;
      }

      const q = searchTerm.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.rfc && c.rfc.toLowerCase().includes(q)) ||
        (c.vipTier && c.vipTier.toLowerCase().includes(q));

      return matchesType && matchesVip && matchesQuery;
    });
  }, [customers, selectedType, vipFilter, searchTerm]);

  // Customer Sales
  const customerSales = useMemo(() => {
    if (!selectedCustomerForHistory) return [];
    return sales.filter((s) => s.customerId === selectedCustomerForHistory.id);
  }, [sales, selectedCustomerForHistory]);

  const openCustomerWhatsApp = (customer: Customer) => {
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const num = cleanPhone.startsWith('52') ? cleanPhone : '52' + cleanPhone;

    let greeting = `Hola ${customer.name}, le saludamos de TelecoSys Telecomunicaciones.`;
    if (customer.isVip) {
      greeting = `👑 *Estimado Cliente VIP ${customer.vipTier || ''}*, ${customer.name}. Le saludamos con atención prioritaria de TelecoSys Telecomunicaciones. Cuenta con ${customer.vipDiscountPercent || 0}% de descuento preferencial disponible.`;
    }

    const msg = encodeURIComponent(
      `${greeting} ¿Cómo podemos apoyarle el día de hoy con sus equipos y pedidos de fibra óptica / microondas? Atención directa: ${WHATSAPP_SUPPORT_NUMBER}`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-transparent text-slate-100 p-4 sm:p-6 space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Gestión de Clientes & Estatus VIP</span>
          </h1>
          <p className="text-xs text-slate-400">
            Administra cartera de clientes, asigna beneficios VIP y descuentos preferenciales para el Punto de Venta
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVipFilter(vipFilter === 'VIP_ONLY' ? 'ALL' : 'VIP_ONLY')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              vipFilter === 'VIP_ONLY'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-amber-300 border-amber-500/30'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>{vipFilter === 'VIP_ONLY' ? 'Viendo Solo VIPs' : `Ver Clientes VIP (${vipStats.vipCount})`}</span>
          </button>

          <button
            id="btn-add-customer-main"
            onClick={openNewCustomer}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-sky-500/25 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* VIP Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Total Clientes</span>
            <span className="text-lg font-extrabold text-white font-mono">{vipStats.total}</span>
          </div>
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-transparent backdrop-blur-xl border border-amber-400/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-300 block font-semibold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>Clientes VIP</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-amber-300 font-mono">{vipStats.vipCount}</span>
              <span className="text-[10px] text-amber-300/80">
                ({Math.round((vipStats.vipCount / (vipStats.total || 1)) * 100)}%)
              </span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Descuento VIP Promedio</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">
              {vipStats.avgDiscount}% OFF
            </span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Distribución VIP</span>
            <div className="flex items-center gap-2 mt-0.5 text-xs">
              <span title="Platino" className="text-cyan-300 font-mono font-bold">💎 {vipStats.platinumCount}</span>
              <span title="Oro" className="text-yellow-300 font-mono font-bold">🥇 {vipStats.goldCount}</span>
              <span title="Plata" className="text-slate-300 font-mono font-bold">🥈 {vipStats.silverCount}</span>
              <span title="Bronce" className="text-amber-400 font-mono font-bold">🥉 {vipStats.bronzeCount}</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/10 text-slate-300">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="p-3.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg shadow-black/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            id="input-customer-search"
            placeholder="Buscar por nombre, empresa, teléfono, nivel VIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 backdrop-blur-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* VIP Filter Selector */}
          <select
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value as any)}
            className="py-2 px-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs text-amber-300 focus:outline-none focus:border-amber-400 backdrop-blur-md font-semibold"
          >
            <option value="ALL" className="bg-slate-900 text-white">Todos los Estatus</option>
            <option value="VIP_ONLY" className="bg-slate-900 text-amber-300">👑 Solo Clientes VIP</option>
            <option value="PLATINUM" className="bg-slate-900 text-cyan-300">💎 Nivel Platino</option>
            <option value="GOLD" className="bg-slate-900 text-yellow-300">🥇 Nivel Oro</option>
            <option value="SILVER" className="bg-slate-900 text-slate-300">🥈 Nivel Plata</option>
            <option value="BRONZE" className="bg-slate-900 text-amber-400">🥉 Nivel Bronce</option>
            <option value="NON_VIP" className="bg-slate-900 text-slate-400">Clientes Estándar</option>
          </select>

          {/* Sector Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="py-2 px-3 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-sky-400 backdrop-blur-md"
          >
            <option value="TODOS" className="bg-slate-900 text-white">Todos los Sectores</option>
            <option value="WISP_ISP" className="bg-slate-900 text-white">Proveedores WISP / ISP</option>
            <option value="INSTALADOR" className="bg-slate-900 text-white">Instaladores & Técnicos</option>
            <option value="EMPRESA" className="bg-slate-900 text-white">Empresas & Corporativo</option>
            <option value="PARTICULAR" className="bg-slate-900 text-white">Clientes Particulares</option>
          </select>
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredCustomers.map((customer) => {
            const hasCredit = customer.creditLimit > 0;
            const availableCredit = customer.creditLimit - customer.currentCredit;
            const isVip = !!customer.isVip;
            const tier = customer.vipTier || 'GOLD';
            const tierConfig = TIER_INFO[tier];

            return (
              <div
                key={customer.id}
                id={`customer-card-${customer.id}`}
                className={`p-4 rounded-2xl backdrop-blur-xl border transition shadow-lg flex flex-col justify-between space-y-3 group ${
                  isVip
                    ? `bg-white/[0.07] ${tierConfig.borderGlow}`
                    : 'bg-white/5 border-white/10 hover:border-sky-400/40 hover:bg-white/[0.07] shadow-black/10'
                }`}
              >
                <div>
                  {/* Top Bar: VIP Badge & Sector & WhatsApp */}
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isVip ? (
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerForVip(customer)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border shadow-sm transition hover:scale-105 ${tierConfig.badgeClass}`}
                          title="Click para ajustar nivel y descuento VIP"
                        >
                          <Crown className="w-3 h-3 fill-current" />
                          <span>{tierConfig.label}</span>
                          <span className="font-mono bg-black/30 px-1 rounded ml-0.5">
                            {customer.vipDiscountPercent ?? 15}%
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleCustomerVip(customer.id, { isVip: true, vipTier: 'GOLD', vipDiscountPercent: 15 })}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 transition flex items-center gap-1"
                          title="Hacer cliente VIP"
                        >
                          <Crown className="w-2.5 h-2.5" />
                          <span>+ VIP</span>
                        </button>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/15 text-sky-300 border border-sky-500/20">
                        {customer.customerType === 'WISP_ISP' ? 'WISP / ISP' : customer.customerType}
                      </span>
                    </div>

                    <button
                      onClick={() => openCustomerWhatsApp(customer)}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 transition shrink-0"
                      title="Chatear por WhatsApp directo"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Customer Name & Company */}
                  <h3 className="font-bold text-sm text-white leading-snug group-hover:text-sky-300 transition flex items-center gap-1.5">
                    {isVip && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span className="truncate">{customer.name}</span>
                  </h3>
                  {customer.companyName && (
                    <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{customer.companyName}</span>
                    </p>
                  )}

                  {/* VIP Exclusive Benefits tags if applicable */}
                  {isVip && customer.vipSpecialBenefits && customer.vipSpecialBenefits.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {customer.vipSpecialBenefits.slice(0, 3).map((b, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[9.5px] font-medium text-amber-300 flex items-center gap-1"
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{b}</span>
                        </span>
                      ))}
                      {customer.vipSpecialBenefits.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-lg bg-white/5 text-[9px] text-slate-400">
                          +{customer.vipSpecialBenefits.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contact details */}
                  <div className="space-y-1 mt-2.5 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-slate-200">{customer.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{customer.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{customer.city}</span>
                    </p>
                  </div>

                  {/* Credit Status */}
                  {hasCredit && (
                    <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs backdrop-blur-md">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Límite de Crédito:</span>
                        <span className="font-bold text-white">
                          ${customer.creditLimit.toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Crédito Usado:</span>
                        <span className="font-bold text-rose-400">
                          ${customer.currentCredit.toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-white/10 mt-1">
                        <span className="text-emerald-400 font-medium">Disponible:</span>
                        <span className="font-extrabold text-emerald-400 font-mono">
                          ${availableCredit.toLocaleString('es-MX')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCustomerForHistory(customer)}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Pedidos ({sales.filter((s) => s.customerId === customer.id).length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCustomerForVip(customer)}
                      className={`text-[11px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg transition border ${
                        isVip
                          ? 'text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                          : 'text-slate-400 bg-white/5 border-white/10 hover:text-amber-300 hover:bg-white/10'
                      }`}
                    >
                      <Crown className="w-3 h-3" />
                      <span>{isVip ? 'Configurar VIP' : 'Asignar VIP'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCustomer(customer)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                      title="Editar datos del cliente"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id, customer.name)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-300 transition"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No se encontraron clientes registrados con ese criterio de búsqueda o filtro VIP.
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-xl w-full shadow-2xl p-6 space-y-4 text-xs animate-in fade-in max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>{customerToEdit ? 'Modificar Cliente' : 'Nuevo Cliente'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Martín Estrada Ruiz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Empresa / WISP</label>
                <input
                  type="text"
                  placeholder="Ej. WISP Chiapas Enlaces"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">RFC Facturación</label>
                <input
                  type="text"
                  placeholder="Ej. RES210512AB3"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono backdrop-blur-md focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 961-580-24-90"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono backdrop-blur-md focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="cliente@dominio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tipo de Cliente</label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
                >
                  <option value="WISP_ISP">Proveedor de Internet (WISP/ISP)</option>
                  <option value="INSTALADOR">Instalador / Técnico de Redes</option>
                  <option value="EMPRESA">Empresa / Corporativo</option>
                  <option value="PARTICULAR">Cliente Particular</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Límite de Crédito ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-bold backdrop-blur-md focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">Dirección & Ciudad</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Central Poniente #45, Tuxtla Gutiérrez, Chiapas"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>

            {/* VIP Status Settings inside Form */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">Estatus de Cliente VIP</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={(e) => setFormData({ ...formData, isVip: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                  <span className="font-bold text-amber-300 text-xs">
                    {formData.isVip ? 'Cliente VIP Habilitado' : 'Sin Estatus VIP'}
                  </span>
                </label>
              </div>

              {formData.isVip && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-amber-400/20">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Nivel VIP</label>
                    <select
                      value={formData.vipTier}
                      onChange={(e) => {
                        const tier = e.target.value as VipTier;
                        const disc = tier === 'PLATINUM' ? 20 : tier === 'GOLD' ? 15 : tier === 'SILVER' ? 10 : 5;
                        setFormData({ ...formData, vipTier: tier, vipDiscountPercent: disc });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-400/40 text-amber-300 font-bold focus:outline-none"
                    >
                      <option value="BRONZE">🥉 VIP Bronce (5% sugerido)</option>
                      <option value="SILVER">🥈 VIP Plata (10% sugerido)</option>
                      <option value="GOLD">🥇 VIP Oro (15% sugerido)</option>
                      <option value="PLATINUM">💎 VIP Platino (20% sugerido)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Descuento Preferencial (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.vipDiscountPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vipDiscountPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-400/40 text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 font-bold text-white shadow-lg shadow-sky-500/25 transition"
              >
                {customerToEdit ? 'Actualizar Cliente' : 'Registrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-2xl w-full shadow-2xl p-6 space-y-4 text-xs animate-in fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Historial de Compras y Pedidos</span>
                </h2>
                <p className="text-slate-400">
                  {selectedCustomerForHistory.name} {selectedCustomerForHistory.companyName && `(${selectedCustomerForHistory.companyName})`}
                  {selectedCustomerForHistory.isVip && (
                    <span className="ml-2 font-bold text-amber-300">👑 VIP {selectedCustomerForHistory.vipTier}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerForHistory(null)}
                className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {customerSales.length > 0 ? (
                customerSales.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white font-mono">{s.folio}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {s.status}
                        </span>
                        {s.isVipSale && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            👑 VIP ({s.vipDiscountPercent}% desc)
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {s.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Sucursal: {s.branchName} • Pago: {s.paymentMethod}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white font-mono block">
                        ${s.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCustomerForHistory(null);
                          setSelectedSaleForTicket(s);
                        }}
                        className="text-[11px] text-sky-400 hover:underline mt-1 font-semibold"
                      >
                        Ver Ticket
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  Este cliente aún no tiene compras registradas.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated VIP Configuration Modal */}
      {selectedCustomerForVip && (
        <VipModal
          customer={selectedCustomerForVip}
          isOpen={true}
          onClose={() => setSelectedCustomerForVip(null)}
          onSave={(customerId, vipData) => {
            toggleCustomerVip(customerId, vipData);
          }}
        />
      )}
    </div>
  );
};
