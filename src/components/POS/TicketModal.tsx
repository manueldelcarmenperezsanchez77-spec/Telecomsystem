import React, { useRef } from 'react';
import {
  Printer,
  MessageCircle,
  X,
  CheckCircle2,
  Share2,
  Download,
  Building2,
  Calendar,
  User,
  CreditCard,
  Phone,
} from 'lucide-react';
import { Sale } from '../../types';
import { useApp, WHATSAPP_SUPPORT_NUMBER } from '../../context/AppContext';

interface TicketModalProps {
  sale: Sale;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ sale, onClose }) => {
  const { sendSaleByWhatsApp, currentBranch } = useApp();
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isQuote = sale.status === 'COTIZACION';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm text-slate-100">
              {isQuote ? 'Cotización Registrada' : '¡Venta Realizada con Éxito!'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Preview */}
        <div className="p-4 overflow-y-auto max-h-[65vh]">
          <div
            ref={ticketRef}
            id="thermal-printable-ticket"
            className="bg-white text-slate-900 p-5 rounded-2xl font-mono text-xs shadow-inner leading-tight border border-slate-200"
          >
            {/* Ticket Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
              <p className="font-extrabold text-sm uppercase tracking-wider">
                TELECOSYS DE MÉXICO
              </p>
              <p className="text-[11px] font-semibold text-slate-700">
                Telecomunicaciones & Sistemas
              </p>
              <p className="text-[10px] text-slate-600 mt-1">{sale.branchName}</p>
              <p className="text-[10px] text-slate-600">{currentBranch.address}</p>
              <p className="text-[10px] text-slate-600">RFC: TEL200815XYZ</p>
              <p className="text-[10px] font-bold text-slate-800 mt-1">
                WhatsApp Soporte: {WHATSAPP_SUPPORT_NUMBER}
              </p>
            </div>

            {/* Folio & Info */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2 text-[11px] space-y-0.5">
              {sale.isVipSale && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 px-2 py-1 rounded text-[10px] font-bold text-center mb-1.5 flex items-center justify-center gap-1">
                  <span>👑 CLIENTE VIP {sale.vipTier || 'PREFERENCIAL'} ({sale.vipDiscountPercent}% DESC APLICADO)</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-bold">{isQuote ? 'COTIZACIÓN:' : 'TICKET:'}</span>
                <span className="font-extrabold">{sale.folio}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{new Date(sale.createdAt).toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENTE:</span>
                <span className="font-semibold max-w-[170px] truncate text-right">
                  {sale.customerName}
                </span>
              </div>
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span>TEL:</span>
                  <span>{sale.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ATIENDE:</span>
                <span>{sale.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span>PAGO:</span>
                <span className="font-bold">{sale.paymentMethod}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="flex justify-between font-bold text-[10px] uppercase mb-1 border-b border-slate-200 pb-0.5">
                <span>CANT / DESCRIPCIÓN</span>
                <span>IMPORTE</span>
              </div>

              <div className="space-y-2">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="text-[11px]">
                    <p className="font-semibold">{item.productName}</p>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>
                        {item.quantity} x ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        {item.discountPercent > 0 && ` (-${item.discountPercent}%)`}
                      </span>
                      <span className="font-bold text-slate-900">
                        ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {item.serials && item.serials.length > 0 && (
                      <p className="text-[9px] text-slate-500 font-sans">
                        S/N: {item.serials.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${sale.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>{sale.isVipSale ? `Descuento VIP (${sale.vipTier || ''} ${sale.vipDiscountPercent || 0}%):` : 'Descuento aplicado:'}</span>
                  <span>-${sale.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
                <span>TOTAL A PAGAR:</span>
                <span>${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Entregado:</span>
                <span>${sale.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Cambio:</span>
                <span>${sale.change.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Notes / Footer */}
            {sale.notes && (
              <div className="text-[10px] text-slate-600 mb-2 italic">
                Nota: {sale.notes}
              </div>
            )}

            <div className="text-center text-[10px] text-slate-600 space-y-1 mt-3">
              <p className="font-semibold">¡Gracias por su compra!</p>
              <p>Garantía de equipos con número de serie válido.</p>
              <p className="font-bold text-slate-900">
                Soporte y Seguimiento WhatsApp: {WHATSAPP_SUPPORT_NUMBER}
              </p>
              <p className="text-[9px] text-slate-400 mt-2">
                Sistema TelecoSys Cloud POS v1.0
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white/5 border-t border-white/10 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-print-ticket"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition shadow-md"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Imprimir Ticket</span>
            </button>

            <button
              id="btn-whatsapp-ticket"
              onClick={() => sendSaleByWhatsApp(sale)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/25"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Cliente</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              id="btn-whatsapp-support-ticket"
              onClick={() => sendSaleByWhatsApp(sale, WHATSAPP_SUPPORT_NUMBER)}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
            >
              <Phone className="w-3 h-3" />
              <span>Enviar a Soporte Técnico ({WHATSAPP_SUPPORT_NUMBER})</span>
            </button>

            <button
              onClick={onClose}
              className="text-[11px] font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
