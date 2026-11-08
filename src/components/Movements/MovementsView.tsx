import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  Search,
  Plus,
  Filter,
  Calendar,
  Building,
  User,
  FileText,
  Clock,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MovementType } from '../../types';
import { StockMovementModal } from '../Inventory/StockMovementModal';

export const MovementsView: React.FC = () => {
  const { movements, branches, currentBranch } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'TODOS' | MovementType>('TODOS');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('TODAS');
  const [showModal, setShowModal] = useState(false);

  // Stats
  const stats = useMemo(() => {
    let entradas = 0;
    let salidas = 0;
    let ventas = 0;
    let transferencias = 0;

    movements.forEach((m) => {
      if (m.type === 'ENTRADA') entradas += m.quantity;
      if (m.type === 'SALIDA') salidas += m.quantity;
      if (m.type === 'VENTA') ventas += m.quantity;
      if (m.type === 'TRANSFERENCIA') transferencias += m.quantity;
    });

    return { entradas, salidas, ventas, transferencias };
  }, [movements]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesType = selectedType === 'TODOS' || m.type === selectedType;
      const matchesBranch =
        selectedBranchId === 'TODAS' ||
        m.branchId === selectedBranchId ||
        m.targetBranchId === selectedBranchId;

      const q = searchTerm.toLowerCase().trim();
      const matchesQuery =
        !q ||
        m.productName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.reason.toLowerCase().includes(q) ||
        (m.referenceDoc && m.referenceDoc.toLowerCase().includes(q)) ||
        m.user.toLowerCase().includes(q);

      return matchesType && matchesBranch && matchesQuery;
    });
  }, [movements, selectedType, selectedBranchId, searchTerm]);

  const getTypeStyle = (type: MovementType) => {
    switch (type) {
      case 'ENTRADA':
        return {
          icon: ArrowDownRight,
          label: 'Entrada',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          textClass: 'text-emerald-400 font-bold',
        };
      case 'SALIDA':
        return {
          icon: ArrowUpRight,
          label: 'Salida',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          textClass: 'text-rose-400 font-bold',
        };
      case 'VENTA':
        return {
          icon: ShoppingCart,
          label: 'Venta Mostrador',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          textClass: 'text-blue-400 font-bold',
        };
      case 'TRANSFERENCIA':
        return {
          icon: ArrowLeftRight,
          label: 'Transferencia',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          textClass: 'text-cyan-400 font-bold',
        };
      default:
        return {
          icon: Package,
          label: type,
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          textClass: 'text-slate-300',
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-transparent text-slate-100 p-4 sm:p-6 space-y-4">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Entradas</span>
            <span className="text-xl font-extrabold text-emerald-400">+{stats.entradas}</span>
            <span className="text-[10px] text-slate-500 block">piezas recibidas</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Ventas Salidas</span>
            <span className="text-xl font-extrabold text-sky-400">-{stats.ventas}</span>
            <span className="text-[10px] text-slate-500 block">equipos vendidos</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Transferencias</span>
            <span className="text-xl font-extrabold text-cyan-400">{stats.transferencias}</span>
            <span className="text-[10px] text-slate-500 block">entre sucursales</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Mermas / Ajustes</span>
            <span className="text-xl font-extrabold text-rose-400">-{stats.salidas}</span>
            <span className="text-[10px] text-slate-500 block">garantías / bajas</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg shadow-black/10 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            id="input-movement-search"
            placeholder="Buscar por equipo, SKU, motivo, folio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 backdrop-blur-md"
          />
        </div>

        {/* Filters and New Action */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Movement Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="py-2 px-3 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-sky-400 backdrop-blur-md"
          >
            <option value="TODOS" className="bg-slate-900 text-white">Todos los Tipos</option>
            <option value="ENTRADA" className="bg-slate-900 text-white">Solo Entradas (+)</option>
            <option value="SALIDA" className="bg-slate-900 text-white">Solo Salidas (-)</option>
            <option value="VENTA" className="bg-slate-900 text-white">Solo Ventas POS</option>
            <option value="TRANSFERENCIA" className="bg-slate-900 text-white">Solo Transferencias</option>
          </select>

          {/* Branch Filter */}
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-sky-400 backdrop-blur-md"
          >
            <option value="TODAS" className="bg-slate-900 text-white">Todas las Sucursales</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                {b.name}
              </option>
            ))}
          </select>

          <button
            id="btn-new-movement-action"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-sky-500/25 ml-auto transition"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="flex-1 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl shadow-black/20">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-xl text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10 z-10">
              <tr>
                <th className="px-4 py-3">Fecha & Hora</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-4 py-3">Producto / SKU</th>
                <th className="px-3 py-3">Sucursal / Destino</th>
                <th className="px-3 py-3 text-right">Cant.</th>
                <th className="px-4 py-3">Motivo / Documento</th>
                <th className="px-3 py-3">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMovements.map((m) => {
                const style = getTypeStyle(m.type);
                const Icon = style.icon;
                return (
                  <tr key={m.id} className="hover:bg-white/[0.04] transition">
                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      <span className="text-slate-500">
                        {new Date(m.createdAt).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{style.label}</span>
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-white text-xs leading-snug">{m.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">SKU: {m.sku}</p>
                    </td>

                    {/* Branch */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="text-slate-200 font-medium">{m.branchName}</p>
                      {m.targetBranchName && (
                        <p className="text-cyan-400 text-[10px] font-medium">
                          → {m.targetBranchName}
                        </p>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                      <span className={`text-sm ${style.textClass}`}>
                        {m.type === 'ENTRADA' ? '+' : '-'}
                        {m.quantity}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3">
                      <p className="text-slate-200">{m.reason}</p>
                      {m.referenceDoc && (
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-500/30">
                          {m.referenceDoc}
                        </span>
                      )}
                    </td>

                    {/* User */}
                    <td className="px-3 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {m.user}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMovements.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-xs">
              No hay movimientos que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* Movement Modal */}
      {showModal && (
        <StockMovementModal
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
