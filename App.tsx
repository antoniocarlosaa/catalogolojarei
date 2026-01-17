import FeaturedCarousel from './components/FeaturedCarousel'; // Importação adicionada

import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, CategoryFilter, VehicleType, AppSettings } from './types';
import VehicleCard from './components/VehicleCard';
import HeroCard from './components/HeroCard';
import ViewMoreCard from './components/ViewMoreCard';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { db } from './services/VehicleService';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ whatsappNumbers: [], googleMapsUrl: '' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>('TUDO');
  const [search, setSearch] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
  const motosEstoque = useMemo(() => filteredVehicles.filter(v => v.type === VehicleType.MOTO && !v.isSold && !v.isPromoSemana && !v.isFeatured), [filteredVehicles]);
  const carrosEstoque = useMemo(() => filteredVehicles.filter(v => v.type === VehicleType.CARRO && !v.isSold && !v.isPromoSemana && !v.isFeatured), [filteredVehicles]);

  const handleInterest = (vehicle: Vehicle) => {
    if (settings.whatsappNumbers.length === 0) {
      alert("Configuração de atendimento pendente no Painel ADM.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * settings.whatsappNumbers.length);
    const selectedNumber = settings.whatsappNumbers[randomIndex];
    const message = encodeURIComponent(`Olá! Vi no catálogo o veículo: ${vehicle.name}. Ainda está disponível?`);
    window.open(`https://wa.me/55${selectedNumber}?text=${message}`, '_blank');
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
      await db.deleteVehicle(id);
      setVehicles(prev => prev.filter(x => x.id !== id));
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
      {/* Background Image com Efeito Fumaça */}
      {/* Background Image com Efeito Fumaça */}
      <header className="sticky top-0 z-[60] border-b border-white/5 relative overflow-hidden bg-background">
        {/* Background Image no Header */}
        {settings.backgroundImageUrl && (
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${settings.backgroundImageUrl})`,
                backgroundPosition: settings.backgroundPosition || '50% 50%'
              }}
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        )}

        <div className="relative z-10">
          <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-6 relative">
            <button
              onClick={handleAdminClick}
              className="absolute right-6 top-6 z-50 w-8 h-8 flex items-center justify-center text-white/50 hover:text-gold transition-all bg-black/20 backdrop-blur-md rounded-full border border-white/5"
            >
              <span className="material-symbols-outlined text-sm">more_vert</span>
            </button>

            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar justify-center">
              {['TUDO', 'MOTOS', 'CARROS', 'PROMOÇÕES'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat as CategoryFilter)}
                  className={`px-6 py-2 rounded-full border text-[8px] font-bold uppercase tracking-widest transition-all ${filter === cat ? 'bg-gold text-black border-gold shadow-lg shadow-gold/20' : 'bg-black/50 backdrop-blur-md text-white border-white/20 hover:bg-black/70'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-32 max-w-[1400px] mx-auto w-full px-6">

        {/* LAYOUT PRINCIPAL - DESTAQUES + PROMOÇÕES LATERAL */}
        {(destaques.length > 0 || promoSemana.length > 0) && (filter === 'TUDO') && (
          <section className="mt-12">
            <div className={`grid grid-cols-1 gap-6 ${promoSemana.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
              {/* COLUNA ESQUERDA - DESTAQUES (2/3) */}
              {destaques.length > 0 && (
                <div className={`space-y-6 ${promoSemana.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  <h3 className="text-[10px] text-gold font-bold uppercase tracking-[0.4em] border-l-2 border-gold pl-3">Destaques</h3>
                  {destaques.length === 1 ? (
                    <HeroCard vehicle={destaques[0]} onInterest={handleInterest} />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {destaques.map(v => <VehicleCard key={v.id} vehicle={v} onInterest={handleInterest} variant="featured" />)}
                    </div>
                  )}
                </div>
              )}

              {/* COLUNA DIREITA - PROMOÇÕES (1/3) */}
              {promoSemana.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[10px] text-red-500 font-bold uppercase tracking-[0.4em] border-l-2 border-red-500 pl-3">🔥 Promoções</h3>
                  <div className="space-y-6">
                    {promoSemana.slice(0, 3).map(v => <VehicleCard key={v.id} vehicle={v} onInterest={handleInterest} variant="promo" />)}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PROMOÇÕES DA SEMANA - SEÇÃO COMPLETA (quando não há destaques ou quando filtrado) */}
        {promoSemana.length > 0 && (filter === 'PROMOÇÕES' || (filter === 'TUDO' && destaques.length === 0)) && (
          <section className="mt-16">
            <h3 className="text-[10px] text-red-500 font-bold uppercase tracking-[0.4em] mb-6 border-l-2 border-red-500 pl-3">🔥 Promoções da Semana</h3>
          </section>
        )}

        {/* CARROSSEL DESTAQUE NA LINHA DOURADA */}
        <FeaturedCarousel vehicles={vehicles} onInterest={handleInterest} />

        {/* MOTOS - GRID EXPANDIDO 6 COLUNAS */}
        {motosEstoque.length > 0 && (filter === 'TUDO' || filter === 'MOTOS') && (
          <section className="mt-16">
            <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] mb-6 border-l-2 border-white/10 pl-3">Estoque Motos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filter === 'TUDO' ? (
                <>
                  {motosEstoque.slice(0, 6).map(v => <VehicleCard key={v.id} vehicle={v} onInterest={handleInterest} imageFit={settings.cardImageFit} />)}
                  {motosEstoque.length > 6 && (
                    <ViewMoreCard
                      type="MOTOS"
                      count={motosEstoque.length - 6}
                      onClick={() => setFilter('MOTOS')}
                    />
                  )}
                </>
              ) : (
                motosEstoque.map(v => <VehicleCard key={v.id} vehicle={v} onInterest={handleInterest} imageFit={settings.cardImageFit} />)
              )}
            </div>
          </section>
        )}

        {/* CARROS - GRID EXPANDIDO 6 COLUNAS */}
        {carrosEstoque.length > 0 && (filter === 'TUDO' || filter === 'CARROS') && (
          <section className="mt-16">
            <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] mb-6 border-l-2 border-white/10 pl-3">Estoque Carros</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filter === 'TUDO' ? (
                <>
                  {carrosEstoque.slice(0, 6).map(v => <VehicleCard key={v.id} vehicle={v} onInterest={handleInterest} imageFit={settings.cardImageFit} />)}
                  {carrosEstoque.length > 6 && (
                    <ViewMoreCard
                      type="CARROS"
                      count={carrosEstoque.length - 6}
                      onClick={() => setFilter('CARROS')}
                    />
                  )}
                </>
              ) : (
                carrosEstoque.map(v => <VehicleCard key={v.id} vehicle={v} onInterest={handleInterest} imageFit={settings.cardImageFit} />)
              )}
            </div>
          </section>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/5 px-8 py-4 z-[70] rounded-full shadow-2xl flex items-center gap-10">
        <button onClick={() => setFilter('TUDO')} className={`${filter === 'TUDO' ? 'text-gold' : 'text-white'} transition-all`}><span className="material-symbols-outlined text-2xl">home</span></button>
        <button onClick={() => setFilter('MOTOS')} className={`${filter === 'MOTOS' ? 'text-gold' : 'text-white'} transition-all`}><span className="material-symbols-outlined text-2xl">motorcycle</span></button>
        <button onClick={() => setFilter('CARROS')} className={`${filter === 'CARROS' ? 'text-gold' : 'text-white'} transition-all`}><span className="material-symbols-outlined text-2xl">directions_car</span></button>
        <button onClick={() => setFilter('PROMOÇÕES')} className={`${filter === 'PROMOÇÕES' ? 'text-red-500' : 'text-white'} transition-all`}><span className="material-symbols-outlined text-2xl">local_fire_department</span></button>
      </nav>

      {
        isAdminOpen && (
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

      {
        showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSuccess={() => {
              setShowLoginModal(false);
              setIsAdminOpen(true);
            }}
          />
        )
      }

      {/* Botão Voltar ao Topo */}
      {
        showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-[60] w-12 h-12 bg-gold text-black rounded-full shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Voltar ao topo"
          >
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
        )
      }
    </div >
  );
};

export default App;
