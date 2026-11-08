import React, { useState } from 'react';
import {
  Radio,
  Cloud,
  CloudCheck,
  RefreshCw,
  Phone,
  Building2,
  User,
  ShieldCheck,
  Menu,
  X,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp, WHATSAPP_SUPPORT_NUMBER } from '../context/AppContext';

interface NavbarProps {
  onOpenAuthModal: () => void;
  onOpenSyncModal: () => void;
  onOpenWhatsAppModal: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuthModal,
  onOpenSyncModal,
  onOpenWhatsAppModal,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const {
    currentBranch,
    branches,
    setCurrentBranch,
    currentUser,
    cloudSync,
    syncNow,
    openWhatsAppSupport,
  } = useApp();

  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrador', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'VENDEDOR':
        return { label: 'Ventas / POS', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'ALMACEN':
        return { label: 'Almacén', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { label: role, bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 text-slate-100 shadow-xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/90 flex items-center justify-center shadow-lg shadow-sky-500/30 border border-sky-400/40 text-white">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white drop-shadow-sm">
                    TelecoSys
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-300 rounded-md border border-sky-500/30">
                    POS & Inventario
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
                  Telecomunicaciones & Sistemas
                </p>
              </div>
            </div>
          </div>

          {/* Center: Branch Selector */}
          <div className="relative">
            <button
              id="btn-branch-selector"
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition shadow-sm backdrop-blur-md"
              title="Cambiar sucursal activa"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate font-semibold">
                {currentBranch.name}
              </span>
              <span className="text-[10px] text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-500/30 font-mono">
                {currentBranch.code}
              </span>
            </button>

            {branchDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setBranchDropdownOpen(false)}
                />
                <div className="absolute left-0 sm:right-0 mt-2 w-72 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl z-30 p-2 text-xs">
                  <div className="px-2.5 py-2 border-b border-white/10 mb-1">
                    <p className="font-bold text-white">Sucursal Operativa</p>
                    <p className="text-[11px] text-slate-400">
                      Sincronización de inventario multi-sucursal en la nube
                    </p>
                  </div>
                  <div className="space-y-1">
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        id={`btn-select-branch-${b.code}`}
                        onClick={() => {
                          setCurrentBranch(b);
                          setBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition ${
                          b.id === currentBranch.id
                            ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/25'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{b.name}</p>
                          <p className={`text-[10px] ${b.id === currentBranch.id ? 'text-sky-100' : 'text-slate-400'}`}>
                            {b.city}
                          </p>
                        </div>
                        {b.isMain && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${b.id === currentBranch.id ? 'bg-sky-600 text-white' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
                            MATRIZ
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Actions: Cloud Sync, WhatsApp Support, User */}
          <div className="flex items-center gap-2">
            {/* Cloud Sync Status Button */}
            <button
              id="btn-cloud-sync-status"
              onClick={onOpenSyncModal}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition backdrop-blur-md"
              title="Estado de sincronización en la nube"
            >
              <div className="relative">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="text-slate-300 font-medium">Nube Activa</span>
              {cloudSync.pendingChanges > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  +{cloudSync.pendingChanges}
                </span>
              )}
            </button>

            {/* Quick sync trigger button */}
            <button
              id="btn-sync-trigger"
              onClick={syncNow}
              disabled={cloudSync.isSyncing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition backdrop-blur-md"
              title="Sincronizar datos ahora"
            >
              <RefreshCw
                className={`w-4 h-4 ${cloudSync.isSyncing ? 'animate-spin text-sky-400' : 'text-slate-400'}`}
              />
            </button>

            {/* WhatsApp Direct Support Button (961-580-24-90) */}
            <button
              id="btn-header-whatsapp"
              onClick={onOpenWhatsAppModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-md shadow-emerald-500/15 backdrop-blur-md transition group"
              title={`Atención directa por WhatsApp: ${WHATSAPP_SUPPORT_NUMBER}`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="hidden xl:inline text-[11px] opacity-90 font-mono">
                {WHATSAPP_SUPPORT_NUMBER}
              </span>
            </button>

            {/* User Profile / Role button */}
            <button
              id="btn-user-profile"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition backdrop-blur-md"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-[11px] shadow-sm border border-white/20">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <p className="font-semibold text-slate-200 leading-tight max-w-[100px] truncate">
                  {currentUser.name}
                </p>
                <span className={`text-[9px] font-bold px-1 rounded border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
