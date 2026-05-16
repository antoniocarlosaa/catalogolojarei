
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

  // Dynamic Styles based on Variant
  const isFeatured = variant === 'featured' || variant === 'promo';
  const aspectRatio = isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]';
  const cardPadding = isFeatured ? 'p-0' : 'p-3';

  // Mouse Move for Zoom Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (vehicle.videoUrl || vehicle.isSold || imageError) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, scale: '1.5' });
  };

  return (
    <div
      className={`relative bg-[#0d0d0d] rounded-xl overflow-hidden border border-white/5 group transition-all duration-300 hover:border-gold/30 flex flex-col h-full ${vehicle.isSold ? '' : ''} ${vehicle.isSold ? 'border-green-500/20' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setIsHovered(false); setZoomStyle({ transformOrigin: 'center center', scale: '1' }); }}
    >
      {/* Media Area */}
      <div
        className={`relative ${aspectRatio} overflow-hidden bg-black/20 cursor-pointer group/image`}
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
            {imageFit === 'contain' && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110"
                style={{ backgroundImage: `url(${vehicle.isSold && vehicle.salesPhotoUrl ? vehicle.salesPhotoUrl : vehicle.imageUrl})` }}
              />
            )}
            <img
              src={vehicle.isSold && vehicle.salesPhotoUrl ? vehicle.salesPhotoUrl : vehicle.imageUrl}
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

            {/* Picture-in-Picture: Show Original Vehicle Image in corner if Sold and has Sales Photo */}
            {vehicle.isSold && vehicle.salesPhotoUrl && (
              <div className="absolute bottom-2 right-2 w-16 h-12 rounded-lg overflow-hidden border-2 border-white/50 shadow-lg z-20 bg-black/50">
                <img
                  src={vehicle.imageUrl}
                  className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  alt="Original"
                  title="Foto Original"
                />
              </div>
            )}
          </div>
        )}

        {/* OVERLAY CONTENT FOR FEATURED VARIANT */}
        {isFeatured && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none flex flex-col justify-end p-4">
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h4 className="text-lg md:text-xl font-heading text-white font-bold tracking-tight uppercase leading-none drop-shadow-lg">
                {vehicle.name}
              </h4>
              <p className="text-gold font-bold text-lg mt-1 drop-shadow-md">
                {typeof vehicle.price === 'number' ? `R$ ${vehicle.price.toLocaleString('pt-BR')}` : vehicle.price}
              </p>
            </div>
          </div>
        )}

        {/* Badges */}
        {/* Type Badge */}
        <div className={`absolute ${isFeatured ? 'top-3 left-3' : 'bottom-2 left-2'} z-20 flex items-center justify-center w-8 h-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-gold pointer-events-none`}>
          <span className="material-symbols-outlined text-sm">
            {vehicle.type === VehicleType.MOTO ? 'motorcycle' : 'directions_car'}
          </span>
        </div>

        {/* Sold Badge */}
        {vehicle.isSold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 pointer-events-none">
            <span className="border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-full bg-red-900/80">VENDIDO</span>
          </div>
        )}
        {/* Mileage Badges (Moved to Image Overlay) */}
        {/* Mileage Badges */}
        {vehicle.isRepasse && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg z-20 border border-red-500/50 animate-pulse">
            ⚠️ Repasse
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {vehicle.isFeatured && (
            <div className="self-start px-3 py-1 bg-gold text-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
              Destaque
            </div>
          )}
          {(vehicle.isPromoSemana || vehicle.isPromoMes) && (
            <div className="self-start px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
              Promoção
            </div>
          )}
          {vehicle.isZeroKm && (
            <div className="self-start px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
              0 KM
            </div>
          )}
        </div>

      </div>

      {/* INFO CONTENT FOR DEFAULT VARIANT */}
      {!isFeatured && (
        <div className="p-3 flex flex-col flex-1 gap-1"> {/* Reduced gap */}

          <h4 className="text-sm font-heading text-white font-semibold tracking-tight uppercase leading-snug line-clamp-2 h-[2.5em] mb-1">
            {vehicle.name}
          </h4>

          {/* Details Row - Cleaned up */}
          <div className="flex items-center gap-2 text-[10px] text-white/60 font-medium uppercase tracking-wider mb-auto">
            <span className="whitespace-nowrap">{vehicle.year || '-'}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full flex-shrink-0"></span>
            <span className="whitespace-nowrap">{
              vehicle.km === undefined ? '-' :
                vehicle.km <= 0 ? '0 KM' :
                  vehicle.km <= 10 ? 'SEMI NOVA' :
                    vehicle.km < 20 ? 'KM BAIXO' :
                      `${vehicle.km.toLocaleString('pt-BR')} KM`
            }</span>
          </div>

          {/* Cod & Placa Section */}
          <div className="flex items-center justify-between text-[9px] text-white/40 font-monouppercase tracking-wider mt-1 border-t border-white/5 pt-1">
            {vehicle.plate_last3 && (
              <span title={`Final Placa: ${vehicle.plate_last3}`}>PLACA: {vehicle.plate_last3}</span>
            )}
          </div>

          {/* Category/Specs below detail row if needed, or just keep it simple. User wanted order. */}
          {/* Let's put category on its own line if it exists to avoid wrapping weirdness with the dots */}
          {(vehicle.category || vehicle.specs) && (
            <div className="text-[9px] text-white/40 font-medium uppercase tracking-widest truncate mb-2 mt-1">
              {vehicle.category || (vehicle.specs ? vehicle.specs.split('|').filter(s => {
                const upper = s.trim().toUpperCase();
                return !upper.startsWith('COR:') && !upper.startsWith('ANO:') && !upper.startsWith('KM:') && !upper.startsWith('[KM') && !upper.startsWith('SEMI NOVA') && !upper.startsWith('ZERO KM');
              }).join(' | ') : '')}
            </div>
          )}


          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">A partir de</p>
            <p className="text-white font-bold text-lg leading-tight">
              {typeof vehicle.price === 'number' ? `R$ ${vehicle.price.toLocaleString('pt-BR')}` : vehicle.price}
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {/* Ver Detalhes - Opens Modal */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white transition-all rounded-lg flex items-center justify-center gap-2 group/btn border border-white/10"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider">Ver Detalhes</span>
              <span className="material-symbols-outlined text-base group-hover/btn:translate-x-1 transition-transform">visibility</span>
            </button>

            <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
              {/* WhatsApp */}
              {vehicle.isSold ? (
                <button
                  disabled
                  className="flex-1 py-2 bg-red-500/20 text-red-500 font-bold rounded-full flex items-center justify-center gap-2 cursor-not-allowed border border-red-500/20"
                >
                  <span className="text-xs font-bold tracking-wide uppercase">VENDIDO</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInterest(vehicle);
                  }}
                  className="flex-1 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-all rounded-full flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="text-xs font-bold tracking-wide uppercase">WhatsApp</span>
                </button>
              )}

              {/* Share Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `${window.location.origin}?v=${vehicle.id}`;
                  if (navigator.share) {
                    navigator.share({
                      title: vehicle.name,
                      text: `Confira este veículo: ${vehicle.name}`,
                      url: url
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('Link copiado!');
                  }
                }}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95"
                title="Compartilhar"
              >
                <span className="material-symbols-outlined text-sm">share</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleCard;
