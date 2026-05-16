import React from 'react';

interface HeroSearchProps {
    backgroundImageUrl?: string;
    backgroundPosition?: string;
    onViewStock?: () => void;
    onWhatsAppClick?: () => void;
}

const HeroSearch: React.FC<HeroSearchProps> = ({ backgroundImageUrl, backgroundPosition, onViewStock, onWhatsAppClick }) => {
    return (
        <div className="relative w-full max-w-[1400px] mx-auto mt-32 md:mt-28 mb-8 px-4">
            <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group bg-[#0d0d0d] flex flex-col md:flex-row md:items-center min-h-auto md:min-h-[500px]">
                {/* Background Image - Mobile (Top block) & Desktop (Full background) */}
                {backgroundImageUrl && (
                    <>
                        {/* Mobile Image */}
                        <div 
                            className="md:hidden w-full h-[250px] sm:h-[350px] bg-cover bg-center"
                            style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundPosition: backgroundPosition || '50% 50%' }}
                        />
                        {/* Desktop Image */}
                        <div
                            className="hidden md:block absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 group-hover:scale-105"
                            style={{
                                backgroundImage: `url(${backgroundImageUrl})`,
                                backgroundPosition: backgroundPosition || '50% 50%',
                            }}
                        />
                    </>
                )}
                
                {/* Desktop Overlay Gradient */}
                <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-10" />

                {/* Content */}
                <div className="relative z-20 p-6 md:p-12 lg:p-16 w-full md:max-w-3xl flex flex-col gap-5 md:gap-6 bg-surface md:bg-transparent">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading text-white font-bold leading-tight drop-shadow-lg">
                        Encontre sua próxima moto na <span className="text-gold">Rei das Motos</span>
                    </h1>
                    
                    <p className="text-base md:text-xl text-white/90 font-medium drop-shadow-md">
                        Escolha sua moto e fale conosco para verificar entrada, parcelas e aprovação.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-2 md:mt-4">
                        <button 
                            onClick={onViewStock}
                            className="px-6 md:px-8 py-4 bg-gold hover:bg-yellow-400 text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105"
                        >
                            Ver estoque
                        </button>
                        <button 
                            onClick={onWhatsAppClick}
                            className="px-6 md:px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">chat</span>
                            Falar no WhatsApp
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 md:gap-4 sm:gap-6 mt-4 md:mt-6">
                        <div className="flex items-center gap-2 text-white text-sm md:text-base font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5 w-fit">
                            <span className="text-[#25D366] font-bold">✓</span> Aprovação rápida
                        </div>
                        <div className="flex items-center gap-2 text-white text-sm md:text-base font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5 w-fit">
                            <span className="text-[#25D366] font-bold">✓</span> Entrada facilitada
                        </div>
                        <div className="flex items-center gap-2 text-white text-sm md:text-base font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5 w-fit">
                            <span className="text-[#25D366] font-bold">✓</span> Atendimento humanizado
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSearch;
