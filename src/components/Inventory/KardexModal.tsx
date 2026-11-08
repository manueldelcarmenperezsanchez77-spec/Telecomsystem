import React from 'react';
import { X, History, ArrowDownRight, ArrowUpRight, ArrowLeftRight, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface KardexModalProps {
  product: Product;
  onClose: () => void;
}

export const KardexModal: React.FC<KardexModalProps> = ({ product, onClose }) => {
  const { movements, getProductStock, currentBranch } = useApp();

  const productMovements = movements.filter((m) => m.productId === product.id);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ENTRADA':
        return {
          icon: ArrowDownRight,
          label: 'Entrada',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'SALIDA':
        return {
          icon: ArrowUpRight,
          label: 'Salida',
          className: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'VENTA':
        return {
          icon: ShoppingCart,
          label: 'Venta POS',
          className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
      case 'TRANSFERENCIA':
        return {
          icon: ArrowLeftRight,
          label: 'Transferencia',
          className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        };
      default:
        return {
          icon: History,
          label: type,
          className: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-bold text-sm text-white">Historial de Movimientos (Kardex)</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {product.name} • SKU: {product.sku}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Stock Summary */}
        <div className="p-4 bg-slate-850/50 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-750">
            <span className="text-slate-400 text-[10px] block">Stock en {currentBranch.name}</span>
            <span className="font-extrabold text-sm text-emerald-400">
              {getProductStock(product)} {product.unit}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-750">
            <span className="text-slate-400 text-[10px] block">Costo de Compra</span>
            <span className="font-bold text-sm text-white">
              ${product.unitCost.toLocaleString('es-MX')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-750">
            <span className="text-slate-400 text-[10px] block">Precio Venta</span>
            <span className="font-bold text-sm text-blue-400">
              ${product.salePrice.toLocaleString('es-MX')}
            </span>
          </div>
        </div>

        {/* Movements Table */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {productMovements.length > 0 ? (
            <div className="space-y-2">
              {productMovements.map((mov) => {
                const badge = getTypeBadge(mov.type);
                const Icon = badge.icon;
                return (
                  <div
                    key={mov.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-900 text-slate-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(mov.createdAt).toLocaleString('es-MX')}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-200 mt-1">{mov.reason}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>Sucursal: {mov.branchName}</span>
                          {mov.targetBranchName && <span>→ A: {mov.targetBranchName}</span>}
                          {mov.referenceDoc && <span>• Ref: {mov.referenceDoc}</span>}
                          <span>• Por: {mov.user}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-700 sm:pl-4">
                      <span className="text-slate-400 text-[10px] block">Cantidad:</span>
                      <span
                        className={`text-sm font-extrabold ${
                          mov.type === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {mov.type === 'ENTRADA' ? '+' : '-'}
                        {mov.quantity} {product.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No hay movimientos registrados para este producto todavía.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
