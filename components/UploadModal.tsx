
import React, { useState, useRef } from 'react';
import { VehicleType, Vehicle } from '../types';
import { supabase } from '../services/supabase';

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
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("A imagem deve ter no máximo 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setError("O vídeo deve ter no máximo 20MB.");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('vehicle-media')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('vehicle-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageFile) {
      setError("Adicione o nome e a foto principal.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Upload da Imagem
      let imageUrl = '';
      try {
        imageUrl = await uploadFile(imageFile, 'images');
      } catch (err: any) {
        throw new Error(`Erro ao enviar imagem: ${err.message}`);
      }

      // Upload do Vídeo (Opcional)
      let videoUrl = undefined;
      if (videoFile) {
        try {
          videoUrl = await uploadFile(videoFile, 'videos');
        } catch (err: any) {
          console.error("Erro no upload de vídeo:", err);
          // Não bloqueia o cadastro se o vídeo falhar, mas avisa
          alert(`Aviso: O vídeo não pôde ser enviado (${err.message}), mas o veículo será cadastrado.`);
        }
      }

      const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const newVehicle: Vehicle = {
        id: uuidv4(), // Garante formato UUID v4 compatível com Supabase
        name: name.toUpperCase(),
        price: isNaN(Number(price.replace(/\D/g, ''))) && price.length > 0 ? price : Number(price.replace(/\D/g, '')),
        type,
        imageUrl, // URL real do Supabase
        videoUrl, // URL real do Supabase
        isPromoSemana,
        isPromoMes,
        specs,
      };

      onUpload(newVehicle);
      onClose();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao processar cadastro. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-surface border border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="font-heading text-gold text-3xl uppercase tracking-[0.1em]">Novo Cadastro <span className="text-xs text-white/50">v2.0</span></h2>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold mt-2">Upload Seguro (UUID Fix)</p>
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
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none uppercase" placeholder="MODELO COMERCIAL" disabled={isProcessing} />
            <div className="grid grid-cols-2 gap-6">
              <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none" placeholder="PREÇO (R$)" disabled={isProcessing} />
              <select value={type} onChange={(e) => setType(e.target.value as VehicleType)} className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none appearance-none" disabled={isProcessing}>
                <option value={VehicleType.MOTO}>Moto</option>
                <option value={VehicleType.CARRO}>Carro</option>
              </select>
            </div>
            <textarea value={specs} onChange={(e) => setSpecs(e.target.value)} rows={3} className="w-full bg-surface-light border border-white/5 text-white text-sm px-6 py-4 rounded-2xl focus:border-gold outline-none resize-none" placeholder="ESPECIFICAÇÕES..." disabled={isProcessing} />
          </div>

          <button type="submit" disabled={isProcessing} className="w-full py-6 bg-gold text-black text-[13px] font-heading tracking-[0.35em] rounded-full shadow-lg hover:bg-gold-light transition-all disabled:opacity-50">
            {isProcessing ? 'ENVIANDO MÍDIA...' : 'CONFIRMAR PUBLICAÇÃO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
