import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Building2,
  X,
  CheckCircle2,
  Download,
  Upload,
  Server,
  Shield,
  Wifi,
  Database,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CloudSyncModalProps {
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ onClose }) => {
  const {
    cloudSync,
    syncNow,
    branches,
    currentBranch,
    exportDataBackup,
    importDataBackup,
    products,
    sales,
    movements,
  } = useApp();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataBackup(content);
        if (success) {
          setImportStatus('¡Datos restaurados con éxito desde la copia de seguridad!');
        } else {
          setImportStatus('Error: El archivo JSON no tiene un formato válido.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto animate-in fade-in text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-bold text-sm text-white">
                Sincronización en la Nube Multi-Sucursales
              </h2>
              <p className="text-[11px] text-slate-400">
                Clúster centralizado en tiempo real para Chiapas y sucursales
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

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Cloud Status Card */}
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-sm text-white">Estado: Conectado a la Nube</span>
              </div>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-500/30">
                Latencia: 24 ms
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500 block">Servidor Primario:</span>
                <span className="font-mono text-slate-200">Google Cloud (us-east1)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Última Sincronización:</span>
                <span className="font-mono text-slate-200">{cloudSync.lastSyncTime}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cambios Pendientes:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {cloudSync.pendingChanges === 0 ? 'Al día (0)' : `${cloudSync.pendingChanges} por subir`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Cifrado de Datos:</span>
                <span className="font-mono text-slate-200">TLS 1.3 / AES-256</span>
              </div>
            </div>

            <button
              id="btn-sync-modal-now"
              disabled={cloudSync.isSyncing}
              onClick={syncNow}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition"
            >
              <RefreshCw className={`w-4 h-4 ${cloudSync.isSyncing ? 'animate-spin' : ''}`} />
              <span>{cloudSync.isSyncing ? 'Sincronizando con clúster...' : 'Forzar Sincronización Ahora'}</span>
            </button>
          </div>

          {/* Branches Connected */}
          <div className="space-y-2">
            <span className="font-bold text-slate-200 block text-xs">
              Sucursales Vinculadas al Sistema:
            </span>

            <div className="space-y-1.5">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border flex items-center justify-between backdrop-blur-md transition ${
                    b.id === currentBranch.id
                      ? 'bg-sky-500/15 border-sky-400/50'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2
                      className={`w-4 h-4 ${
                        b.id === currentBranch.id ? 'text-sky-400' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <p className="font-bold text-slate-200">{b.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {b.city} • Tel: {b.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>En Línea</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offline-first resilience message */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-sky-400" />
              <span>Resiliencia Offline / Modo Sin Conexión</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Si tu conexión a Internet falla temporalmente en mostrador, el Punto de Venta continúa
              operando y guardando tickets localmente. Tan pronto regrese la red, se sincronizará
              automáticamente con el inventario de las demás sucursales.
            </p>
          </div>

          {/* Backup & Export/Import */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
            <span className="font-bold text-slate-200 block text-xs">
              Respaldo Manual y Portabilidad de Base de Datos
            </span>
            <p className="text-[11px] text-slate-400">
              Descarga una copia completa de tus productos, clientes, existencias y ventas en formato JSON:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={exportDataBackup}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Backup</span>
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition text-center shadow-sm">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Restaurar Archivo</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-[11px] font-bold text-sky-300 mt-1">{importStatus}</p>
            )}
          </div>
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
