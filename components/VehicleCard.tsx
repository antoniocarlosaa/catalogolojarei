
import React, { useState } from 'react';
import { Vehicle, VehicleType } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onInterest: (vehicle: Vehicle) => void;
  onClick?: () => void;
  variant?: 'default' | 'promo' | 'featured' | 'hero';
  imageFit?: 'cover' | 'contain';
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onInterest, onClick, variant = 'default', imageFit = 'cover' }) => {
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', scale: '1' });
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (vehicle.videoUrl || vehicle.isSold || imageError) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, scale: '2.5' });
  };

  const isPromo = vehicle.isPromoSemana || vehicle.isPromoMes;

  return (
    <div
      className={`relative bg-[#0d0d0d] rounded-[1.5rem] overflow-hidden border border-white/5 group transition-all duration-300 hover:border-gold/20 flex flex-col h-full ${vehicle.isSold ? 'opacity-40 grayscale' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setIsHovered(false); setZoomStyle({ transformOrigin: 'center center', scale: '1' }); }}
    >
      {/* Modal image logic removed in favor of global modal */}
      {/* Media Area */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-black/20 cursor-pointer group/image"
        onClick={onClick}
      >
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/5">
            <span className="material-symbols-outlined text-3xl">no_photography</span>
          </div>
        ) : vehicle.videoUrl ? (
          <video src={vehicle.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <div className="w-full h-full relative">
            {/* Efeito de blur no fundo se for contain */}
            {imageFit === 'contain' && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110"
                style={{ backgroundImage: `url(${vehicle.imageUrl})` }}
              />
            )}
            <img
              src={vehicle.imageUrl}
              onError={() => setImageError(true)}
              className={`w-full h-full ${imageFit === 'cover' ? 'object-cover' : 'object-contain relative z-10'} transition-transform duration-700 ease-out`}
              style={{
                transformOrigin: zoomStyle.transformOrigin,
                transform: `scale(${zoomStyle.scale})`,
                willChange: 'transform',
                objectPosition: vehicle.imagePosition || '50% 50%'
              }}
              loading="lazy"
              alt={vehicle.name}
            />
            {/* Hint de que é clicável */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[2px]">
              <span className="material-symbols-outlined text-white text-3xl scale-50 group-hover/image:scale-100 transition-transform">zoom_in</span>
            </div>
          </div>
        )}

        {/* Mini Modality Icon */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center justify-center w-9 h-9 bg-black/40 backdrop-blur-lg border border-white/5 rounded-full text-gold pointer-events-none">
          <span className="material-symbols-outlined text-lg">
            {isPromo ? 'local_fire_department' : (vehicle.type === VehicleType.MOTO ? 'motorcycle' : 'directions_car')}
          </span>
        </div>

        {vehicle.isSold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] z-20 pointer-events-none">
            <span className="border border-white/20 px-5 py-2 text-[8px] font-bold uppercase tracking-widest text-white rounded-full">INDISPONÍVEL</span>
          </div>
        )}
      </div>

      {/* Info Content - Mais compacto */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h4 className="text-base font-heading text-white tracking-tight uppercase leading-tight line-clamp-1">
            {vehicle.name}
          </h4>
        </div>

        <div className="mt-auto space-y-5">
          <div className="flex flex-col">
            <span className="text-white/20 text-[7px] font-bold uppercase tracking-widest mb-0.5">Investimento</span>
            <p className="text-white font-heading text-2xl tracking-tighter">
              {typeof vehicle.price === 'number' ? `R$ ${vehicle.price.toLocaleString('pt-BR')}` : vehicle.price}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onInterest(vehicle);
            }}
            className="w-full py-3.5 bg-white text-black hover:bg-gold active:scale-95 transition-all rounded-xl flex items-center justify-center gap-3 group"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">TENHO INTERESSE</span>
            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Full Screen Modal Removed */}
    </div >
  );
};

export default VehicleCard;
