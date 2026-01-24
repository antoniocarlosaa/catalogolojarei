import VehicleDetailModal from './components/VehicleDetailModal'; // Global Modal
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import StockCarousel from './components/StockCarousel';
import StockGrid from './components/StockGrid';
import SearchBar from './components/SearchBar';

import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, CategoryFilter, VehicleType, AppSettings } from './types';
import VehicleCard from './components/VehicleCard';
import HeroCard from './components/HeroCard';
import ViewMoreCard from './components/ViewMoreCard';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { db } from './services/VehicleService';
import { useAuth } from './contexts/AuthContext';
import { logger } from './services/LogService';

const App: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null); // State Global do Modal
  const [settings, setSettings] = useState<AppSettings>({ whatsappNumbers: [], googleMapsUrl: '' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>('TUDO');
  const [search, setSearch] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Registrar Visita (apenas uma vez na montagem)
  useEffect(() => {
    logger.logVisit();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vData, sData] = await Promise.all([
          db.getAllVehicles(),
          db.getSettings()
        ]);
        setVehicles(vData);
        setSettings(sData);
      } catch (err) {
        console.error("Erro ao conectar ao banco:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Detectar scroll para mostrar botão "Voltar ao Topo"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'TUDO'
        || (filter === 'MOTOS' && v.type === VehicleType.MOTO)
        || (filter === 'CARROS' && v.type === VehicleType.CARRO)
        || (filter === 'PROMOÇÕES' && (v.isPromoSemana || v.isPromoMes));
      return matchesSearch && matchesFilter;
    });
  }, [vehicles, filter, search]);

  const destaques = useMemo(() => filteredVehicles.filter(v => v.isFeatured && !v.isSold), [filteredVehicles]);
  const promoSemana = useMemo(() => filteredVehicles.filter(v => v.isPromoSemana && !v.isSold && !v.isFeatured), [filteredVehicles]);
  // CORREÇÃO: Veículos continuam no estoque mesmo se forem destaque ou promo
  const motosEstoque = useMemo(() => filteredVehicles.filter(v => v.type === VehicleType.MOTO && !v.isSold), [filteredVehicles]);
  const carrosEstoque = useMemo(() => filteredVehicles.filter(v => v.type === VehicleType.CARRO && !v.isSold), [filteredVehicles]);

  const handleInterest = (vehicle: Vehicle) => {
    const validNumbers = settings.whatsappNumbers
      .map(n => n.replace(/\D/g, '').replace(/^0+/, ''))
      .filter(n => n.length >= 8); // Relaxado para 8 dígitos para evitar bloqueio

    if (validNumbers.length === 0) {
      alert(`Erro: Nenhum número válido.\nConfigurado: ${JSON.stringify(settings.whatsappNumbers)}`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * validNumbers.length);
    const rawNumber = validNumbers[randomIndex];

    // Se tiver 11 ou menos, adiciona 55.
    const finalNumber = rawNumber.length <= 11 ? `55${rawNumber}` : rawNumber;

    const message = encodeURIComponent(`Olá! Vi no catálogo o veículo: ${vehicle.name}. Ainda está disponível?`);

    // Usar api.whatsapp.com é mais robusto que wa.me para desktop
    window.open(`https://api.whatsapp.com/send?phone=${finalNumber}&text=${message}`, '_blank');
  };



  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const onUpload = async (nv: Vehicle) => {
    // Atualização imediata para feedback visual
    setVehicles(prev => [nv, ...prev]);

    // Persistir dados
    await db.saveVehicle(nv);

    // Sincronizar (o service agora garante merge de dados locais)
    const updatedVehicles = await db.getAllVehicles();
    setVehicles(updatedVehicles);
  };

  const onUpdate = async (id: string, up: Partial<Vehicle>) => {
    await db.updateVehicle(id, up);
    const updatedVehicles = await db.getAllVehicles();
    setVehicles(updatedVehicles);
  };

  const onDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este veículo?")) {
      const v = vehicles.find(x => x.id === id);
      await db.deleteVehicle(id);
      setVehicles(prev => prev.filter(x => x.id !== id));

      if (user?.email && v) {
        logger.logAction(user.email, 'EXCLUIR', v.name, 'Veículo excluído permanentemente');
      }
    }
  };

  const handleAdminClick = () => {
    console.log('🔍 Verificando autenticação...', { user: user ? 'Autenticado' : 'Não autenticado' });
    if (user) {
      console.log('✅ Usuário autenticado, abrindo painel ADM');
      setIsAdminOpen(true);
    } else {
      console.log('🔐 Usuário não autenticado, mostrando modal de login');
      setShowLoginModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans relative">
      <Header
        filter={filter}
        setFilter={setFilter}
        onAdminClick={handleAdminClick}
      />

      <main className="flex-1 w-full pb-24">
        {/* HERO SECTION WITH SEARCH */}
        <HeroSearch
          backgroundImageUrl={settings.backgroundImageUrl}
          backgroundPosition={settings.backgroundPosition}
        />
        <SearchBar search={search} setSearch={setSearch} />

        <div className="max-w-[1400px] mx-auto space-y-4">

          {/* DESTAQUES CAROUSEL */}
          {(destaques.length > 0) && (filter === 'TUDO') && (
            <StockCarousel
              title="Destaques"
              vehicles={destaques}
              onInterest={handleInterest}
              onViewDetails={handleViewDetails}
              imageFit={settings.cardImageFit}
            />
          )}

          {/* PROMOÇÕES CAROUSEL */}
          {(promoSemana.length > 0) && (filter === 'TUDO' || filter === 'PROMOÇÕES') && (
            <StockCarousel
              title="🔥 Promoções da Semana"
              vehicles={promoSemana}
              onInterest={handleInterest}
              onViewDetails={handleViewDetails}
              imageFit={settings.cardImageFit}
            />
          )}

          {/* SEPARATOR */}
          {(motosEstoque.length > 0) && (
            <div className="w-full h-px bg-white/10 my-8 shadow-[0_0_15px_rgba(255,215,0,0.3)]"></div>
          )}

          {/* ÚLTIMOS LANÇAMENTOS (Carousel Mixed) */}
          {(filteredVehicles.length > 0) && (filter === 'TUDO' || filter === 'MOTOS' || filter === 'CARROS') && (
            <StockCarousel
              title="Últimos Lançamentos"
              vehicles={filteredVehicles.filter(v => !v.isSold).slice(0, 10)}
              onInterest={handleInterest}
              onViewDetails={handleViewDetails}
              imageFit={settings.cardImageFit}
            />
          )}

          {/* SEPARATOR */}
          {(motosEstoque.length > 0) && (
            <div className="w-full h-px bg-white/10 my-8 shadow-[0_0_15px_rgba(255,215,0,0.3)]"></div>
          )}

          {/* ESTOQUE DE MOTOS (Grid) */}
          {(motosEstoque.length > 0) && (filter === 'TUDO' || filter === 'MOTOS') && (
            <StockGrid
              title="Estoque de Motos"
              vehicles={motosEstoque}
              onInterest={handleInterest}
              onViewDetails={handleViewDetails}
              imageFit={settings.cardImageFit}
            />
          )}

          {/* SEPARATOR */}
          {(motosEstoque.length > 0) && (carrosEstoque.length > 0) && (
            <div className="w-full h-px bg-white/10 my-8 shadow-[0_0_15px_rgba(255,215,0,0.3)]"></div>
          )}

          {/* CARROS GRID */}
          {(carrosEstoque.length > 0) && (filter === 'TUDO' || filter === 'CARROS') && (
            <StockGrid
              title="Carros em Estoque"
              vehicles={carrosEstoque.slice(0, 12)}
              onInterest={handleInterest}
              onViewDetails={handleViewDetails}
              imageFit={settings.cardImageFit}
            />
          )}

        </div>
      </main>

      {/* MODALS */}
      {isAdminOpen && (
        <AdminPanel
          currentNumbers={settings.whatsappNumbers}
          currentMapsUrl={settings.googleMapsUrl}
          currentBackgroundImageUrl={settings.backgroundImageUrl}
          currentBackgroundPosition={settings.backgroundPosition}
          currentCardImageFit={settings.cardImageFit}
          vehicles={vehicles}
          onSaveNumbers={n => { const ns = { ...settings, whatsappNumbers: n }; setSettings(ns); db.saveSettings(ns); }}
          onSaveMapsUrl={u => { const ns = { ...settings, googleMapsUrl: u }; setSettings(ns); db.saveSettings(ns); }}
          onSaveBackgroundImageUrl={u => { const ns = { ...settings, backgroundImageUrl: u }; setSettings(ns); db.saveSettings(ns); }}
          onSaveBackgroundPosition={pos => { const ns = { ...settings, backgroundPosition: pos }; setSettings(ns); db.saveSettings(ns); }}
          onSaveCardImageFit={fit => { const ns = { ...settings, cardImageFit: fit }; setSettings(ns); db.saveSettings(ns); }}
          onUpdateVehicle={onUpdate}
          onDeleteVehicle={onDelete}
          onUpload={onUpload}
          onClose={() => setIsAdminOpen(false)}
        />
      )
      }

      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onInterest={handleInterest}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            setIsAdminOpen(true);
          }}
        />
      )
      }

      {/* Button Scroll Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[60] w-12 h-12 bg-gold text-black rounded-full shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
          aria-label="Voltar ao topo"
        >
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      )
      }
    </div>
  );
};

export default App;
