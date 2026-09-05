import React, { useEffect, useState } from 'react';

interface HeroSearchProps {
    backgroundImageUrl?: string;
    backgroundPosition?: string;
    heroBanners?: string[];
    heroBannersMobile?: string[];
    heroBannersDesktop?: string[];
    onViewStock?: () => void;
    onWhatsAppClick?: () => void;
}

const HeroSearch: React.FC<HeroSearchProps> = ({ backgroundImageUrl, backgroundPosition, heroBanners = [], heroBannersMobile = [], heroBannersDesktop = [], onViewStock, onWhatsAppClick }) => {
    const unifiedBannerList = heroBanners?.length
        ? heroBanners
        : heroBannersMobile?.length
            ? heroBannersMobile
            : heroBannersDesktop?.length
                ? heroBannersDesktop
                : [];

    const bannerImages = (unifiedBannerList.length > 0 ? unifiedBannerList : backgroundImageUrl ? [backgroundImageUrl] : []).filter(Boolean);
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);

    useEffect(() => {
        setActiveBannerIndex(0);
    }, [unifiedBannerList.join('|')]);

    useEffect(() => {
        if (bannerImages.length <= 1) return;

        const interval = window.setInterval(() => {
            setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
        }, 5000);

        return () => window.clearInterval(interval);
    }, [bannerImages.length]);

    const currentBanner = bannerImages[activeBannerIndex] || bannerImages[0];

    return (
        <div className="relative w-full max-w-[1400px] mx-auto mt-32 md:mt-28 mb-8 px-4">
            <div className="relative w-full overflow-hidden rounded-[2rem] shadow-2xl border border-white/10 bg-[#111111]">
                <div className="relative h-[300px] sm:h-[380px] md:h-[560px] w-full overflow-hidden bg-black">
                    {currentBanner && (
                        <img
                            key={currentBanner}
                            src={currentBanner}
                            alt="Banner promocional"
                            className="absolute inset-0 h-full w-full object-cover object-center animate-[fadeIn_0.7s_ease-in-out]"
                            style={{ objectPosition: backgroundPosition || '50% 50%' }}
                        />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20" />

                    {bannerImages.length > 1 && (
                        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 md:right-6 md:top-6">
                            {bannerImages.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setActiveBannerIndex(index)}
                                    aria-label={`Banner ${index + 1}`}
                                    className={`h-2.5 rounded-full transition-all ${index === activeBannerIndex ? 'w-8 bg-gold' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="relative z-20 flex h-full items-center px-6 py-8 md:px-12 lg:px-16">
                        <div className="max-w-xl">
                            <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-gold">
                                Aproveite agora
                            </span>

                            <h1 className="mt-4 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white md:text-5xl lg:text-7xl">
                                Nossas
                                <span className="block text-gold">ofertas</span>
                                <span className="block text-white">de seminovos</span>
                            </h1>

                            <p className="mt-4 max-w-md text-sm text-white/85 md:text-lg">
                                Escolha sua moto e fale conosco para verificar entrada, parcelas e aprovação.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={onViewStock}
                                    className="px-6 py-3 bg-gold hover:bg-yellow-400 text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105"
                                >
                                    Ver estoque
                                </button>
                                <button
                                    onClick={onWhatsAppClick}
                                    className="px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">chat</span>
                                    Falar no WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSearch;
