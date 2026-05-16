import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';

interface FeaturedCarouselProps {
    vehicles: Vehicle[];
    onInterest: (vehicle: Vehicle) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ vehicles, onInterest }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Filtrar apenas veículos disponíveis para o carrossel
    const availableVehicles = vehicles.filter(v => !v.isSold);

    useEffect(() => {
        if (availableVehicles.length <= 1) return;

        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % availableVehicles.length);
                setIsAnimating(false);
            }, 500); // Tempo para a animação de saída
        }, 5000);

        return () => clearInterval(interval);
    }, [availableVehicles.length]);

    if (availableVehicles.length === 0) return null;

    // Garantir que o índice seja válido mesmo se a lista diminuir
    const safeIndex = currentIndex % availableVehicles.length;
    const currentVehicle = availableVehicles[safeIndex];

    // Proteção extra contra falhas de renderização
    if (!currentVehicle) return null;

    return (
        <div className="py-12 relative flex items-center justify-center">
            {/* Linha Dourada à Esquerda */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gold to-gold w-full max-w-[200px] lg:max-w-[400px] opacity-50"></div>

            {/* Card Central */}
            <div className="relative mx-4 sm:mx-8 w-full max-w-2xl">
                <div className="relative bg-black/80 backdrop-blur-md border border-gold/30 rounded-full p-2 flex items-center gap-6 overflow-hidden pr-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]">

                    {/* Imagem Circular */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-gold/20 overflow-hidden shrink-0 relative">
                        <img
                            src={currentVehicle.imageUrl}
                            alt={currentVehicle.name}
                            className={`w-full h-full object-cover transition-all duration-500 ${isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
                        />
                    </div>

                    {/* Informações */}
                    <div className={`flex-1 min-w-0 flex flex-col justify-center transition-all duration-500 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                        <span className="text-[9px] text-gold uppercase tracking-[0.3em] font-bold mb-1">Destaque do Momento</span>
                        <h3 className="text-white font-heading text-lg sm:text-2xl uppercase truncate tracking-wider">{currentVehicle.name}</h3>
                        <p className="text-white/50 text-[10px] sm:text-xs uppercase tracking-widest mt-1 mb-2">
                            {currentVehicle.year} • {currentVehicle.km?.toLocaleString('pt-BR') || '0'} KM
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="text-gold font-bold text-sm sm:text-base">
                                {typeof currentVehicle.price === 'number' ? `R$ ${currentVehicle.price.toLocaleString('pt-BR')}` : currentVehicle.price}
                            </span>
                            <button
                                onClick={() => onInterest(currentVehicle)}
                                className="hidden sm:flex px-4 py-1.5 bg-white/10 hover:bg-gold hover:text-black rounded-full text-[9px] uppercase font-bold tracking-widest transition-all items-center gap-2"
                            >
                                Ver Detalhes <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                    {/* Elemento Decorativo Animado */}
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black/50 to-transparent pointer-events-none"></div>
                </div>
            </div>

            {/* Linha Dourada à Direita */}
            <div className="h-[1px] bg-gradient-to-l from-transparent via-gold to-gold w-full max-w-[200px] lg:max-w-[400px] opacity-50"></div>
        </div>
    );
};

export default FeaturedCarousel;
