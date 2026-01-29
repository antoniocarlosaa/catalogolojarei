import React from 'react';
import { Vehicle } from '../types';
import VehicleCard from './VehicleCard';

interface StockGridProps {
    title: string;
    vehicles: Vehicle[];
    onInterest: (vehicle: Vehicle) => void;
    onViewDetails: (vehicle: Vehicle) => void;
    imageFit?: 'cover' | 'contain';
}

const StockGrid: React.FC<StockGridProps> = ({ title, vehicles, onInterest, onViewDetails, imageFit }) => {
    if (vehicles.length === 0) return null;

    return (
        <section className="w-full max-w-[1400px] mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6 pl-2">
                <h3 className="text-lg md:text-xl text-white font-bold uppercase tracking-wider border-l-4 border-gold pl-3">
                    {title}
                </h3>
            </div>

            {/* GRID LAYOUT: Wrapping items, filling vertical space */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="h-full">
                        <VehicleCard
                            vehicle={vehicle}
                            onInterest={onInterest}
                            onClick={() => onViewDetails(vehicle)}
                            imageFit={imageFit}
                            variant="default" // Force default (compact) variant for grid
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StockGrid;
