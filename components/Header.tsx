import React, { useState, useEffect } from 'react';
import { CategoryFilter } from '../types';

interface HeaderProps {
    filter: CategoryFilter;
    setFilter: (filter: CategoryFilter) => void;
    onAdminClick: () => void;
    onNewsletterClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ filter, setFilter, onAdminClick, onNewsletterClick }) => {
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
                <div className="flex items-center gap-4">
                    {/* HOME BUTTON */}
                    <button
                        onClick={() => {
                            setFilter('TUDO');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-gold transition-colors rounded-full hover:bg-white/10"
                        aria-label="Ir para Início"
                        title="Início"
                    >
                        <span className="material-symbols-outlined text-2xl">home</span>
                    </button>

                    {/* LOGO */}
                    <h1 className="text-2xl font-bold italic tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
                    <button
                        onClick={onNewsletterClick}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 hover:bg-gold/20 text-gold transition-colors text-xs font-bold uppercase tracking-widest border border-gold/20"
                    >
                        <span className="material-symbols-outlined text-sm">campaign</span>
                        <span>Novidades</span>
                    </button>
                </nav>

                {/* MOBILE MENU & ADMIN */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onNewsletterClick}
                        className="md:hidden w-10 h-10 flex items-center justify-center text-gold hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title="Novidades"
                    >
                        <span className="material-symbols-outlined">campaign</span>
                    </button>

                    <button
                        onClick={onAdminClick}
                        className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-gold transition-colors rounded-full hover:bg-white/10"
                        aria-label="Admin Panel"
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </div>

            {/* MOBILE NAV PILL (Floating below header) */}
            <div className="md:hidden absolute top-[120px] left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2 flex items-center gap-2 shadow-2xl w-max">
                {['TUDO', 'MOTOS', 'CARROS'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat as CategoryFilter)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${filter === cat ? 'bg-gold text-black shadow-lg scale-105' : 'text-white/70 hover:bg-white/10'
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
