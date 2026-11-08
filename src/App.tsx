import React, { useState } from 'react';
import { AppProvider, useApp, WHATSAPP_SUPPORT_NUMBER } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/POS/PosView';
import { TicketModal } from './components/POS/TicketModal';
import { InventoryView } from './components/Inventory/InventoryView';
import { MovementsView } from './components/Movements/MovementsView';
import { CustomersView } from './components/Customers/CustomersView';
import { ReportsView } from './components/Reports/ReportsView';
import { SupportView } from './components/Support/SupportView';
import { AuthModal } from './components/Auth/AuthModal';
import { CloudSyncModal } from './components/CloudSync/CloudSyncModal';
import { WhatsAppModal } from './components/Support/WhatsAppModal';
import { MessageCircle, Phone } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeTab, setActiveTab, selectedSaleForTicket, setSelectedSaleForTicket } = useApp();

  // Modals state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Render view depending on active tab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'pos':
        return <PosView />;
      case 'inventory':
        return <InventoryView />;
      case 'movements':
        return <MovementsView />;
      case 'customers':
        return <CustomersView />;
      case 'reports':
        return <ReportsView />;
      case 'support':
        return <SupportView />;
      case 'cloud':
        return <SupportView />;
      default:
        return <PosView />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900/60 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white pb-16 md:pb-0">
      {/* Frosted Glass Mesh Background */}
      <div className="mesh-bg" />

      {/* Top Navbar */}
      <Navbar
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenSyncModal={() => setShowSyncModal(true)}
        onOpenWhatsAppModal={() => setShowWhatsAppModal(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main App Container */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          onOpenWhatsAppModal={() => setShowWhatsAppModal(true)}
          onOpenSyncModal={() => setShowSyncModal(true)}
        />

        {/* Content View */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating WhatsApp Speed Dial button (Desktop and Tablet) */}
      <button
        id="floating-btn-whatsapp"
        onClick={() => setShowWhatsAppModal(true)}
        className="fixed bottom-5 right-5 z-40 hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs shadow-2xl backdrop-blur-xl border border-emerald-400/40 hover:scale-105 active:scale-95 transition group"
        title={`Atención directa WhatsApp: ${WHATSAPP_SUPPORT_NUMBER}`}
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
        </span>
        <MessageCircle className="w-4 h-4 fill-current text-emerald-400" />
        <span>Soporte: {WHATSAPP_SUPPORT_NUMBER}</span>
      </button>

      {/* Global Modals */}
      {selectedSaleForTicket && (
        <TicketModal
          sale={selectedSaleForTicket}
          onClose={() => setSelectedSaleForTicket(null)}
        />
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showSyncModal && <CloudSyncModal onClose={() => setShowSyncModal(false)} />}

      {showWhatsAppModal && <WhatsAppModal onClose={() => setShowWhatsAppModal(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
