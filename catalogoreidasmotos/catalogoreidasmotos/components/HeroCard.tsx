
import React, { useState } from 'react';
import { Vehicle, VehicleType } from '../types';

interface HeroCardProps {
    vehicle: Vehicle;
    onInterest: (vehicle: Vehicle) => void;
    onViewDetails?: (vehicle: Vehicle) => void;
}

const HeroCard: React.FC<HeroCardProps> = ({ vehicle, onInterest, onViewDetails }) => {
    const [imageError, setImageError] = useState(false);
    const isPromo = vehicle.isPromoSemana || vehicle.isPromoMes;

    return (
        <div
            onClick={() => onViewDetails && onViewDetails(vehicle)}
            className={`relative bg-[#0d0d0d] rounded-[1.5rem] overflow-hidden border border-white/5 group transition-all duration-300 hover:border-gold/20 cursor-pointer ${vehicle.isSold ? 'opacity-40 grayscale' : ''}`}
        >
            <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Imagem - 60% */}
                <div className="lg:col-span-3 relative aspect-[16/9] overflow-hidden bg-black/20">
                    {imageError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/5">
                            <span className="material-symbols-outlined text-3xl">no_photography</span>
                        </div>
                    ) : vehicle.videoUrl ? (
                        <video src={vehicle.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                        <img
                            src={vehicle.imageUrl}
                            onError={() => setImageError(true)}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: vehicle.imagePosition || 'center' }}
                            loading="lazy"
                            alt={vehicle.name}
                        />
                    )}

                    <div className="absolute bottom-3 left-3 z-20 flex items-center justify-center w-9 h-9 bg-black/40 backdrop-blur-lg border border-white/5 rounded-full text-gold">
                        <span className="material-symbols-outlined text-lg">
                            {isPromo ? 'local_fire_department' : (vehicle.type === VehicleType.MOTO ? 'motorcycle' : 'directions_car')}
                        </span>
                    </div>

                    {vehicle.isSold && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] z-20">
                            <span className="border border-white/20 px-5 py-2 text-[8px] font-bold uppercase tracking-widest text-white rounded-full">INDISPONÍVEL</span>
                        </div>
                    )}
                </div>

                {/* Info - 40% */}
                <div className="lg:col-span-2 p-8 flex flex-col justify-center">
                    <h4 className="text-2xl lg:text-3xl font-heading text-white tracking-tight uppercase leading-tight mb-6">
                        {vehicle.name}
                    </h4>

                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <span className="text-white/20 text-[7px] font-bold uppercase tracking-widest mb-1">Investimento</span>
                            <p className="text-white font-heading text-3xl lg:text-4xl tracking-tighter">
                                {typeof vehicle.price === 'number' ? `R$ ${vehicle.price.toLocaleString('pt-BR')}` : vehicle.price}
                            </p>
                        </div>

                        <button
                            onClick={() => onInterest(vehicle)}
                            className="w-full py-4 bg-white text-black hover:bg-gold active:scale-95 transition-all rounded-xl flex items-center justify-center gap-3 group"
                        >
                            <span className="text-xs font-bold uppercase tracking-wider">TENHO INTERESSE</span>
                            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default HeroCard;
