import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  AlertTriangle,
  CreditCard,
  Building,
  Package,
  ArrowUpRight,
  Printer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { sales, products, currentBranch, branches, setSelectedSaleForTicket } = useApp();

  const [period, setPeriod] = useState<'HOY' | 'SEMANA' | 'MES' | 'TODO'>('MES');
  const [branchFilter, setBranchFilter] = useState<string>('TODAS');

  // Filter sales by period and branch
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);

      if (branchFilter !== 'TODAS' && sale.branchId !== branchFilter) {
        return false;
      }

      if (period === 'HOY') {
        return (
          saleDate.getDate() === now.getDate() &&
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      } else if (period === 'SEMANA') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return saleDate >= oneWeekAgo;
      } else if (period === 'MES') {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [sales, period, branchFilter]);

  // Analytics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalItemsSold = 0;
    let totalCost = 0;
    const paymentMethodsMap: Record<string, number> = {
      EFECTIVO: 0,
      TARJETA: 0,
      TRANSFERENCIA: 0,
      CREDITO: 0,
    };

    const productSalesCount: Record<
      string,
      { name: string; sku: string; units: number; revenue: number }
    > = {};

    filteredSales.forEach((sale) => {
      if (sale.status === 'CANCELADA') return;

      totalRevenue += sale.total;
      paymentMethodsMap[sale.paymentMethod] =
        (paymentMethodsMap[sale.paymentMethod] || 0) + sale.total;

      sale.items.forEach((item) => {
        totalItemsSold += item.quantity;
        const prod = products.find((p) => p.id === item.productId);
        const itemCost = prod ? prod.unitCost * item.quantity : 0;
        totalCost += itemCost;

        if (!productSalesCount[item.productId]) {
          productSalesCount[item.productId] = {
            name: item.productName,
            sku: item.sku,
            units: 0,
            revenue: 0,
          };
        }
        productSalesCount[item.productId].units += item.quantity;
        productSalesCount[item.productId].revenue += item.subtotal;
      });
    });

    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    const topProducts = Object.values(productSalesCount)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return {
      totalRevenue,
      netProfit,
      profitMargin,
      totalOrders: filteredSales.length,
      totalItemsSold,
      paymentMethodsMap,
      topProducts,
    };
  }, [filteredSales, products]);

  // CSV Export
  const exportCSV = () => {
    const rows = [
      ['Folio', 'Fecha', 'Sucursal', 'Cliente', 'Atendio', 'Metodo Pago', 'Total MXN'],
      ...filteredSales.map((s) => [
        s.folio,
        new Date(s.createdAt).toLocaleString('es-MX'),
        s.branchName,
        s.customerName,
        s.sellerName,
        s.paymentMethod,
        s.total.toString(),
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Ventas_TelecoSys_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-transparent text-slate-100 p-4 sm:p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>Reportes & Finanzas en Tiempo Real</span>
          </h1>
          <p className="text-xs text-slate-400">
            Métricas de facturación, utilidades, productos líderes y flujo por sucursal
          </p>
        </div>

        {/* Filter buttons & Export */}
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl text-xs font-semibold shadow-lg shadow-black/10">
            {(['HOY', 'SEMANA', 'MES', 'TODO'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  period === p
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'HOY'
                  ? 'Hoy'
                  : p === 'SEMANA'
                  ? 'Semana'
                  : p === 'MES'
                  ? 'Este Mes'
                  : 'Todo'}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition shadow-lg shadow-black/10"
            title="Exportar Reporte a CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Sales */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Ventas Totales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            ${metrics.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">
            {metrics.totalOrders} órdenes facturadas
          </span>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Utilidad Neta Est.</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-extrabold text-cyan-400">
            ${metrics.netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Margen de ganancia: <strong className="text-white">{metrics.profitMargin}%</strong>
          </span>
        </div>

        {/* Items Sold */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Equipos Despachados</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            {metrics.totalItemsSold}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            unidades entregadas a clientes
          </span>
        </div>

        {/* Average Ticket */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Ticket Promedio</span>
            <ShoppingCart className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            $
            {metrics.totalOrders > 0
              ? (metrics.totalRevenue / metrics.totalOrders).toLocaleString('es-MX', {
                  maximumFractionDigits: 0,
                })
              : 0}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            promedio por cliente
          </span>
        </div>
      </div>

      {/* Middle Breakdown: Top Products & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Selling Products */}
        <div className="lg:col-span-2 p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg shadow-black/10">
          <h2 className="font-bold text-sm text-white mb-3 flex items-center justify-between">
            <span>Equipos Más Vendidos en Telecomunicaciones</span>
            <span className="text-[11px] font-normal text-slate-400">Por volumen de venta</span>
          </h2>

          <div className="space-y-2.5">
            {metrics.topProducts.map((p, idx) => {
              const percent =
                metrics.totalRevenue > 0
                  ? Math.min(100, (p.revenue / metrics.totalRevenue) * 100)
                  : 0;

              return (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-[10px] flex items-center justify-center border border-sky-500/30">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                        {p.name}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white">
                        ${p.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        ({p.units} pzas)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {metrics.topProducts.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No hay registros de ventas para el período seleccionado.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg shadow-black/10 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-white mb-3">Distribución por Método de Pago</h2>
            <div className="space-y-3 text-xs">
              {[
                { id: 'EFECTIVO', label: 'Efectivo Mostrador', color: 'bg-emerald-500' },
                { id: 'TRANSFERENCIA', label: 'Transferencia SPEI', color: 'bg-sky-500' },
                { id: 'TARJETA', label: 'Tarjeta Débito/Crédito', color: 'bg-cyan-500' },
                { id: 'CREDITO', label: 'Crédito WISP / Cliente', color: 'bg-purple-500' },
              ].map((m) => {
                const val = metrics.paymentMethodsMap[m.id] || 0;
                const pct =
                  metrics.totalRevenue > 0
                    ? ((val / metrics.totalRevenue) * 100).toFixed(0)
                    : 0;
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-200">{m.label}</span>
                      <span className="font-mono font-bold text-white">
                        ${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className={`${m.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 text-center">
            Sincronización en tiempo real multi-sucursal
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="flex-1 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl shadow-black/20">
        <div className="p-3.5 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between text-xs">
          <span className="font-bold text-white">Últimas Transacciones Registradas</span>
          <span className="text-slate-400 font-mono">{filteredSales.length} ventas</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 backdrop-blur-xl text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-4 py-2.5">Folio</th>
                <th className="px-3 py-2.5">Fecha</th>
                <th className="px-3 py-2.5">Sucursal</th>
                <th className="px-4 py-2.5">Cliente</th>
                <th className="px-3 py-2.5">Pago</th>
                <th className="px-4 py-2.5 text-right">Total MXN</th>
                <th className="px-3 py-2.5 text-center">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.04] transition">
                  <td className="px-4 py-2.5 font-bold text-sky-400">{s.folio}</td>
                  <td className="px-3 py-2.5 text-slate-400 text-[11px]">
                    {new Date(s.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-3 py-2.5 text-slate-300 font-sans text-xs">{s.branchName}</td>
                  <td className="px-4 py-2.5 font-sans font-medium text-white">{s.customerName}</td>
                  <td className="px-3 py-2.5 text-slate-300 font-sans text-[11px]">{s.paymentMethod}</td>
                  <td className="px-4 py-2.5 text-right font-extrabold text-white">
                    ${s.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setSelectedSaleForTicket(s)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-sans font-semibold transition"
                    >
                      Ver Ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No hay transacciones para mostrar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
