import React, { useState, useEffect } from 'react';
import { CategoryFilter } from '../types';

interface HeaderProps {
    filter: CategoryFilter;
    setFilter: (filter: CategoryFilter) => void;
    onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ filter, setFilter, onAdminClick }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex flex-col items-center ${isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
                }`}
        >
            {/* TOP TITLE BAR */}
            <div className="w-full text-center py-2 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <h2 className="text-sm md:text-lg font-heading text-white font-bold tracking-widest uppercase drop-shadow-md">
                    Encontre seu <span className="text-gold">Veículo dos Sonhos</span>
                </h2>
            </div>

            <div className="w-full max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                {/* LOGO AREA */}
                <div className="flex items-center gap-2">
                    {/* Placeholder for Logo - text for now */}
                    <h1 className="text-2xl font-bold italic tracking-tighter text-white">
                        REI DAS <span className="text-gold">MOTOS</span>
                    </h1>
                </div>

                {/* DESKTOP NAVIGATION */}
                <nav className="hidden md:flex items-center gap-8">
                    {['TUDO', 'MOTOS', 'CARROS', 'PROMOÇÕES'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat as CategoryFilter)}
                            className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-gold ${filter === cat ? 'text-gold scale-110' : 'text-white/80'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>

                {/* MOBILE MENU & ADMIN */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onAdminClick}
                        className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-gold transition-colors rounded-full hover:bg-white/10"
                        aria-label="Admin Panel"
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </button>

                    {/* Mobile Menu Toggle could go here (simplified for now to rely on layout) */}
                </div>
            </div>

            {/* MOBILE NAV BAR (Visible only on small screens, integrated into header) */}
            <div className="md:hidden flex justify-center gap-4 py-2 mt-2 border-t border-white/10 bg-black/50 backdrop-blur-sm">
                {['TUDO', 'MOTOS', 'CARROS'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat as CategoryFilter)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${filter === cat ? 'bg-gold text-black' : 'text-white/80 hover:bg-white/10'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </header>
    );
};

export default Header;
