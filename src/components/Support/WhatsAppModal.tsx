import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  X,
  ExternalLink,
  ShieldCheck,
  Send,
  Building2,
  Clock,
  Headphones,
} from 'lucide-react';
import { useApp, WHATSAPP_SUPPORT_NUMBER } from '../../context/AppContext';

interface WhatsAppModalProps {
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ onClose }) => {
  const { openWhatsAppSupport, currentBranch, currentUser } = useApp();

  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('Soporte Técnico de Equipos');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const fullText =
      `*ATENCIÓN TÉCNICA TELECOSYS*\n` +
      `📞 Número oficial: ${WHATSAPP_SUPPORT_NUMBER}\n` +
      `🏢 *Sucursal:* ${currentBranch.name}\n` +
      `👤 *Solicita:* ${currentUser.name}\n` +
      `📌 *Tema:* ${topic}\n` +
      `--------------------------------\n` +
      `${message || 'Hola, requiero soporte técnico para configuración y pedidos de equipos de telecomunicaciones.'}\n` +
      `--------------------------------\n` +
      `¡Gracias!`;

    openWhatsAppSupport(fullText);
    onClose();
  };

  const quickTemplates = [
    'Tengo dudas con la configuración de un router MikroTik.',
    'Necesito verificar el estado y envío de un pedido.',
    'Requiero cotización de bobina de fibra óptica por mayoreo.',
    'Solicito revisión de garantía para un radio enlace Ubiquiti.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto animate-in fade-in text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-emerald-500/10 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageCircle className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">WhatsApp Soporte Directo</h2>
              <p className="text-[11px] text-emerald-400 font-mono font-semibold">
                Línea Directa: {WHATSAPP_SUPPORT_NUMBER}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Info */}
        <form onSubmit={handleSend} className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md">
            <Headphones className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-slate-300 leading-snug">
              Atención directa para soporte técnico de equipos (Mikrotik, Ubiquiti, Fibra Óptica)
              y seguimiento de tus pedidos en Tuxtla Gutiérrez y sucursales.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Motivo de la Consulta</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-emerald-400 backdrop-blur-md"
            >
              <option value="Soporte Técnico de Equipos">Soporte Técnico de Equipos</option>
              <option value="Seguimiento de Pedido / Envío">Seguimiento de Pedido / Envío</option>
              <option value="Cotización de Mayoreo para WISP">Cotización de Mayoreo para WISP</option>
              <option value="Garantías y Devoluciones">Garantías y Devoluciones</option>
              <option value="Facturación y Pagos">Facturación y Pagos</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Mensaje o Detalles del Equipo
            </label>
            <textarea
              rows={3}
              placeholder="Escribe tu consulta o selecciona una de las plantillas rápidas..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 backdrop-blur-md"
            />
          </div>

          {/* Quick templates */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 block font-semibold">
              Mensajes sugeridos:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(t)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-300 text-[10px] text-left border border-white/10 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Direct WhatsApp button */}
          <button
            type="submit"
            id="btn-send-whatsapp-modal"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Abrir Chat con Soporte ({WHATSAPP_SUPPORT_NUMBER})</span>
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>Horario de atención: 8:00 AM a 7:00 PM</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
