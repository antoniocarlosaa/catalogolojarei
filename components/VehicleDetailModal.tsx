import React, { useState } from 'react';
import { Vehicle } from '../types';
import ImageLightbox from './ImageLightbox';

interface VehicleDetailModalProps {
    vehicle: Vehicle;
    onClose: () => void;
    onInterest: (vehicle: Vehicle) => void;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({ vehicle, onClose, onInterest }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.imageUrl];

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="bg-[#121212] w-full max-w-6xl max-h-[90vh] rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all border border-white/10"
                    onClick={onClose}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Galeria - Esquerda (Mobile: Topo) */}
                <div className="lg:w-3/5 bg-black/50 relative flex flex-col">
                    {/* Imagem Principal */}
                    <div className="flex-1 relative aspect-video lg:aspect-auto overflow-hidden group">
                        <img
                            src={images[activeImageIndex]}
                            className="w-full h-full object-contain bg-black/40 cursor-zoom-in"
                            alt={vehicle.name}
                            onClick={() => setIsLightboxOpen(true)}
                        />

                        {isLightboxOpen && (
                            <ImageLightbox
                                src={images[activeImageIndex]}
                                alt={vehicle.name}
                                onClose={() => setIsLightboxOpen(false)}
                            />
                        )}

                        {/* Navegação de Imagens */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-gold hover:text-black transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-gold hover:text-black transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="p-4 flex gap-3 overflow-x-auto bg-black/20 border-t border-white/5">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImageIndex === idx ? 'border-gold opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detalhes - Direita (Mobile: Baixo) */}
                <div className="lg:w-2/5 p-8 lg:p-12 overflow-y-auto flex flex-col bg-surface">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            {vehicle.isFeatured && <span className="px-3 py-1 bg-gold text-black text-[10px] font-bold uppercase tracking-widest rounded-full">Destaque</span>}
                            {(vehicle.isPromoSemana || vehicle.isPromoMes) && <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Promoção</span>}
                            {vehicle.isZeroKm && <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">0 KM</span>}
                            {vehicle.isRepasse && <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse border border-red-500">⚠️ Repasse</span>}
                        </div>

                        <h2 className="text-3xl lg:text-4xl font-heading text-white uppercase leading-tight mb-2">{vehicle.name}</h2>

                        {vehicle.plate_last3 && (
                            <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 mb-4">
                                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Final Placa</span>
                                <span className="text-sm font-mono text-gold tracking-widest">{vehicle.plate_last3}</span>
                            </div>
                        )}

                        <div className="flex flex-col mt-4">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Valor do Investimento</span>
                            <div className="text-4xl lg:text-5xl font-heading text-gold tracking-tighter">
                                R$ {typeof vehicle.price === 'number' ? vehicle.price.toLocaleString('pt-BR') : vehicle.price}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mb-8 flex-1">
                        <h3 className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-2">Especificações</h3>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <span className="block text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Ano / Modelo</span>
                                <span className="text-white text-lg">{vehicle.year || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Quilometragem</span>
                                <span className="text-white text-lg">{vehicle.km ? `${vehicle.km.toLocaleString('pt-BR')} KM` : '-'}</span>
                            </div>

                            <div>
                                <span className="block text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Combustível</span>
                                <span className="text-white text-lg">{vehicle.fuel || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Cor</span>
                                <span className="text-white text-lg">{vehicle.color || '-'}</span>
                            </div>
                        </div>

                        {/* Checklist Section */}
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <h4 className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-4">Itens & Documentação</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Único Dono', value: vehicle.isSingleOwner, icon: 'person' },
                                    { label: 'DUT', value: vehicle.hasDut, icon: 'description' },
                                    { label: 'Manual', value: vehicle.hasManual, icon: 'menu_book' },
                                    { label: 'Chave Reserva', value: vehicle.hasSpareKey, icon: 'vpn_key' },
                                    { label: 'Revisões Feitas', value: vehicle.hasRevisoes, icon: 'build_circle' },
                                ].map((item) => (
                                    <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.value ? 'bg-white/5 border-gold/20 text-white' : 'bg-transparent border-white/5 text-white/20'}`}>
                                        <span className={`material-symbols-outlined text-lg ${item.value ? 'text-gold' : 'text-white/20'}`}>{item.icon}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
                                        <span className={`ml-auto material-symbols-outlined text-sm ${item.value ? 'text-green-500' : 'text-red-500/50'}`}>
                                            {item.value ? 'check_circle' : 'cancel'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {vehicle.specs && (
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 mt-4">
                                <span className="block text-[9px] text-gold uppercase font-bold tracking-widest mb-2">Detalhes Adicionais</span>
                                <p className="text-white/80 text-sm leading-relaxed">{vehicle.specs ? vehicle.specs.split('|').filter(s => {
                                    const upper = s.trim().toUpperCase();
                                    return !upper.startsWith('COR:') && !upper.startsWith('ANO:') && !upper.startsWith('KM:') && !upper.startsWith('[KM') && !upper.startsWith('SEMI NOVA') && !upper.startsWith('ZERO KM');
                                }).join(' | ') : ''}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onInterest(vehicle)}
                        className="w-full py-2 bg-[#25D366] hover:bg-[#128C7E] text-white active:scale-95 transition-all rounded-xl flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] animate-pulse hover:animate-none"
                    >
                        <span className="text-base font-bold uppercase tracking-wider">Whatsapp</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetailModal;
