import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check, PackageCheck } from 'lucide-react';
import { Product, MovementType } from '../../types';
import { useApp } from '../../context/AppContext';

interface StockMovementModalProps {
  initialProduct?: Product | null;
  initialType?: MovementType;
  onClose: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  initialProduct,
  initialType = 'ENTRADA',
  onClose,
}) => {
  const {
    products,
    branches,
    currentBranch,
    getProductStock,
    registerMovement,
    currentUser,
  } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct ? initialProduct.id : products[0]?.id || ''
  );
  const [movementType, setMovementType] = useState<MovementType>(initialType);
  const [quantity, setQuantity] = useState<number>(1);
  const [targetBranchId, setTargetBranchId] = useState<string>(
    branches.find((b) => b.id !== currentBranch.id)?.id || ''
  );
  const [reason, setReason] = useState<string>('');
  const [referenceDoc, setReferenceDoc] = useState<string>('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentStock = selectedProduct ? getProductStock(selectedProduct) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Seleccione un producto válido');
      return;
    }

    if (quantity <= 0) {
      alert('La cantidad debe ser mayor a cero');
      return;
    }

    if ((movementType === 'SALIDA' || movementType === 'TRANSFERENCIA') && quantity > currentStock) {
      alert(`No hay suficiente existencia en ${currentBranch.name}. Existencia actual: ${currentStock}`);
      return;
    }

    if (movementType === 'TRANSFERENCIA' && !targetBranchId) {
      alert('Seleccione la sucursal de destino para la transferencia');
      return;
    }

    registerMovement({
      type: movementType,
      productId: selectedProduct.id,
      quantity,
      reason: reason || `${movementType} manual registrada por ${currentUser.name}`,
      referenceDoc: referenceDoc || undefined,
      targetBranchId: movementType === 'TRANSFERENCIA' ? targetBranchId : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-auto animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm text-white">Registrar Movimiento de Inventario</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Movement Type Tabs */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Tipo de Operación</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setMovementType('ENTRADA')}
                className={`p-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition ${
                  movementType === 'ENTRADA'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                <span>Entrada Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('SALIDA')}
                className={`p-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition ${
                  movementType === 'SALIDA'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                <span>Salida Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('TRANSFERENCIA')}
                className={`p-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition ${
                  movementType === 'TRANSFERENCIA'
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                <span>Transferencia</span>
              </button>
            </div>
          </div>

          {/* Product Picker */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Producto / Equipo *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - Stock: {getProductStock(p)} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          {selectedProduct && (
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Sucursal Origen:</span>
                <span className="font-bold text-white">{currentBranch.name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">Existencia Actual:</span>
                <span className="text-base font-extrabold text-blue-400">
                  {currentStock} {selectedProduct.unit}
                </span>
              </div>
            </div>
          )}

          {/* Target Branch if Transfer */}
          {movementType === 'TRANSFERENCIA' && (
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Sucursal de Destino *
              </label>
              <select
                value={targetBranchId}
                onChange={(e) => setTargetBranchId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              >
                {branches
                  .filter((b) => b.id !== currentBranch.id)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Cantidad a {movementType === 'ENTRADA' ? 'Ingresar' : movementType === 'SALIDA' ? 'Descargar' : 'Transferir'} *
            </label>
            <input
              type="number"
              min="1"
              max={movementType !== 'ENTRADA' ? currentStock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Motivo del Movimiento</label>
            <input
              type="text"
              placeholder={
                movementType === 'ENTRADA'
                  ? 'Ej. Factura Syscom #8912, Compra a fabricante'
                  : movementType === 'SALIDA'
                  ? 'Ej. Instalación interna nodo, equipo para garantía'
                  : 'Ej. Reabastecimiento de sucursal'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          {/* Reference Doc */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Documento de Referencia (Factura / Remisión)
            </label>
            <input
              type="text"
              placeholder="Ej. FAC-2026-9901 / GUIA-ESTAFETA"
              value={referenceDoc}
              onChange={(e) => setReferenceDoc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-confirm-stock-movement"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Movimiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
