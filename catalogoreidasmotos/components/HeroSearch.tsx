import React from 'react';

interface HeroSearchProps {
    backgroundImageUrl?: string;
    backgroundPosition?: string;
}

const HeroSearch: React.FC<HeroSearchProps> = ({ backgroundImageUrl, backgroundPosition }) => {
    return (
        <div className="relative w-full max-w-[1400px] mx-auto mt-32 md:mt-28 mb-8 px-4 md:px-4">
            <div className="relative w-full min-h-[500px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group flex items-center justify-center text-center p-6 md:p-12">
                {/* Background Image */}
                {backgroundImageUrl ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 group-hover:scale-105"
                        style={{
                            backgroundImage: `url(${backgroundImageUrl})`,
                            backgroundPosition: backgroundPosition || '50% 50%',
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-900 z-0" />
                )}

                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40 z-10" />

                {/* Content Area */}
                <div className="relative z-20 flex flex-col items-center max-w-4xl w-full">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading text-white font-black tracking-tight uppercase leading-[1.1] mb-6 drop-shadow-2xl">
                        Encontre sua <span className="text-gold">próxima moto</span> na Rei das Motos
                    </h2>
                    
                    <p className="text-lg md:text-2xl text-white/90 font-medium mb-10 max-w-2xl drop-shadow-md">
                        Escolha sua moto e fale conosco para verificar entrada, parcelas e aprovação.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-8 bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-black">
                                <span className="material-symbols-outlined font-bold text-sm">check</span>
                            </span>
                            <span className="text-white font-bold tracking-wide uppercase text-sm md:text-base">Aprovação rápida</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-black">
                                <span className="material-symbols-outlined font-bold text-sm">check</span>
                            </span>
                            <span className="text-white font-bold tracking-wide uppercase text-sm md:text-base">Entrada facilitada</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-black">
                                <span className="material-symbols-outlined font-bold text-sm">check</span>
                            </span>
                            <span className="text-white font-bold tracking-wide uppercase text-sm md:text-base">Atendimento humanizado</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSearch;
