import React, { useState, useEffect } from 'react';

interface PromoPopupProps {
    imageUrl: string;
    link?: string;
    text?: string;
    onClose: () => void;
}

const PromoPopup: React.FC<PromoPopupProps> = ({ imageUrl, link, text, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Pequeno delay para animação de entrada
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    if (!imageUrl && !text) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`relative max-w-lg w-full bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Botão Fechar Fora da Imagem (canto superior direito do modal) */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/50 text-white hover:bg-red-500 rounded-full transition-colors backdrop-blur-md"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                {/* Conteúdo */}
                <div
                    onClick={() => {
                        if (link) {
                            window.open(link, '_blank');
                            onClose();
                        }
                    }}
                    className={`w-full flex-1 flex flex-col ${link ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
                >
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Promoção"
                            className="w-full h-auto object-contain max-h-[60vh] bg-black/20"
                        />
                    )}

                    {text && (
                        <div className="p-6 bg-surface-light border-t border-white/5">
                            <p className="text-white text-center text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap">
                                {text}
                            </p>
                        </div>
                    )}
                </div>

                {link && (
                    <div className="bg-gold text-black text-center py-3 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-white transition-colors" onClick={() => {
                        window.open(link, '_blank');
                        onClose();
                    }}>
                        Clique para Conferir
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoPopup;
