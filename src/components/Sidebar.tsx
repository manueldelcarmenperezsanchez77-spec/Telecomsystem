import React from 'react';
import {
  ShoppingCart,
  Boxes,
  ArrowLeftRight,
  Users,
  BarChart3,
  MessageCircle,
  Cloud,
  Layers,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { useApp, WHATSAPP_SUPPORT_NUMBER } from '../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenWhatsAppModal: () => void;
  onOpenSyncModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  setMobileOpen,
  onOpenWhatsAppModal,
  onOpenSyncModal,
}) => {
  const { activeTab, setActiveTab, cart, products, currentBranch, cloudSync } = useApp();

  const lowStockCount = products.filter(
    (p) => (p.stockByBranch[currentBranch.id] || 0) <= p.minStock
  ).length;

  const navItems = [
    {
      id: 'pos',
      label: 'Punto de Venta',
      shortLabel: 'POS',
      icon: ShoppingCart,
      badge: cart.length > 0 ? `${cart.length}` : null,
      badgeColor: 'bg-blue-600 text-white',
      description: 'Cobro rápido, tickets y cotizaciones',
    },
    {
      id: 'inventory',
      label: 'Control Inventario',
      shortLabel: 'Inventario',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} bajos` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      description: 'Catálogo, stock por sucursal y precios',
    },
    {
      id: 'movements',
      label: 'Entradas y Salidas',
      shortLabel: 'Kardex',
      icon: ArrowLeftRight,
      badge: null,
      description: 'Historial de movimientos y transferencias',
    },
    {
      id: 'customers',
      label: 'Gestión Clientes',
      shortLabel: 'Clientes',
      icon: Users,
      badge: null,
      description: 'WISPs, instaladores y cuentas corrientes',
    },
    {
      id: 'reports',
      label: 'Reportes en Vivo',
      shortLabel: 'Reportes',
      icon: BarChart3,
      badge: null,
      description: 'Ventas, márgenes y métricas en tiempo real',
    },
    {
      id: 'support',
      label: 'Soporte & Pedidos',
      shortLabel: 'WhatsApp',
      icon: MessageCircle,
      badge: '961',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      description: 'Atención directa 961-580-24-90',
    },
    {
      id: 'cloud',
      label: 'Sincronización Nube',
      shortLabel: 'Nube',
      icon: Cloud,
      badge: cloudSync.pendingChanges > 0 ? 'Sync' : 'OK',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      description: 'Multi-sucursal y respaldos',
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop + Mobile responsive) */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Módulos del Sistema
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  if (item.id === 'cloud') {
                    onOpenSyncModal();
                  } else {
                    setActiveTab(item.id);
                  }
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border border-sky-400/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-slate-400 group-hover:text-sky-400 group-hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="leading-tight">{item.label}</p>
                    <p
                      className={`text-[10px] line-clamp-1 font-normal ${
                        isActive ? 'text-sky-100' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      isActive ? 'bg-white text-sky-700' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Support Card */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02]">
          <div className="rounded-2xl bg-white/5 backdrop-blur-md p-3.5 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Soporte y Pedidos</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              Atención directa WhatsApp en Tuxtla Gtz y sucursales:
            </p>
            <button
              id="sidebar-btn-whatsapp"
              onClick={onOpenWhatsAppModal}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-400" />
              <span>961-580-24-90</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar for rapid thumb access on phones & small tablets */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative transition ${
                isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.shortLabel}</span>
              {item.badge && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-sky-500" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
