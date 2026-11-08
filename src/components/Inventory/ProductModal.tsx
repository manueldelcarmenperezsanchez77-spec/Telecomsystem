import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Cpu, Tag, Layers, Hash } from 'lucide-react';
import { Product, TelecomCategory } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductModalProps {
  productToEdit?: Product | null;
  onClose: () => void;
}

const CATEGORIES: TelecomCategory[] = [
  'Fibra Óptica',
  'Routers & Redes',
  'Antenas & Wireless',
  'Switches & PoE',
  'Cables & Conectores',
  'Herramientas & Medición',
  'CCTV & Seguridad',
  'Servidores & Racks',
  'Telefonía IP & PBX',
];

const UNITS = ['Pieza', 'Bobina 305m', 'Bobina 1000m', 'Kit', 'Metro', 'Paquete'];

export const ProductModal: React.FC<ProductModalProps> = ({ productToEdit, onClose }) => {
  const { addProduct, updateProduct, branches, currentBranch } = useApp();

  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    brand: '',
    category: 'Routers & Redes' as TelecomCategory,
    description: '',
    unitCost: 0,
    salePrice: 0,
    minStock: 5,
    unit: 'Pieza',
    trackSerial: false,
    model: '',
    specifications: '',
    stockByBranch: {} as Record<string, number>,
  });

  const [serialInput, setSerialInput] = useState('');
  const [serialsList, setSerialsList] = useState<string[]>([]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        sku: productToEdit.sku,
        barcode: productToEdit.barcode,
        name: productToEdit.name,
        brand: productToEdit.brand,
        category: productToEdit.category,
        description: productToEdit.description || '',
        unitCost: productToEdit.unitCost,
        salePrice: productToEdit.salePrice,
        minStock: productToEdit.minStock,
        unit: productToEdit.unit,
        trackSerial: productToEdit.trackSerial,
        model: productToEdit.model || '',
        specifications: productToEdit.specifications || '',
        stockByBranch: { ...productToEdit.stockByBranch },
      });
      setSerialsList(productToEdit.serialNumbers || []);
    } else {
      // Default stock structure for all branches
      const initialStockMap: Record<string, number> = {};
      branches.forEach((b) => {
        initialStockMap[b.id] = b.id === currentBranch.id ? 10 : 0;
      });
      setFormData((prev) => ({
        ...prev,
        sku: 'TEL-' + Math.floor(1000 + Math.random() * 9000),
        barcode: '750' + Math.floor(1000000000 + Math.random() * 9000000000),
        stockByBranch: initialStockMap,
      }));
    }
  }, [productToEdit, branches, currentBranch]);

  const handleAddSerial = () => {
    if (!serialInput.trim()) return;
    if (!serialsList.includes(serialInput.trim())) {
      setSerialsList([...serialsList, serialInput.trim()]);
    }
    setSerialInput('');
  };

  const handleRemoveSerial = (idx: number) => {
    setSerialsList(serialsList.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.sku.trim()) {
      alert('Por favor complete el nombre y el SKU del producto.');
      return;
    }

    if (formData.salePrice < formData.unitCost) {
      const confirmMargin = confirm(
        'El precio de venta es menor que el costo unitario. ¿Deseas continuar?'
      );
      if (!confirmMargin) return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        ...formData,
        serialNumbers: formData.trackSerial ? serialsList : undefined,
      });
    } else {
      addProduct({
        ...formData,
        serialNumbers: formData.trackSerial ? serialsList : undefined,
      });
    }

    onClose();
  };

  const calculatedMargin =
    formData.salePrice > 0
      ? (((formData.salePrice - formData.unitCost) / formData.salePrice) * 100).toFixed(1)
      : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm sm:text-base text-white">
              {productToEdit ? 'Modificar Equipo de Telecomunicaciones' : 'Nuevo Producto / Equipo'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">
                Nombre del Producto / Equipo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Routerboard Mikrotik hEX S (RB760iGS)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">SKU / Clave Interna *</label>
              <input
                type="text"
                required
                placeholder="Ej. MIK-HEX-S"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Código de Barras</label>
              <input
                type="text"
                placeholder="Ej. 7501002340011"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Marca</label>
              <input
                type="text"
                placeholder="Ej. MikroTik, Ubiquiti, Optronics, Huawei"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TelecomCategory })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Modelo del Fabricante</label>
              <input
                type="text"
                placeholder="Ej. RB760iGS / U6-Lite"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Unidad de Medida</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing and Margins */}
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
            <h3 className="font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span>Precios y Rentabilidad</span>
              <span className="text-[11px] font-normal text-emerald-400">
                Margen bruto: <strong>{calculatedMargin}%</strong>
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Costo Unitario ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Precio Venta Mostrador ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/50 text-emerald-300 font-extrabold text-sm"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Alerta Stock Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Multi-branch Stock Distribution */}
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
            <h3 className="font-bold text-slate-200 mb-2">
              Existencias por Sucursal (Sincronización en Nube)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {branches.map((b) => (
                <div key={b.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-300 block truncate">
                    {b.name}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockByBranch[b.id] ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        stockByBranch: {
                          ...formData.stockByBranch,
                          [b.id]: val,
                        },
                      });
                    }}
                    className="w-full mt-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-bold text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Serials / MAC for Telecom Hardware */}
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">
                  Control de Números de Serie / MAC / IMEI
                </span>
                <span className="text-[10px] text-slate-400">
                  Requerido para control de garantías en routers, radios y switches
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.trackSerial}
                onChange={(e) => setFormData({ ...formData, trackSerial: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
              />
            </div>

            {formData.trackSerial && (
              <div className="pt-2 border-t border-slate-750 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribir S/N o escanear y presionar Enter..."
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSerial();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSerial}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {serialsList.map((sn, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-cyan-300"
                    >
                      {sn}
                      <button
                        type="button"
                        onClick={() => handleRemoveSerial(idx)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specs / Description */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Especificaciones Técnicas / Puertos / Frecuencia
            </label>
            <textarea
              rows={2}
              placeholder="Ej. 5x GbE, 1x SFP, PoE Out en puerto 5, 5GHz airMAX 23dBi..."
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Bottom Actions */}
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
              id="btn-save-product-modal"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-md shadow-blue-600/30"
            >
              <Save className="w-4 h-4" />
              <span>{productToEdit ? 'Guardar Cambios' : 'Registrar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
