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
import PromoPopup from './components/PromoPopup';
import NewsletterModal from './components/NewsletterModal';
import { db } from './services/VehicleService';
import { useAuth } from './contexts/AuthContext';
import { logger } from './services/LogService';

const App: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null); // State Global do Modal
  const [settings, setSettings] = useState<AppSettings>({ whatsappNumbers: [], googleMapsUrl: '' });
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState(0);
  const [filter, setFilter] = useState<CategoryFilter>('TUDO');
  const [search, setSearch] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Promo State
  const [isPromoDismissed, setIsPromoDismissed] = useState(false);

  // WhatsApp Selector State
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappTarget, setWhatsappTarget] = useState<Vehicle | null>(null);
  const [whatsappAction, setWhatsappAction] = useState<'buy'|'finance'|'general'>('buy');

  // Registrar Visita (apenas uma vez na montagem)
  useEffect(() => {
    logger.logVisit();
  }, []);

  // Deep Linking: Check for ?v=ID param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get('v');
    if (vehicleId && vehicles.length > 0 && !selectedVehicle) {
      const found = vehicles.find(v => v.id === vehicleId);
      if (found) setSelectedVehicle(found);
    }
  }, [vehicles]);

  useEffect(() => {
    console.log("🚀 VERSION: SOLD_FEATURES_UPDATE_V3 (Final)"); // Marcador de versão para debug
    const loadData = async () => {
      try {
        // 1. Carregamento Instantâneo (Cache Local) - Otimização de Performance
        const localVehicles = db.getLocalVehicles();
        const localSettings = db.getLocalSettings();

        if (localVehicles.length > 0) {
          console.log("⚡ Usando cache local para renderização instantânea");
          setVehicles(localVehicles);
          setSettings(localSettings);
          setLoading(false); // Remove spinner imediatamente se houver dados
        }

        // 2. Busca dados atualizados no servidor (Background)
        // Limpeza de veículos antigos ao iniciar
        await db.cleanupOldSoldVehicles();

        const [vData, sData, vCount] = await Promise.all([
          db.getAllVehicles(),
          db.getSettings(),
          logger.getVisitCount()
        ]);

        // 3. Atualiza com a verdade do servidor
        setVehicles(vData);
        setSettings(sData);
        setVisitCount(vCount);
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

  // Filtros Avançados
  const destaques = useMemo(() => filteredVehicles.filter(v => v.isFeatured && !v.isSold), [filteredVehicles]);
  const promoSemana = useMemo(() => filteredVehicles.filter(v => v.isPromoSemana && !v.isSold && !v.isFeatured), [filteredVehicles]);

  // Estoque Ativo (não vendidos)
  const motosEstoque = useMemo(() => filteredVehicles.filter(v => v.type === VehicleType.MOTO && !v.isSold), [filteredVehicles]);
  const carrosEstoque = useMemo(() => filteredVehicles.filter(v => v.type === VehicleType.CARRO && !v.isSold), [filteredVehicles]);

  // Veículos Vendidos (recente) - Ordenar pela data da venda (soldAt) se existir, ou fallback para created_at
  const motosVendidas = useMemo(() => {
    return vehicles
      .filter(v => v.isSold)
      .sort((a, b) => {
        // Se ambos tiverem soldAt, ordena pelo mais recente
        if (a.soldAt && b.soldAt) return new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime();
        // Se um tem soldAt e outro não, o que tem vem primeiro
        if (a.soldAt) return -1;
        if (b.soldAt) return 1;
        // Se nenhum tem (fallback antigo), mantém ordem original (created_at desc)
        return 0;
      })
      .slice(0, 10);
  }, [vehicles]);

  // Ultimos Lançamentos (INCLUI VENDIDOS com badge)
  // O user pediu para aparecer no carrossel de ultimos lançamentos
  const ultimosLancamentos = useMemo(() => {
    // Pegar todos que passarem no filtro e ordenar por data mais recente de atividade (criação OU venda)
    // Isso faz com que veículos recém-vendidos subam para o topo também
    return [...filteredVehicles]
      .sort((a, b) => {
        const dateA = a.soldAt ? new Date(a.soldAt).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
        const dateB = b.soldAt ? new Date(b.soldAt).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [filteredVehicles]);


  const handleInterest = (vehicle: Vehicle, action: 'buy'|'finance'|'general' = 'buy') => {
    // Verificar se existem números ativos antes de abrir modal
    const activeExists = settings.whatsappNumbers.some(n => !n.startsWith('OFF:') && n.length > 5);

    if (!activeExists) {
      alert("Nenhum atendente disponível no momento. Tente mais tarde.");
      return;
    }

    setWhatsappTarget(vehicle);
    setWhatsappAction(action);
    setShowWhatsappModal(true);
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
        onNewsletterClick={() => setShowNewsletter(true)}
      />

      <main className="flex-1 w-full pb-24">
        {/* HERO SECTION WITH SEARCH */}
        <HeroSearch
          backgroundImageUrl={settings.backgroundImageUrl}
          backgroundPosition={settings.backgroundPosition}
        />
        <SearchBar search={search} setSearch={setSearch} />

        {/* URGENCY BANNER */}
        <div className="w-full bg-redAlert text-white py-2 px-4 text-center">
            <p className="text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base animate-pulse">campaign</span>
                Estoque atualizado diariamente. Veículos podem ser vendidos a qualquer momento!
            </p>
        </div>

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
            <div className="w-full h-px bg-white/10 my-8 shadow-[0_0_15px_rgba(234,179,8,0.3)]"></div>
          )}

          {/* SESSÃO DE RETORNO (MEIO) */}
          <div className="w-full bg-surface-light border border-white/5 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 my-8">
              <div>
                  <h3 className="text-2xl font-heading text-white uppercase tracking-wider mb-2">Não encontrou sua moto ideal?</h3>
                  <p className="text-white/70">Te ajudamos a encontrar a moto certa para a sua necessidade.</p>
              </div>
              <button 
                  onClick={() => {
                      setWhatsappTarget(vehicles[0]); // fallback
                      setWhatsappAction('general');
                      setShowWhatsappModal(true);
                  }}
                  className="px-8 py-4 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105"
              >
                  Falar Agora
              </button>
          </div>

          {/* ÚLTIMOS LANÇAMENTOS (Carousel Mixed - AGORA INCLUI VENDIDOS) */}
          {(ultimosLancamentos.length > 0) && (filter === 'TUDO' || filter === 'MOTOS' || filter === 'CARROS') && (
            <StockCarousel
              title="Últimos Lançamentos"
              vehicles={ultimosLancamentos}
              onInterest={handleInterest}
              onViewDetails={handleViewDetails}
              imageFit={settings.cardImageFit}
            />
          )}

          {/* SEPARATOR */}
          {(motosEstoque.length > 0) && (
            <div className="w-full h-px bg-white/10 my-8 shadow-[0_0_15px_rgba(234,179,8,0.3)]"></div>
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

          {/* ESTOQUE DE CARROS (Grid) */}
          {(carrosEstoque.length > 0) && (filter === 'TUDO' || filter === 'CARROS') && (
            <>
              <div className="w-full h-px bg-white/10 my-8 shadow-[0_0_15px_rgba(234,179,8,0.3)]"></div>
              <StockGrid
                title="Estoque de Carros"
                vehicles={carrosEstoque}
                onInterest={handleInterest}
                onViewDetails={handleViewDetails}
                imageFit={settings.cardImageFit}
              />
            </>
          )}

          {/* SEÇÃO DE VENDIDOS (NOVA) - AGORA VISÍVEL EM TODAS AS ABAS E ORDENADA POR DATA DA VENDA */}
          {(motosVendidas.length > 0) && (
            <>
              <div className="w-full h-px bg-white/10 my-12 shadow-[0_0_30px_rgba(234,179,8,0.3)]"></div>
              <StockCarousel
                title="Veículos Vendidos"
                vehicles={motosVendidas}
                onInterest={handleInterest}
                onViewDetails={handleViewDetails}
                imageFit={settings.cardImageFit}
                variant="default"
              />
            </>
          )}

          {/* PROVA SOCIAL */}
          <div className="w-full bg-surface-light border border-white/5 p-8 rounded-2xl flex flex-col items-center justify-center my-12">
              <h3 className="text-3xl font-heading text-white uppercase tracking-wider mb-8 text-center">Clientes que <span className="text-gold">realizaram sonhos</span></h3>
              <div className="flex flex-wrap justify-center gap-8 mb-8 text-center">
                  <div>
                      <p className="text-5xl font-black text-gold mb-2">+1000</p>
                      <p className="text-white/60 font-bold uppercase tracking-widest text-sm">Clientes Atendidos</p>
                  </div>
                  <div>
                      <p className="text-5xl font-black text-gold mb-2">+500</p>
                      <p className="text-white/60 font-bold uppercase tracking-widest text-sm">Motos Vendidas</p>
                  </div>
              </div>
          </div>

          {/* SESSÃO DE RETORNO (FINAL) */}
          <div className="w-full bg-gold/10 border border-gold/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center my-8">
              <h3 className="text-2xl font-heading text-gold uppercase tracking-wider mb-2">Não encontrou o que procurava?</h3>
              <p className="text-white/80 mb-6">Fale com um de nossos vendedores. Podemos ter a sua moto chegando no estoque hoje!</p>
              <button 
                  onClick={() => {
                      setWhatsappTarget(vehicles[0]); // fallback
                      setWhatsappAction('general');
                      setShowWhatsappModal(true);
                  }}
                  className="px-10 py-4 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105"
              >
                  Falar com Vendedor
              </button>
          </div>

        </div>

        {/* PROMO POPUP - Renderizado aqui para garantir visibilidade */}
        {!isPromoDismissed && settings.promoActive && (
          <PromoPopup
            imageUrl={settings.promoImageUrl || ''}
            link={settings.promoLink}
            text={settings.promoText}
            onClose={() => setIsPromoDismissed(true)}
          />
        )}
      </main>

      {/* Footer Profissional */}
      <footer className="w-full py-12 text-center border-t border-white/10 bg-black mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center md:items-start text-left">
                <h1 className="text-2xl font-bold italic tracking-tighter text-white mb-4"><span className="text-gold">Rei das Motos</span></h1>
                <p className="text-white/60 text-sm mb-4">A maior loja de motos populares e premium. Facilitamos a sua entrada e a sua vida.</p>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 cursor-default w-fit" title="Total de Visitas">
                    <span className="material-symbols-outlined text-xs text-gold">visibility</span>
                    <span className="text-xs text-white/80">{visitCount.toLocaleString('pt-BR')} Visitas</span>
                </div>
            </div>
            <div className="flex flex-col items-center md:items-start text-left">
                <h4 className="text-gold font-bold uppercase tracking-widest mb-4">Contato</h4>
                <div className="flex items-center gap-2 text-white/70 mb-2">
                    <span className="material-symbols-outlined">phone_iphone</span>
                    <span>WhatsApp Comercial</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                    <span className="material-symbols-outlined">photo_camera</span>
                    <span>@reidasmotos</span>
                </div>
            </div>
            <div className="flex flex-col items-center md:items-start text-left">
                <h4 className="text-gold font-bold uppercase tracking-widest mb-4">Localização</h4>
                <div className="flex items-start gap-2 text-white/70">
                    <span className="material-symbols-outlined">location_on</span>
                    <span>Rua Principal, 123<br/>Centro, Sua Cidade - UF</span>
                </div>
            </div>
            <div className="flex flex-col items-center md:items-start text-left">
                <h4 className="text-gold font-bold uppercase tracking-widest mb-4">Horário</h4>
                <div className="flex items-start gap-2 text-white/70">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>Seg a Sex: 08:00 às 18:00<br/>Sáb: 08:00 às 12:00</span>
                </div>
            </div>
        </div>
      </footer>

      {/* MODALS */}
      {isAdminOpen && (
        <AdminPanel
          currentNumbers={settings.whatsappNumbers}
          currentMapsUrl={settings.googleMapsUrl}
          currentBackgroundImageUrl={settings.backgroundImageUrl}
          currentBackgroundPosition={settings.backgroundPosition}
          currentCardImageFit={settings.cardImageFit}
          currentPromoActive={settings.promoActive}
          currentPromoImageUrl={settings.promoImageUrl}
          currentPromoLink={settings.promoLink}
          currentPromoText={settings.promoText}
          vehicles={vehicles}
          onSaveSettings={async (newSettings) => {
            setSettings(newSettings);
            try {
              await db.saveSettings(newSettings);
            } catch (e) {
              console.error("Erro no App ao salvar:", e);
              throw e;
            }
          }}
          onSaveNumbers={() => { }}
          onSaveMapsUrl={() => { }}
          onSaveBackgroundImageUrl={() => { }}
          onSaveBackgroundPosition={() => { }}
          onSaveCardImageFit={() => { }}
          onSavePromoActive={() => { }}
          onSavePromoImage={() => { }}
          onSavePromoLink={() => { }}
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

      {showNewsletter && (
        <NewsletterModal onClose={() => setShowNewsletter(false)} />
      )}

      {/* Button Scroll Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-[60] w-12 h-12 bg-white/10 text-white rounded-full shadow-2xl hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center border border-white/20"
          aria-label="Voltar ao topo"
        >
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      )}

      {/* FIXED GLOBAL WHATSAPP BUTTON */}
      <button
        onClick={() => {
            setWhatsappTarget(vehicles[0]); // fallback if no specific vehicle
            setWhatsappAction('general');
            setShowWhatsappModal(true);
        }}
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all group"
      >
        <span className="material-symbols-outlined text-2xl group-hover:animate-bounce">chat</span>
        <span className="font-bold uppercase tracking-wider text-sm hidden md:block">Falar Agora</span>
      </button>

      {/* WHATSAPP SELECTOR MODAL */}
      {showWhatsappModal && whatsappTarget && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowWhatsappModal(false)}>
          <div className="w-full max-w-sm bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-heading text-white uppercase tracking-wider">Escolha um Atendente</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Equipe Rei das Motos</p>
              </div>
              <button onClick={() => setShowWhatsappModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {settings.whatsappNumbers.map((num, idx) => {
                if (num.startsWith('OFF:') || num.length < 8) return null;

                const cleanNum = num.replace(/\D/g, '').replace(/^0+/, '');
                // Confiança total no painel (já é Intl format)
                const finalNum = cleanNum;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const link = `${window.location.origin}${whatsappTarget?.id ? `?v=${whatsappTarget.id}` : ''}`;
                      let message = '';
                      if (whatsappAction === 'buy') {
                          message = encodeURIComponent(
                            `Olá! Tenho interesse nessa moto: *${whatsappTarget?.name || 'Veículo'}*\n\n` +
                            `🔗 Link: ${link}`
                          );
                      } else if (whatsappAction === 'finance') {
                          message = encodeURIComponent(
                              `Olá! Quero simular parcela dessa moto: *${whatsappTarget?.name || 'Veículo'}*\n\n` +
                              `🔗 Link: ${link}`
                          );
                      } else {
                          message = encodeURIComponent(
                              `Olá! Vim pelo catálogo e gostaria de tirar algumas dúvidas.\n\n` +
                              `🔗 Link: ${link}`
                          );
                      }
                      window.open(`https://api.whatsapp.com/send?phone=${finalNum}&text=${message}`, '_blank');
                      setShowWhatsappModal(false);
                    }}
                    className="w-full p-4 bg-white/5 hover:bg-[#25D366] hover:text-white border border-white/5 hover:border-[#25D366] rounded-2xl flex items-center gap-4 group transition-all active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/20 group-hover:bg-white/20 flex items-center justify-center text-[#25D366] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">support_agent</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] text-white/50 group-hover:text-white/80 uppercase font-bold tracking-widest">Disponível</span>
                      <span className="text-sm font-bold text-white uppercase tracking-wide">Atendente {idx + 1}</span>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-white/30 group-hover:text-white text-lg">chevron_right</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
