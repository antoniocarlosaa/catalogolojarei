
import React from 'react';

interface ViewMoreCardProps {
    type: 'MOTOS' | 'CARROS';
    count: number;
    onClick: () => void;
}

const ViewMoreCard: React.FC<ViewMoreCardProps> = ({ type, count, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="relative bg-[#0d0d0d] rounded-[1.5rem] overflow-hidden border border-white/5 group transition-all duration-300 hover:border-gold/20 flex flex-col h-full min-h-[400px] justify-center items-center"
        >
            <div className="flex flex-col items-center gap-6 p-8">
                <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-gold text-4xl">
                        {type === 'MOTOS' ? 'motorcycle' : 'directions_car'}
                    </span>
                </div>

                <div className="text-center space-y-3">
                    <h4 className="text-xl font-heading text-white tracking-tight uppercase">
                        Ver Mais {type}
                    </h4>
                    <p className="text-white/40 text-xs uppercase tracking-widest">
                        +{count} veículos disponíveis
                    </p>
                </div>

                <div className="flex items-center gap-2 text-gold text-sm font-bold uppercase tracking-wider group-hover:gap-4 transition-all">
                    <span>Ver Todos</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </div>
            </div>
        </button>
    );
};

export default ViewMoreCard;
