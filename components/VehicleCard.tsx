import React, { useState, useMemo } from 'react';
import { Vehicle, VehicleType } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onInterest: (vehicle: Vehicle, mode?: 'default' | 'simular' | 'quero') => void;
  onClick?: () => void;
  variant?: 'default' | 'promo' | 'featured' | 'hero';
  imageFit?: 'cover' | 'contain';
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onInterest, onClick, variant = 'default', imageFit = 'cover' }) => {
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', scale: '1' });
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?v=${vehicle.id}`;
    const shareData = {
      title: vehicle.name,
      text: `Confira este veículo: ${vehicle.name} no Rei das Motos!`,
      url: shareUrl,
    };
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copiado para a área de transferência!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copiado para a área de transferência!');
        } catch (clipErr) {
          console.error('Erro ao copiar link:', clipErr);
        }
      }
    }
  };

  // Dynamic Styles based on Variant
  const isFeatured = variant === 'featured' || variant === 'promo';
  const aspectRatio = isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]';

  // Mouse Move for Zoom Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (vehicle.videoUrl || vehicle.isSold || imageError) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, scale: '1.5' });
  };

  const dynamicBadges = useMemo(() => {
    const badges: string[] = [];
    if (vehicle.isSold) return badges;
    
    const cat = (vehicle.category || '').toLowerCase();
    const name = (vehicle.name || '').toLowerCase();
    
    if (vehicle.km !== undefined && vehicle.km > 0 && vehicle.km < 15000) badges.push('💎 BAIXO KM');
    if (cat.includes('pop') || cat.includes('biz') || cat.includes('cg') || cat.includes('160') || vehicle.displacement && parseInt(vehicle.displacement.toString()) <= 160) {
      if (Math.random() > 0.5) badges.push('⚡ Econômica');
      else badges.push('🚀 Ótima para delivery');
    }
    if (name.includes('titan') || name.includes('fan') || name.includes('bros') || vehicle.isFeatured) badges.push('🔥 Muito procurada');
    if (cat.includes('cargo') || cat.includes('work')) badges.push('💼 Ideal para trabalho');
    
    // Select max 2 to avoid clutter
    return badges.slice(0, 2);
  }, [vehicle]);

  return (
    <div
      className={`relative bg-[#0d0d0d] rounded-xl overflow-hidden border border-white/5 group transition-all duration-300 hover:border-gold/30 flex flex-col h-full ${vehicle.isSold ? 'border-gold/20 opacity-90' : ''}`}
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

        <div className={`absolute ${isFeatured ? 'top-3 left-3' : 'bottom-2 left-2'} z-20 flex items-center justify-center w-8 h-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-gold pointer-events-none`}>
          <span className="material-symbols-outlined text-sm">
            {vehicle.type === VehicleType.MOTO ? 'motorcycle' : 'directions_car'}
          </span>
        </div>

        {/* Sold Badge Professional */}
        {vehicle.isSold && (
          <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center z-20 pointer-events-none">
            <span className="border-2 border-gold px-4 py-2 text-sm font-bold uppercase tracking-widest text-gold rounded-md shadow-[0_0_15px_rgba(255,215,0,0.3)] bg-black/50 rotate-[-10deg]">VENDIDO</span>
            <span className="text-[10px] text-white/80 mt-3 uppercase tracking-wider font-medium">Mais uma realização Rei das Motos</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 pointer-events-none">
          {vehicle.isRepasse && (
            <div className="self-start px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg border border-red-500/50 animate-pulse">
              ⚠️ Repasse
            </div>
          )}
          {vehicle.isZeroKm && (
            <div className="self-start px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
              0 KM
            </div>
          )}
          {dynamicBadges.map((badge, idx) => (
             <div key={idx} className="self-start px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                {badge}
             </div>
          ))}
        </div>

        {/* Botão de Compartilhar */}
        <button
          onClick={handleShare}
          className="absolute top-3 right-3 z-30 w-8 h-8 bg-black/60 hover:bg-gold text-white hover:text-black border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110"
          title="Compartilhar"
        >
          <span className="material-symbols-outlined text-sm">share</span>
        </button>

      </div>

      {/* INFO CONTENT FOR DEFAULT VARIANT */}
      {!isFeatured && (
        <div className="p-4 flex flex-col flex-1 gap-1">

          <h4 className="text-sm font-heading text-white font-semibold tracking-tight uppercase leading-snug line-clamp-2 h-[2.5em] mb-1 group-hover:text-gold transition-colors cursor-pointer" onClick={onClick}>
            {vehicle.name}
          </h4>

          <div className="flex items-center gap-3 text-[10px] text-white/80 font-bold uppercase tracking-wider mb-auto">
            <span className="bg-white/10 px-2 py-0.5 rounded text-white">{vehicle.year || '-'}</span>

            {vehicle.displacement && (
              <>
                <span className="w-px h-3 bg-gold/30 flex-shrink-0"></span>
                <span className="text-white/80">{vehicle.displacement} CC</span>
              </>
            )}

            <span className="w-px h-3 bg-gold/30 flex-shrink-0"></span>
            <div className="flex items-center gap-1 min-w-0 text-white/80">
              <span className="material-symbols-outlined text-[13px]">speed</span>
              <span className="truncate">{
                vehicle.km === undefined ? '-' :
                  vehicle.km <= 0 ? '0 KM' :
                    vehicle.km <= 10 ? '0 KM' :
                      `${vehicle.km.toLocaleString('pt-BR')} KM`
              }</span>
            </div>
          </div>

          {vehicle.plate_last3 && (
             <div className="flex items-center justify-between text-[9px] text-white/40 font-mono uppercase tracking-wider mt-1 pt-1">
               <span title={`Final Placa: ${vehicle.plate_last3}`}>PLACA: {vehicle.plate_last3}</span>
             </div>
          )}

          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">A partir de</p>
            <p className="text-gold font-bold text-xl leading-tight">
              {typeof vehicle.price === 'number' ? `R$ ${vehicle.price.toLocaleString('pt-BR')}` : vehicle.price}
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {vehicle.isSold ? (
              <button disabled className="w-full py-3 bg-white/5 text-white/30 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-white/5">
                <span className="text-xs font-bold tracking-wide uppercase">VENDIDO</span>
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInterest(vehicle, 'quero');
                  }}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-all rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-lg">touch_app</span>
                  Quero essa
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInterest(vehicle, 'simular');
                  }}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl flex items-center justify-center gap-2 border border-white/10 hover:-translate-y-0.5 active:scale-95 text-xs font-bold uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-base">calculate</span>
                  Simular parcela
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleCard;
