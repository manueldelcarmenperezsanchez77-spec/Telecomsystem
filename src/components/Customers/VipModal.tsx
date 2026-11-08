import React, { useState } from 'react';
import { Crown, Sparkles, Gem, ShieldCheck, Check, Percent, Gift, Award, Zap, X } from 'lucide-react';
import { Customer, VipTier } from '../../types';

interface VipModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerId: string, vipData: {
    isVip: boolean;
    vipTier: VipTier;
    vipDiscountPercent: number;
    vipSpecialBenefits: string[];
    vipNotes: string;
  }) => void;
}

const PRESET_BENEFITS = [
  'Precios Especiales de Mayoreo',
  'Soporte Técnico N2 Prioritario',
  'Garantía Express 24h',
  'Reserva y Apartado de Stock Crítico',
  'Línea de Crédito Extendida',
  'Envío Local Bonificado',
  'Préstamo de Equipo de Respaldo',
];

const TIER_CONFIG: Record<
  VipTier,
  { label: string; icon: string; defaultDiscount: number; color: string; badge: string }
> = {
  BRONZE: {
    label: 'Bronce',
    icon: '🥉',
    defaultDiscount: 5,
    color: 'border-amber-600/40 bg-amber-500/10 text-amber-300',
    badge: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
  },
  SILVER: {
    label: 'Plata',
    icon: '🥈',
    defaultDiscount: 10,
    color: 'border-slate-300/40 bg-slate-300/10 text-slate-200',
    badge: 'bg-slate-400/20 text-slate-200 border-slate-300/40',
  },
  GOLD: {
    label: 'Oro',
    icon: '🥇',
    defaultDiscount: 15,
    color: 'border-yellow-400/40 bg-yellow-500/10 text-yellow-300',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
  },
  PLATINUM: {
    label: 'Platino',
    icon: '💎',
    defaultDiscount: 20,
    color: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  },
};

export const VipModal: React.FC<VipModalProps> = ({ customer, isOpen, onClose, onSave }) => {
  const [isVip, setIsVip] = useState<boolean>(customer.isVip ?? true);
  const [vipTier, setVipTier] = useState<VipTier>(customer.vipTier || 'GOLD');
  const [vipDiscountPercent, setVipDiscountPercent] = useState<number>(
    customer.vipDiscountPercent ?? 15
  );
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    customer.vipSpecialBenefits || [
      'Precios Especiales de Mayoreo',
      'Soporte Técnico N2 Prioritario',
      'Garantía Express 24h',
    ]
  );
  const [customBenefit, setCustomBenefit] = useState('');
  const [vipNotes, setVipNotes] = useState(customer.vipNotes || '');

  if (!isOpen) return null;

  const handleTierChange = (tier: VipTier) => {
    setVipTier(tier);
    setVipDiscountPercent(TIER_CONFIG[tier].defaultDiscount);
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit) ? prev.filter((b) => b !== benefit) : [...prev, benefit]
    );
  };

  const handleAddCustomBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBenefit.trim()) return;
    if (!selectedBenefits.includes(customBenefit.trim())) {
      setSelectedBenefits((prev) => [...prev, customBenefit.trim()]);
    }
    setCustomBenefit('');
  };

  const handleSave = () => {
    onSave(customer.id, {
      isVip,
      vipTier,
      vipDiscountPercent: Math.max(0, Math.min(100, vipDiscountPercent)),
      vipSpecialBenefits: selectedBenefits,
      vipNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-amber-400/30 rounded-3xl max-w-xl w-full shadow-2xl shadow-amber-500/10 p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Gestión de Estatus VIP</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Fidelización
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Cliente: <strong className="text-slate-200">{customer.name}</strong> {customer.companyName ? `(${customer.companyName})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master VIP Toggle */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="font-bold text-white text-xs block">
              {isVip ? 'Cliente VIP Activo' : 'Cliente Estándar (Sin Beneficios VIP)'}
            </span>
            <span className="text-[11px] text-slate-400">
              Permite habilitar descuentos preferenciales automáticos y beneficios exclusivos en Punto de Venta.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsVip(!isVip)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isVip
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{isVip ? 'Estatus VIP Activo' : 'Activar como VIP'}</span>
          </button>
        </div>

        {isVip && (
          <div className="space-y-4 pt-1">
            {/* VIP Tier Selector */}
            <div>
              <label className="font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Nivel / Categoría VIP</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(TIER_CONFIG) as VipTier[]).map((tier) => {
                  const cfg = TIER_CONFIG[tier];
                  const isSelected = vipTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleTierChange(tier)}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between gap-1.5 ${
                        isSelected
                          ? `${cfg.color} border-2 shadow-lg shadow-black/20 ring-1 ring-white/20`
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{cfg.icon}</span>
                      <span className="font-bold text-xs">{cfg.label}</span>
                      <span className="text-[10px] opacity-80">{cfg.defaultDiscount}% sugerido</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount Percentage */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Descuento Preferencial en Punto de Venta</span>
                </label>
                <span className="font-extrabold text-sm text-emerald-400 font-mono">
                  {vipDiscountPercent}% OFF
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Este porcentaje se podrá aplicar de manera opcional o automática durante el cobro en el POS.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={vipDiscountPercent}
                  onChange={(e) => setVipDiscountPercent(parseInt(e.target.value) || 0)}
                  className="flex-1 accent-amber-400 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={vipDiscountPercent}
                  onChange={(e) => setVipDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 rounded-xl bg-slate-800 border border-white/15 text-center text-white font-bold"
                />
              </div>
            </div>

            {/* Special Benefits */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-sky-400" />
                <span>Beneficios Especiales Asignados</span>
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Selecciona las ventajas comerciales que este cliente disfrutará con TelecoSys:
              </p>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {PRESET_BENEFITS.map((benefit) => {
                  const active = selectedBenefits.includes(benefit);
                  return (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => toggleBenefit(benefit)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition flex items-center gap-1.5 ${
                        active
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-sky-400" />}
                      <span>{benefit}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom benefit adder */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Agregar otro beneficio personalizado..."
                  value={customBenefit}
                  onChange={(e) => setCustomBenefit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomBenefit(e);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomBenefit}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* VIP Notes */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Notas y Acuerdos Comerciales VIP
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Descuento pactado con gerencia para proyectos de fibra óptica en Berriozábal."
                value={vipNotes}
                onChange={(e) => setVipNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 text-xs"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Guardar Configuración VIP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
