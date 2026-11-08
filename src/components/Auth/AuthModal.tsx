import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  X,
  CheckCircle2,
  Lock,
  KeyRound,
  UserPlus,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { currentUser, setCurrentUser, availableUsers, currentBranch, branches, setCurrentBranch } =
    useApp();

  const [activeTab, setActiveTab] = useState<'SWITCH' | 'NEW'>('SWITCH');

  // Form for new operator
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('VENDEDOR');

  const handleSelectUser = (user: typeof currentUser) => {
    setCurrentUser(user);
    onClose();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser = {
      id: 'usr-' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      phone: '961-580-24-90',
    };

    setCurrentUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto animate-in fade-in text-xs">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-bold text-sm text-white">Autenticación de Empresa</h2>
              <p className="text-[11px] text-slate-400">Control de perfiles y seguridad de acceso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Logged User Overview */}
        <div className="p-4 bg-white/[0.02] border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 block font-mono">Sesión Activa:</span>
            <p className="font-bold text-sm text-white truncate">{currentUser.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {currentUser.role}
              </span>
              <span className="text-[10px] text-slate-400 truncate">{currentBranch.name}</span>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="p-5 space-y-4">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('SWITCH')}
              className={`flex-1 py-2 rounded-xl font-semibold transition ${
                activeTab === 'SWITCH'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cambiar Operador
            </button>
            <button
              onClick={() => setActiveTab('NEW')}
              className={`flex-1 py-2 rounded-xl font-semibold transition ${
                activeTab === 'NEW'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrar Operador
            </button>
          </div>

          {activeTab === 'SWITCH' ? (
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 block">
                Selecciona una cuenta registrada para operar el sistema:
              </span>

              {availableUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition backdrop-blur-md ${
                      isCurrent
                        ? 'bg-sky-500/15 border-sky-400/60 text-white shadow-lg shadow-sky-500/10'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs border border-white/15">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 block mb-0.5">
                        {u.role}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-emerald-400 font-bold">Activo</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Daniel Salazar"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="operador@telecosys.mx"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white backdrop-blur-md focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Rol / Permisos</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white backdrop-blur-md focus:outline-none focus:border-sky-400"
                >
                  <option value="ADMIN">Administrador (Control total y reportes)</option>
                  <option value="VENDEDOR">Vendedor / POS (Caja, tickets y clientes)</option>
                  <option value="ALMACEN">Encargado de Almacén (Entradas, salidas y stock)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-bold text-white shadow-lg shadow-sky-500/25 mt-2 transition"
              >
                Crear y Cambiar a este Operador
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
