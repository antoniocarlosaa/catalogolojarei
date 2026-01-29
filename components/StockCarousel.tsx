import React from 'react';
import { Vehicle } from '../types';
import VehicleCard from './VehicleCard';

interface StockCarouselProps {
  title: string;
  vehicles: Vehicle[];
  onInterest: (vehicle: Vehicle) => void;
  onViewDetails: (vehicle: Vehicle) => void;
  imageFit?: 'cover' | 'contain';
}

const StockCarousel: React.FC<StockCarouselProps> = ({ title, vehicles, onInterest, onViewDetails, imageFit }) => {
  if (vehicles.length === 0) return null;

  // Determine variant based on title keywords for now to avoid changing App.tsx immediately or add optional prop
  // Ideally, App.tsx should pass it. But let's check props.
  // Actually, I can infer it. 
  // "Destaques" or "Promoções" -> featured
  // "Motos" or "Carros" -> default

  const isFeatured = title.includes('Destaque') || title.includes('Promoç');
  const variant = isFeatured ? 'featured' : 'default';

  // Card Widths
  // Default: Compact fixed width
  // Featured: Cinematic fixed width
  // Using flex-none and w-[...] to prevent growing/shrinking issues
  const cardWidthClass = isFeatured
    ? "w-[280px] md:w-[340px] flex-none"
    : "w-[200px] md:w-[240px] flex-none";

  const carouselRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (vehicles.length <= 6) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [vehicles.length]);

  return (
    <section className="w-full max-w-[1400px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-4 pl-2">
        <h3 className="text-lg md:text-xl text-white font-bold uppercase tracking-wider border-l-4 border-gold pl-3">
          {title}
        </h3>
      </div>

      <div className="relative -mx-4 px-4 overflow-hidden group/carousel">
        <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className={`${cardWidthClass} snap-center`}>
              <div className="h-full transform transition-transform hover:-translate-y-1 duration-300">
                <VehicleCard
                  vehicle={vehicle}
                  onInterest={onInterest}
                  onClick={() => onViewDetails(vehicle)}
                  imageFit={imageFit}
                  variant={variant}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StockCarousel;
