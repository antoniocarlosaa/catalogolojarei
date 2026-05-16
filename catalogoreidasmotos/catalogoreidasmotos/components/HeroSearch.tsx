import React from 'react';

interface HeroSearchProps {
    backgroundImageUrl?: string;
    backgroundPosition?: string;
}

const HeroSearch: React.FC<HeroSearchProps> = ({ backgroundImageUrl, backgroundPosition }) => {
    return (
        <div className="relative w-full max-w-[1400px] mx-auto mt-32 md:mt-28 mb-8 px-0 md:px-4">
            <div className="relative w-full h-[55vh] md:h-[45vh] min-h-[350px] rounded-bl-[2rem] rounded-br-[2rem] md:rounded-[2rem] overflow-hidden shadow-2xl border-b md:border border-white/10 group">
                {/* Background Image */}
                {backgroundImageUrl ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 group-hover:scale-105"
                        style={{
                            backgroundImage: `url(${backgroundImageUrl})`,
                            backgroundPosition: backgroundPosition || '50% 50%',
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-900 z-0" />
                )}

                {/* Slight Overlay for aesthetics purely */}
                <div className="absolute inset-0 bg-black/20 z-10" />
            </div>
        </div>

    );
};

export default HeroSearch;
