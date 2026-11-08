import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Search,
  CheckCircle2,
  Clock,
  Package,
  Wrench,
  Wifi,
  ShieldCheck,
  Send,
  Building2,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { useApp, WHATSAPP_SUPPORT_NUMBER, WHATSAPP_CLEAN_PHONE } from '../../context/AppContext';
import { Sale } from '../../types';

export const SupportView: React.FC = () => {
  const { sales, openWhatsAppSupport, currentBranch, currentUser } = useApp();

  // Order tracking input
  const [searchFolio, setSearchFolio] = useState('');
  const [searchedSale, setSearchedSale] = useState<Sale | null>(null);
  const [searched, setSearched] = useState(false);

  // Custom support message input
  const [customMsg, setCustomMsg] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Soporte Técnico de Equipos');

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    if (!searchFolio.trim()) {
      setSearchedSale(null);
      return;
    }
    const found = sales.find(
      (s) => s.folio.toLowerCase() === searchFolio.trim().toLowerCase()
    );
    setSearchedSale(found || null);
  };

  const handleSendCustomSupport = (e: React.FormEvent) => {
    e.preventDefault();
    const fullMessage =
      `*SOLICITUD DE ATENCIÓN DIRECTA TELECOSYS*\n` +
      `📞 Número de atención: ${WHATSAPP_SUPPORT_NUMBER}\n` +
      `📌 *Tema:* ${selectedTopic}\n` +
      `🏢 *Sucursal:* ${currentBranch.name}\n` +
      `👤 *Usuario:* ${currentUser.name} (${currentUser.role})\n` +
      `--------------------------------\n` +
      `*MENSAJE:*\n${customMsg || 'Solicito asistencia técnica para equipos de telecomunicaciones.'}\n` +
      `--------------------------------\n` +
      `Enviado desde el Sistema TelecoSys POS & Inventario.`;

    openWhatsAppSupport(fullMessage);
  };

  const handleOrderWhatsAppInquiry = (sale: Sale) => {
    const message =
      `*SEGUIMIENTO DE PEDIDO - TELECOSYS*\n` +
      `📄 *Folio:* ${sale.folio}\n` +
      `👤 *Cliente:* ${sale.customerName}\n` +
      `🏢 *Sucursal:* ${sale.branchName}\n` +
      `📅 *Fecha:* ${new Date(sale.createdAt).toLocaleString('es-MX')}\n` +
      `💰 *Total:* $${sale.total.toLocaleString('es-MX')} MXN\n` +
      `📦 *Artículos:* ${sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}\n\n` +
      `Hola equipo de soporte técnico (961-580-24-90), solicito seguimiento sobre el estado y entrega de este pedido.`;

    openWhatsAppSupport(message);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-transparent text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Top Banner WhatsApp 961-580-24-90 */}
      <div className="p-6 rounded-3xl bg-emerald-950/40 backdrop-blur-2xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Canal Oficial de Atención Directa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Soporte Técnico & Seguimiento de Pedidos
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Comunícate de manera inmediata con nuestro equipo especializado en telecomunicaciones,
              enlaces inalámbricos, fibra óptica y sistemas.
            </p>
          </div>

          {/* Big WhatsApp Call-to-action button */}
          <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
            <button
              id="btn-main-whatsapp-support"
              onClick={() => openWhatsAppSupport()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
              <span>WhatsApp: {WHATSAPP_SUPPORT_NUMBER}</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              Horario: Lunes a Sábado 8:00 AM - 7:00 PM
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Order Tracker / Seguimiento de Pedidos */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4 shadow-lg shadow-black/10 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-400" />
              <h2 className="font-bold text-base text-white">Seguimiento de Pedidos & Envíos</h2>
            </div>
            <p className="text-xs text-slate-400">
              Ingresa el folio del ticket (ej. <code className="text-sky-300 font-bold">TEL-2026-0001</code>)
              para consultar su estatus en tiempo real y solicitar asistencia inmediata.
            </p>

            {/* Tracker Form */}
            <form onSubmit={handleSearchOrder} className="flex gap-2 pt-1">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="input-support-folio"
                  placeholder="Escribir Folio (ej. TEL-2026-0001)..."
                  value={searchFolio}
                  onChange={(e) => setSearchFolio(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-mono placeholder-slate-400 focus:outline-none focus:border-sky-400 backdrop-blur-md"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition"
              >
                Consultar
              </button>
            </form>

            {/* Order Result Card */}
            {searched && (
              <div className="pt-2">
                {searchedSale ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div>
                        <span className="font-mono font-extrabold text-sm text-sky-400 block">
                          {searchedSale.folio}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(searchedSale.createdAt).toLocaleString('es-MX')}
                        </span>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {searchedSale.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Cliente:</span>
                        <span className="font-semibold">{searchedSale.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Sucursal de Venta:</span>
                        <span className="font-semibold">{searchedSale.branchName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Método de Pago:</span>
                        <span className="font-semibold">{searchedSale.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Total:</span>
                        <span className="font-mono font-bold text-white">
                          ${searchedSale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                        Contenido del Pedido:
                      </span>
                      <ul className="space-y-1">
                        {searchedSale.items.map((item, i) => (
                          <li key={i} className="text-[11px] text-slate-200 flex justify-between">
                            <span>
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-mono font-bold text-slate-400">
                              ${item.subtotal.toLocaleString('es-MX')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* WhatsApp Action Button */}
                    <button
                      onClick={() => handleOrderWhatsAppInquiry(searchedSale)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Rastrear Pedido con Soporte WhatsApp ({WHATSAPP_SUPPORT_NUMBER})</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-slate-400 text-xs backdrop-blur-md">
                    No se encontró ningún pedido con el folio "{searchFolio}". Verifica el número.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fast folios suggestions */}
          {sales.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] text-slate-400 block mb-1.5">Últimos folios emitidos:</span>
              <div className="flex flex-wrap gap-1.5">
                {sales.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSearchFolio(s.folio);
                      setSearched(true);
                      setSearchedSale(s);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sky-300 font-mono text-[10px] border border-white/10 transition"
                  >
                    {s.folio}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Module 2: Direct Technical Assistance Form */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4 shadow-lg shadow-black/10 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-base text-white">Soporte Técnico Especializado</h2>
            </div>
            <p className="text-xs text-slate-400">
              Asesoría directa en ingeniería para configuración de routers Mikrotik, radios Ubiquiti,
              redes GPON y empalmes de fibra óptica.
            </p>

            <form onSubmit={handleSendCustomSupport} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Área o Tipo de Consulta</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-emerald-400 backdrop-blur-md"
                >
                  <option value="Soporte Técnico de Equipos">Soporte Técnico de Equipos</option>
                  <option value="Configuración Router Mikrotik / Cisco">Configuración Router Mikrotik / Cisco</option>
                  <option value="Enlaces Inalámbricos Ubiquiti / Mimosa">Enlaces Inalámbricos Ubiquiti / Mimosa</option>
                  <option value="Fibra Óptica FTTH y Fusionadoras">Fibra Óptica FTTH y Fusionadoras</option>
                  <option value="Garantía de Hardware o Devolución">Garantía de Hardware o Devolución</option>
                  <option value="Cotización Especial de Mayoreo WISP">Cotización Especial de Mayoreo WISP</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Detalle de la Solicitud</label>
                <textarea
                  rows={3}
                  placeholder="Describe la falla, modelo del equipo o requerimiento técnico..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 backdrop-blur-md"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Consulta a WhatsApp ({WHATSAPP_SUPPORT_NUMBER})</span>
              </button>
            </form>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 mt-2 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-slate-300">
              <p className="font-bold text-white">Centro de Soporte Tuxtla Gutiérrez</p>
              <p className="text-slate-400">Atención técnica directa en Av. Central Poniente #1045</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick FAQ / Technical Guides for Telecom */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3 shadow-lg shadow-black/10">
        <h2 className="font-bold text-sm text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Guías Rápidas y Preguntas Frecuentes de Telecomunicaciones</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 backdrop-blur-md">
            <p className="font-bold text-sky-300">¿Cómo verificar el S/N para garantía?</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              El número de serie está impreso en la etiqueta trasera del router o antena y en el ticket
              emitido por nuestro sistema POS.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 backdrop-blur-md">
            <p className="font-bold text-sky-300">¿Cómo solicitar traspaso entre sucursales?</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Puedes registrar una transferencia en el módulo de Inventario o solicitarla por WhatsApp
              al {WHATSAPP_SUPPORT_NUMBER} con 24 hrs de anticipación.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 backdrop-blur-md">
            <p className="font-bold text-sky-300">¿Precios de mayoreo para WISPs?</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Si adquieres bobinas por pallet o radios en paquetes de 5 piezas, contacta a nuestro asesor
              de mayoreo vía WhatsApp para aplicar precios especiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

