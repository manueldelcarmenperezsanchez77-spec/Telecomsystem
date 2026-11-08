import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Edit,
  History,
  Trash2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Filter,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, TelecomCategory } from '../../types';
import { ProductModal } from './ProductModal';
import { StockMovementModal } from './StockMovementModal';
import { KardexModal } from './KardexModal';

const CATEGORIES: ('TODAS' | TelecomCategory)[] = [
  'TODAS',
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

export const InventoryView: React.FC = () => {
  const {
    products,
    deleteProduct,
    currentBranch,
    branches,
    getProductStock,
    currentUser,
  } = useApp();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'TODAS' | TelecomCategory>('TODAS');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementInitialProduct, setMovementInitialProduct] = useState<Product | null>(null);
  const [movementInitialType, setMovementInitialType] = useState<'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA'>('ENTRADA');

  const [kardexProduct, setKardexProduct] = useState<Product | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    let totalUnits = 0;
    let totalCostValuation = 0;
    let totalSaleValuation = 0;
    let lowStockItemsCount = 0;

    products.forEach((p) => {
      const stock = getProductStock(p);
      totalUnits += stock;
      totalCostValuation += stock * p.unitCost;
      totalSaleValuation += stock * p.salePrice;
      if (stock <= p.minStock) {
        lowStockItemsCount++;
      }
    });

    return {
      totalProducts: products.length,
      totalUnits,
      totalCostValuation,
      totalSaleValuation,
      lowStockItemsCount,
      estimatedProfit: totalSaleValuation - totalCostValuation,
    };
  }, [products, currentBranch]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'TODAS' || p.category === selectedCategory;

      const stock = getProductStock(p);
      const matchesLowStock = !onlyLowStock || stock <= p.minStock;

      const q = searchTerm.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        (p.model && p.model.toLowerCase().includes(q));

      return matchesCat && matchesLowStock && matchesQuery;
    });
  }, [products, selectedCategory, onlyLowStock, searchTerm, currentBranch]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}" del catálogo?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-transparent text-slate-100 p-4 sm:p-6 space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Products */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Catálogo Equipos</span>
            <span className="text-xl font-extrabold text-white">{stats.totalProducts}</span>
            <span className="text-[10px] text-slate-400 block">modelos activos</span>
          </div>
        </div>

        {/* Total Stock in current branch */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[130px]">
              Stock {currentBranch.code}
            </span>
            <span className="text-xl font-extrabold text-emerald-400">{stats.totalUnits}</span>
            <span className="text-[10px] text-slate-400 block">piezas disponibles</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10 flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              stats.lowStockItemsCount > 0
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse'
                : 'bg-white/5 border border-white/10 text-slate-500'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Stock Bajo</span>
            <span
              className={`text-xl font-extrabold ${
                stats.lowStockItemsCount > 0 ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              {stats.lowStockItemsCount}
            </span>
            <span className="text-[10px] text-slate-400 block">requieren resurtido</span>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Valor Inventario</span>
            <span className="text-lg font-extrabold text-white">
              ${stats.totalSaleValuation.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-emerald-400 block">
              Ganancia est: ${stats.estimatedProfit.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category, Actions */}
      <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 space-y-3 shadow-lg shadow-black/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="input-inventory-search"
              placeholder="Buscar por SKU, nombre, modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 backdrop-blur-md"
            />
          </div>

          {/* Category dropdown & Low stock toggle */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="py-2 px-3 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-sky-400 backdrop-blur-md"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c === 'TODAS' ? 'Todas las Categorías' : c}
                </option>
              ))}
            </select>

            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                onlyLowStock
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Bajo Stock</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                id="btn-open-movement-modal"
                onClick={() => {
                  setMovementInitialProduct(null);
                  setMovementInitialType('ENTRADA');
                  setShowMovementModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Entrada / Salida</span>
              </button>

              <button
                id="btn-open-new-product-modal"
                onClick={() => {
                  setProductToEdit(null);
                  setShowProductModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-sky-500/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl shadow-black/20">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-xl text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10 z-10">
              <tr>
                <th className="px-4 py-3">Equipo / Producto</th>
                <th className="px-3 py-3">Categoría</th>
                <th className="px-3 py-3 text-right">Costo</th>
                <th className="px-3 py-3 text-right">Precio Venta</th>
                <th className="px-3 py-3 text-center">Stock Matriz</th>
                <th className="px-3 py-3 text-center">San Cristóbal</th>
                <th className="px-3 py-3 text-center">Tapachula</th>
                <th className="px-3 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p) => {
                const stockHere = getProductStock(p);
                const isOutOfStock = stockHere <= 0;
                const isLow = stockHere <= p.minStock && stockHere > 0;

                const stockMatriz = p.stockByBranch['br-tuxtla-matriz'] ?? 0;
                const stockScl = p.stockByBranch['br-sancristobal'] ?? 0;
                const stockTap = p.stockByBranch['br-tapachula'] ?? 0;

                return (
                  <tr
                    key={p.id}
                    id={`row-product-${p.sku}`}
                    className="hover:bg-white/[0.04] transition group"
                  >
                    {/* Product Name & SKU */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-white text-xs leading-snug group-hover:text-sky-300 transition">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>SKU: {p.sku}</span>
                          <span>•</span>
                          <span>{p.brand}</span>
                          {p.model && <span>({p.model})</span>}
                          {p.trackSerial && (
                            <span className="text-sky-400 font-bold bg-sky-500/20 px-1 rounded border border-sky-500/30">
                              S/N
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10">
                        {p.category}
                      </span>
                    </td>

                    {/* Unit Cost */}
                    <td className="px-3 py-3 text-right font-mono text-slate-400">
                      ${p.unitCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Sale Price */}
                    <td className="px-3 py-3 text-right font-mono font-bold text-white">
                      ${p.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Multi-branch columns */}
                    <td className="px-3 py-3 text-center font-mono font-semibold">
                      <span className={currentBranch.id === 'br-tuxtla-matriz' ? 'text-sky-400 font-bold' : 'text-slate-300'}>
                        {stockMatriz}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-center font-mono font-semibold">
                      <span className={currentBranch.id === 'br-sancristobal' ? 'text-sky-400 font-bold' : 'text-slate-300'}>
                        {stockScl}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-center font-mono font-semibold">
                      <span className={currentBranch.id === 'br-tapachula' ? 'text-sky-400 font-bold' : 'text-slate-300'}>
                        {stockTap}
                      </span>
                    </td>

                    {/* Status badge in active branch */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isOutOfStock
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isOutOfStock ? 'Agotado' : isLow ? `Bajo (${stockHere})` : `${stockHere} disp`}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Kardex */}
                        <button
                          id={`btn-kardex-${p.sku}`}
                          onClick={() => setKardexProduct(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                          title="Ver Historial de Movimientos"
                        >
                          <History className="w-3.5 h-3.5 text-sky-400" />
                        </button>

                        {/* Fast stock movement */}
                        <button
                          id={`btn-move-stock-${p.sku}`}
                          onClick={() => {
                            setMovementInitialProduct(p);
                            setMovementInitialType('ENTRADA');
                            setShowMovementModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                          title="Registrar Entrada/Salida"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                        </button>

                        {/* Edit */}
                        <button
                          id={`btn-edit-product-${p.sku}`}
                          onClick={() => {
                            setProductToEdit(p);
                            setShowProductModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                          title="Modificar Producto"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        {/* Delete */}
                        <button
                          id={`btn-delete-product-${p.sku}`}
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-300 transition"
                          title="Eliminar del catálogo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-xs">
              No se encontraron productos coincidentes con los filtros actuales.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          productToEdit={productToEdit}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {showMovementModal && (
        <StockMovementModal
          initialProduct={movementInitialProduct}
          initialType={movementInitialType}
          onClose={() => setShowMovementModal(false)}
        />
      )}

      {kardexProduct && (
        <KardexModal
          product={kardexProduct}
          onClose={() => setKardexProduct(null)}
        />
      )}
    </div>
  );
};
