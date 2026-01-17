
import React, { useState, useRef } from 'react';
import { VehicleType, Vehicle } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (vehicle: Vehicle) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [specs, setSpecs] = useState('');
  const [type, setType] = useState<VehicleType>(VehicleType.MOTO);
  const [isPromoSemana, setIsPromoSemana] = useState(false);
  const [isPromoMes, setIsPromoMes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64 storage efficiency
        setError("A imagem é muito grande para armazenamento local. Use uma foto de até 2MB.");
        return;
      }
      setIsProcessing(true);
      try {
        const base64 = await fileToBase64(file);
        setImagePreview(base64);
        setError(null);
      } catch (err) {
        setError("Erro ao processar imagem.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for local video
        setError("O vídeo é muito grande. O limite é 10MB para garantir o desempenho.");
        return;
      }
      setIsProcessing(true);
      try {
        const base64 = await fileToBase64(file);
        setVideoPreview(base64);
        setError(null);
      } catch (err) {
        setError("Erro ao processar vídeo.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imagePreview) {
      setError("Adicione o nome e a foto principal.");
      return;
    }

    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toUpperCase(),
      price: isNaN(Number(price.replace(/\D/g, ''))) && price.length > 0 ? price : Number(price.replace(/\D/g, '')),
      type,
      imageUrl: imagePreview,
      videoUrl: videoPreview || undefined,
      isPromoSemana,
      isPromoMes,
      specs,
    };

    onUpload(newVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-surface border border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="font-heading text-gold text-3xl uppercase tracking-[0.1em]">Novo Cadastro</h2>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold mt-2">Sistema Base64 Persistente</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white transition-all"><span className="material-symbols-outlined">close</span></button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-500 text-xs font-bold uppercase tracking-wider">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[10px] text-white/40 uppercase font-bold tracking-widest">Foto Principal</label>
              <div onClick={() => !isProcessing && imageInputRef.current?.click()} className={`relative aspect-video bg-surface-light border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer rounded-2xl overflow-hidden group transition-all ${isProcessing ? 'opacity-50' : 'hover:border-gold/40'}`}>
                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : isProcessing ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div> : <span className="material-symbols-outlined text-gold">add_a_photo</span>}
                <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] text-white/40 uppercase font-bold tracking-widest">Vídeo (Opcional)</label>
              <div onClick={() => !isProcessing && videoInputRef.current?.click()} className={`relative aspect-video bg-surface-light border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer rounded-2xl overflow-hidden group transition-all ${isProcessing ? 'opacity-50' : 'hover:border-gold/40'}`}>
                {videoPreview ? <video src={videoPreview} className="w-full h-full object-cover" muted /> : isProcessing ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div> : <span className="material-symbols-outlined text-gold">videocam</span>}
                <input type="file" ref={videoInputRef} onChange={handleVideoChange} className="hidden" accept="video/*" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none uppercase" placeholder="MODELO COMERCIAL" />
            <div className="grid grid-cols-2 gap-6">
              <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none" placeholder="PREÇO (R$)" />
              <select value={type} onChange={(e) => setType(e.target.value as VehicleType)} className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none appearance-none">
                <option value={VehicleType.MOTO}>Moto</option>
                <option value={VehicleType.CARRO}>Carro</option>
              </select>
            </div>
            <textarea value={specs} onChange={(e) => setSpecs(e.target.value)} rows={3} className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none resize-none" placeholder="ESPECIFICAÇÕES..." />
          </div>

          <button type="submit" disabled={isProcessing} className="w-full py-6 bg-gold text-black text-[13px] font-heading tracking-[0.35em] rounded-full shadow-lg hover:bg-gold-light transition-all disabled:opacity-50">
            {isProcessing ? 'PROCESSANDO...' : 'CONFIRMAR PUBLICAÇÃO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
