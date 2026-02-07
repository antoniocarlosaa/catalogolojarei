import React, { useState, useRef, useEffect } from 'react';
import { Vehicle, VehicleType, AppSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { logger, AccessLog, AuditLog } from '../services/LogService';
import { db } from '../services/VehicleService';
import { supabase } from '../services/supabase';


interface AdminPanelProps {
  currentNumbers: string[];
  currentMapsUrl?: string;
  currentBackgroundImageUrl?: string;
  currentBackgroundPosition?: string;
  currentCardImageFit?: 'cover' | 'contain';
  // Promo
  currentPromoActive?: boolean;
  currentPromoImageUrl?: string;
  currentPromoLink?: string;
  currentPromoText?: string;
  vehicles: Vehicle[];
  onSaveSettings: (settings: AppSettings) => Promise<void>;
  onSaveNumbers: (numbers: string[]) => void;
  onSaveMapsUrl: (url: string) => void;
  onSaveBackgroundImageUrl: (url: string) => void;
  onSaveBackgroundPosition: (pos: string) => void;
  onSaveCardImageFit: (fit: 'cover' | 'contain') => void;
  // Promo
  onSavePromoActive: (active: boolean) => void;
  onSavePromoImage: (url: string) => void;
  onSavePromoLink: (url: string) => void;
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  onDeleteVehicle: (id: string) => void;
  onUpload: (vehicle: Vehicle) => Promise<void>;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  currentNumbers,
  currentMapsUrl,
  currentBackgroundImageUrl,
  currentBackgroundPosition,
  currentCardImageFit,
  // Promo Props
  currentPromoActive,
  currentPromoImageUrl,
  currentPromoLink,
  currentPromoText,
  vehicles,
  onSaveSettings,
  onSaveNumbers,
  onSaveMapsUrl,
  onSaveBackgroundImageUrl,
  onSaveBackgroundPosition,
  onSaveCardImageFit,
  onSavePromoActive,
  onSavePromoImage,
  onSavePromoLink,
  onUpdateVehicle,
  onDeleteVehicle,
  onUpload,
  onClose
}) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'inventory' | 'upload' | 'sold' | 'logs' | 'leads'>('whatsapp');
  const [numbers, setNumbers] = useState<string[]>(
    Array(10).fill('').map((_, i) => currentNumbers[i] || '')
  );
  const [mapsUrl, setMapsUrl] = useState(currentMapsUrl || '');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(currentBackgroundImageUrl || '');
  const [backgroundPos, setBackgroundPos] = useState(currentBackgroundPosition || '50% 50%');
  const [cardImageFit, setCardImageFit] = useState<'cover' | 'contain'>(currentCardImageFit || 'cover');

  // Promo State
  const [promoActive, setPromoActive] = useState(currentPromoActive || false);
  const [promoImageUrl, setPromoImageUrl] = useState(currentPromoImageUrl || '');
  const [promoLink, setPromoLink] = useState(currentPromoLink || '');
  const [promoText, setPromoText] = useState(currentPromoText || '');
  const [confirmSoldId, setConfirmSoldId] = useState<string | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null); // State para foto da entrega

  // States para Logs
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null); // State para o Modal de Detalhes

  // State para Leads (Newsletter)
  const [leads, setLeads] = useState<any[]>([]);

  // Fechar o painel automaticamente se o usuário não estiver logado (Logout)
  React.useEffect(() => {
    if (!user) {
      onClose();
    }
  }, [user, onClose]);

  // Sync numbers with props (Garante que os dados estejam sempre atualizados)
  useEffect(() => {
    setNumbers(Array(10).fill('').map((_, i) => currentNumbers[i] || ''));
  }, [currentNumbers]);

  const loadLogs = async () => {
    try {
      const [acc, aud] = await Promise.all([
        logger.getAccessLogs(),
        logger.getAuditLogs()
      ]);
      setAccessLogs(acc);
      setAuditLogs(aud);
    } catch (err) {
      console.error("Erro ao carregar logs", err);
    }
  };

  const loadLeads = async () => {
    try {
      console.log("🔄 Carregando leads... User:", user);
      const data = await db.getNewsletterSubscriptions();
      console.log("✅ Leads carregados:", data);
      setLeads(data);
    } catch (err) {
      console.error("❌ Erro ao carregar leads:", err);
    }
  };

  // Carregar logs quando mudar para a aba
  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    } else if (activeTab === 'leads') {
      loadLeads();
    }
  }, [activeTab]);

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Excluir este lead?")) return;
    try {
      await db.deleteNewsletterSubscription(id);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (e) { alert("Erro ao excluir lead."); }
  };

  const handleDeleteAuditLog = async (id: string) => {
    if (!confirm("Excluir este registro?")) return;
    try {
      await logger.deleteAuditLog(id);
      setAuditLogs(prev => prev.filter(l => l.id !== id));
    } catch (e) { alert("Erro ao excluir log."); }
  };

  const handleClearAuditLogs = async () => {
    if (!confirm("Tem certeza que deseja LIMPAR TODO o histórico de auditoria?")) return;
    try {
      await logger.clearAuditLogs();
      setAuditLogs([]);
    } catch (e) { alert("Erro ao limpar logs."); }
  };

  const handleDeleteAccessLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir modal
    if (!confirm("Excluir este registro de visita?")) return;
    try {
      await logger.deleteAccessLog(id);
      setAccessLogs(prev => prev.filter(l => l.id !== id));
    } catch (e) { alert("Erro ao excluir log."); }
  };

  const handleClearAccessLogs = async () => {
    if (!confirm("Tem certeza que deseja LIMPAR TODO o histórico de visitas?")) return;
    try {
      await logger.clearAccessLogs();
      setAccessLogs([]);
    } catch (e) { alert("Erro ao limpar logs."); }
  };

  const [newType, setNewType] = useState<VehicleType>(VehicleType.MOTO);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPlateLast3, setNewPlateLast3] = useState(''); // Estado para placa
  const [newYear, setNewYear] = useState('');
  const [newColor, setNewColor] = useState('');

  const [newKM, setNewKM] = useState('');
  const [newSpecs, setNewSpecs] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDisplacement, setNewDisplacement] = useState('');
  const [newTransmission, setNewTransmission] = useState('Automático');
  const [newFuel, setNewFuel] = useState('Gasolina');
  const [newImagePos, setNewImagePos] = useState('50% 50%');
  const [isSingleOwner, setIsSingleOwner] = useState(false);
  const [hasDut, setHasDut] = useState(false);
  const [hasManual, setHasManual] = useState(false);
  const [hasSpareKey, setHasSpareKey] = useState(false);
  const [hasRevisoes, setHasRevisoes] = useState(false); // Fix: State added
  const [isPromoSemana, setIsPromoSemana] = useState(false);
  const [isPromoMes, setIsPromoMes] = useState(false);
  const [isZeroKm, setIsZeroKm] = useState(false);
  const [isRepasse, setIsRepasse] = useState(false); // Novo state Repasse
  const [isFeatured, setIsFeatured] = useState(false);

  // Unified Media State
  const [currentImages, setCurrentImages] = useState<{ url: string; file?: File }[]>([]);
  const [currentVideos, setCurrentVideos] = useState<{ url: string; file?: File }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [fullEditingId, setFullEditingId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSpecs, setEditSpecs] = useState('');

  const formatCurrency = (value: string) => {
    const val = value.replace(/\D/g, '');
    return val ? parseInt(val).toLocaleString('pt-BR') : '';
  };

  // Mantemos fileToBase64 apenas para o Background Image das configurações
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    // Validation: Max 5MB per file
    const maxSize = 5 * 1024 * 1024; // 5MB limit aligned with Supabase
    const oversizedFile = files.find(f => f.size > maxSize);
    if (oversizedFile) {
      alert(`O arquivo "${oversizedFile.name}" é muito grande (Máx 5MB).`);
      return;
    }

    if (type === 'image') {
      if (currentImages.length + files.length > 6) {
        setUploadError("Máximo de 6 fotos permitido.");
        return;
      }
      const newItems = files.map(f => ({ url: URL.createObjectURL(f), file: f }));
      setCurrentImages(prev => [...prev, ...newItems]);
    } else {
      if (currentVideos.length + files.length > 3) {
        setUploadError("Máximo de 3 vídeos permitido.");
        return;
      }
      const newItems = files.map(f => ({ url: URL.createObjectURL(f), file: f }));
      setCurrentVideos(prev => [...prev, ...newItems]);
    }

    if (e.target) e.target.value = '';
    setUploadError(null);
  };

  const removeMedia = (index: number, type: 'image' | 'video') => {
    if (type === 'image') {
      setCurrentImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setCurrentVideos(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Função auxiliar para upload seguro
  const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('vehicle-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('vehicle-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || currentImages.length === 0 || !newPlateLast3) {
      setUploadError("Nome, Placa (Final) e Pelo menos 1 Foto são obrigatórios.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Images
      const uploadedImages: string[] = [];
      for (const item of currentImages) {
        if (item.file) {
          const url = await uploadFileToStorage(item.file);
          uploadedImages.push(url);
        } else {
          uploadedImages.push(item.url);
        }
      }

      // 2. Upload Videos
      const uploadedVideos: string[] = [];
      for (const item of currentVideos) {
        try {
          if (item.file) {
            const url = await uploadFileToStorage(item.file);
            uploadedVideos.push(url);
          } else {
            uploadedVideos.push(item.url);
          }
        } catch (err) {
          console.warn("Falha ao enviar vídeo, ignorando:", err);
        }
      }

      const kmValue = Number(newKM.replace(/\D/g, '')) || 0;
      let kmHighlight = "";
      if (kmValue < 1) kmHighlight = "KM 0";
      else if (kmValue >= 1 && kmValue <= 10) kmHighlight = "KM BAIXO";

      const parts = [
        newType === VehicleType.MOTO && newDisplacement && `${newDisplacement} CC`,
        newType === VehicleType.CARRO && `${newTransmission} | ${newFuel}`,
        newSpecs
      ].filter(Boolean);

      const vehicleData: Vehicle = {
        id: fullEditingId || uuidv4(),
        name: newName.toUpperCase(),
        price: isNaN(Number(newPrice.replace(/\D/g, ''))) && newPrice.length > 0 ? newPrice : Number(newPrice.replace(/\D/g, '')),
        type: newType,
        imageUrl: uploadedImages[0],
        images: uploadedImages,
        videoUrl: uploadedVideos.length > 0 ? uploadedVideos[0] : undefined,
        videos: uploadedVideos,
        isPromoSemana,
        isPromoMes,
        isZeroKm,
        isRepasse,
        isFeatured,
        specs: parts.join(" | "),
        km: kmValue,
        year: newYear,
        color: newColor.toUpperCase(),
        plate_last3: newPlateLast3,
        hasSpareKey,
        hasDut,
        hasManual,
        isSingleOwner,
        hasRevisoes: false,
        imagePosition: newImagePos,
        isSold: false
      };

      if (fullEditingId) {
        await onUpdateVehicle(fullEditingId, vehicleData);
        alert('Veículo atualizado com sucesso!');
      } else {
        await onUpload(vehicleData);
        alert('Veículo publicado com sucesso!');
      }

      // Log
      if (user?.email) {
        logger.logAction(user.email, fullEditingId ? 'EDITAR' : 'CRIAR', vehicleData.name, `Preço: ${vehicleData.price}`);
      }

      resetForm();
      setActiveTab('inventory');

    } catch (error: any) {
      console.error("Erro no processo:", error);
      alert(`Erro: ${error.message || 'Falha no upload/banco'}.`);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCurrentImages([]); setCurrentVideos([]);
    setNewName(''); setNewPrice(''); setNewKM(''); setNewYear(''); setNewColor('');
    setNewPlateLast3(''); setNewSpecs('');
    setNewImagePos('50% 50%');
    setIsFeatured(false); setIsPromoSemana(false);
    setIsPromoMes(false); setIsZeroKm(false); setIsRepasse(false);
    setIsSingleOwner(false); setHasDut(false); setHasManual(false); setHasSpareKey(false); setHasRevisoes(false);
    setNewType(VehicleType.MOTO);
    setNewDisplacement(''); setNewTransmission('Automático'); setNewFuel('Gasolina');
    setFullEditingId(null);
    setUploadError(null);
  };

  const openFullEdit = (v: Vehicle) => {
    try {
      console.log('Abrindo edição para:', v);
      setFullEditingId(v.id);
      setNewName(v.name);
      setNewPrice(v.price?.toString() || '');
      setNewType(v.type);
      setNewKM(v.km?.toString() || '');
      setNewYear(v.year || '');
      setNewColor(v.color || '');
      setNewPlateLast3(v.plate_last3 || '');
      setNewSpecs((v.specs || '').split('|').filter(s => {
        const u = s.trim().toUpperCase();
        return !u.startsWith('ANO:') && !u.startsWith('KM:') && !u.startsWith('COR:') && !u.startsWith('[KM') && !u.startsWith('SEMI NOVA') && !u.startsWith('ZERO KM');
      }).join(' | '));

      setNewDisplacement(v.displacement || '');
      setNewTransmission(v.transmission || 'Automático');
      setNewFuel(v.fuel || 'Gasolina');
      setNewImagePos(v.imagePosition || '50% 50%');

      setIsSingleOwner(v.isSingleOwner || false);
      setHasDut(v.hasDut || false);
      setHasManual(v.hasManual || false);
      setHasSpareKey(v.hasSpareKey || false);
      setHasRevisoes(v.hasRevisoes || false);
      setIsPromoSemana(v.isPromoSemana || false);
      setIsPromoMes(v.isPromoMes || false);
      setIsZeroKm(v.isZeroKm || false);
      setIsRepasse(v.isRepasse || false);
      setIsFeatured(v.isFeatured || false);

      const imgs = (v.images && v.images.length > 0) ? v.images : (v.imageUrl ? [v.imageUrl] : []);
      setCurrentImages(imgs.map(url => ({ url })));

      const vids = (v.videos && v.videos.length > 0) ? v.videos : (v.videoUrl ? [v.videoUrl] : []);
      setCurrentVideos(vids.map(url => ({ url })));

      setActiveTab('upload');
    } catch (error: any) {
      console.error("Erro ao abrir edição:", error);
      alert(`Erro ao tentar editar: ${error.message}`);
    }
  };

  const startEditing = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setEditName(vehicle.name);
    setEditPrice(typeof vehicle.price === 'number' ? vehicle.price.toLocaleString('pt-BR') : vehicle.price.toString());
    setEditSpecs(vehicle.specs || '');
  };

  const saveInlineEdit = (id: string) => {
    const formattedPrice = isNaN(Number(editPrice.replace(/\D/g, ''))) && editPrice.length > 0
      ? editPrice
      : Number(editPrice.replace(/\D/g, ''));
    onUpdateVehicle(id, { name: editName.toUpperCase(), price: formattedPrice, specs: editSpecs });

    // Log Update
    if (user?.email) {
      logger.logAction(user.email, 'EDITAR', editName.toUpperCase(), `Atualização rápida: Preço ${formattedPrice}`);
    }

    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md">
      <div className="w-full h-full bg-surface p-6 sm:p-8 flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="font-heading text-gold text-2xl sm:text-3xl tracking-wider leading-none uppercase">Painel ADM</h2>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold mt-2 ml-1">Sistema de Gestão Rei das Motos</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:bg-gold hover:text-black hover:rotate-90 transition-all duration-300">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 shrink-0 no-scrollbar">
          {[
            { id: 'whatsapp', icon: 'settings', label: 'Configurações' },
            { id: 'inventory', icon: 'garage_home', label: 'Estoque' },
            { id: 'upload', icon: 'add_circle', label: 'Novo Veículo' },
            { id: 'sold', icon: 'sell', label: 'Vendidos' },
            { id: 'leads', icon: 'contact_phone', label: 'Leads WhatsApp' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gold text-black shadow-lg shadow-gold/20'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}

          {/* Botão Secreto de Monitoramento */}
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-4 rounded-2xl transition-all hover:bg-white/10 ${activeTab === 'logs' ? 'text-white bg-white/10' : 'text-white/5'}`}
            title="Monitoramento"
          >
            <span className="material-symbols-outlined text-lg">visibility_off</span>
          </button>

          <button onClick={signOut} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all ml-auto whitespace-nowrap">
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Sair</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

          {activeTab === 'whatsapp' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-8">
                <div>
                  <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">location_on</span> Localização da Loja
                  </h3>
                  <input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-xs px-6 py-4 rounded-2xl focus:border-gold outline-none" placeholder="Link Google Maps..." />
                </div>

                <div>
                  <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">wallpaper</span> Plano de Fundo (Home)
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="bg-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await fileToBase64(file);
                              setBackgroundImageUrl(base64);
                            } catch (err) {
                              alert("Erro ao processar imagem");
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="bg-upload"
                        className="w-full flex items-center justify-center gap-2 bg-surface-light border border-white/5 text-white text-xs px-6 py-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group"
                      >
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">upload_file</span>
                        {backgroundImageUrl ? 'Trocar Imagem' : 'Carregar do Dispositivo'}
                      </label>
                    </div>

                    {backgroundImageUrl && (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 group bg-black/50">
                          <img
                            src={backgroundImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover opacity-80 transition-all"
                            style={{ objectPosition: backgroundPos }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-white/50 bg-black/50 px-3 py-1 rounded-full uppercase tracking-widest">Preview</span>
                          </div>
                          <button
                            onClick={() => setBackgroundImageUrl('')}
                            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="Remover Imagem"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] text-gold uppercase font-bold tracking-widest mb-1 block">Posição Horizontal</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={parseInt(backgroundPos.split(' ')[0])}
                              onChange={(e) => setBackgroundPos(`${e.target.value}% ${backgroundPos.split(' ')[1]}`)}
                              className="w-full accent-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-right text-[9px] text-white/50 mt-1">{backgroundPos.split(' ')[0]}</div>
                          </div>
                          <div>
                            <label className="text-[9px] text-gold uppercase font-bold tracking-widest mb-1 block">Posição Vertical</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={parseInt(backgroundPos.split(' ')[1])}
                              onChange={(e) => setBackgroundPos(`${backgroundPos.split(' ')[0]} ${e.target.value}%`)}
                              className="w-full accent-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-right text-[9px] text-white/50 mt-1">{backgroundPos.split(' ')[1]}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">image</span> Estilo das Fotos nos Cards
                  </h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCardImageFit('cover')}
                      className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${cardImageFit === 'cover' ? 'bg-gold text-black border-gold' : 'bg-surface/5 text-white border-white/10 hover:border-gold/50'}`}
                    >
                      <span className="material-symbols-outlined">crop</span>
                      <div className="text-left">
                        <div className="text-[10px] font-bold uppercase">Preencher (Padrão)</div>
                        <div className="text-[8px] opacity-70">Corta bordas para alinhar</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setCardImageFit('contain')}
                      className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${cardImageFit === 'contain' ? 'bg-gold text-black border-gold' : 'bg-surface/5 text-white border-white/10 hover:border-gold/50'}`}
                    >
                      <span className="material-symbols-outlined">aspect_ratio</span>
                      <div className="text-left">
                        <div className="text-[10px] font-bold uppercase">Foto Completa</div>
                        <div className="text-[8px] opacity-70">Sem cortes, pode sobrar fundo</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">campaign</span> Pop-up Promocional
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                      <input
                        type="checkbox"
                        id="promoActive"
                        checked={promoActive}
                        onChange={(e) => setPromoActive(e.target.checked)}
                        className="accent-gold w-5 h-5 cursor-pointer"
                      />
                      <label htmlFor="promoActive" className="flex-1 cursor-pointer">
                        <span className="block text-xs font-bold text-white uppercase tracking-wide">Ativar Promoção</span>
                        <span className="block text-[9px] text-white/50">Exibir pop-up ao entrar no site</span>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] text-white/50 uppercase font-bold tracking-widest ml-1">Imagem da Promoção (URL)</label>
                      <div className="flex gap-2">
                        <input
                          value={promoImageUrl}
                          onChange={(e) => setPromoImageUrl(e.target.value)}
                          className="flex-1 bg-surface-light border border-white/5 text-white text-xs px-4 py-3 rounded-xl focus:border-gold outline-none"
                          placeholder="https://..."
                        />
                        <input
                          type="file"
                          className="hidden"
                          id="promo-upload"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await uploadFileToStorage(file);
                                setPromoImageUrl(url);
                              } catch (err) { alert("Erro ao enviar imagem (Storage): " + err); }
                            }
                          }}
                        />
                        <label htmlFor="promo-upload" className="px-4 py-2 bg-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/20 text-white/70">
                          <span className="material-symbols-outlined">upload</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] text-white/50 uppercase font-bold tracking-widest ml-1">Link de Ação (Opcional)</label>
                      <input
                        value={promoLink}
                        onChange={(e) => setPromoLink(e.target.value)}
                        className="w-full bg-surface-light border border-white/5 text-white text-xs px-4 py-3 rounded-xl focus:border-gold outline-none"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] text-white/50 uppercase font-bold tracking-widest ml-1">Texto do Botão</label>
                      <input
                        value={promoText}
                        onChange={(e) => setPromoText(e.target.value)}
                        className="w-full bg-surface-light border border-white/5 text-white text-xs px-4 py-3 rounded-xl focus:border-gold outline-none"
                        placeholder="Ex: VER OFERTA"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">call</span> WhatsApps de Atendimento
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {numbers.map((n, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest ml-1">Atendente {i + 1}</label>
                        <div className="relative flex items-center gap-2">
                          {/* Toggle Ativo/Inativo */}
                          <div className="flex flex-col items-center">
                            <button
                              onClick={() => {
                                const next = [...numbers];
                                const current = next[i];
                                if (current.startsWith('OFF:')) {
                                  next[i] = current.replace('OFF:', '');
                                } else {
                                  next[i] = `OFF:${current}`;
                                }
                                setNumbers(next);
                              }}
                              className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${!n.startsWith('OFF:') ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                              title={!n.startsWith('OFF:') ? 'Número Ativo' : 'Número Inativo'}
                            >
                              <div className={`w-4 h-4 rounded-full shadow-md transition-transform ${!n.startsWith('OFF:') ? 'bg-green-500 translate-x-4' : 'bg-red-500 translate-x-0'}`} />
                            </button>
                            <span className="text-[8px] mt-1 font-bold text-white/30 uppercase">{!n.startsWith('OFF:') ? 'Ativo' : 'Inativo'}</span>
                          </div>

                          <div className="relative flex-1">
                            <input
                              value={n.replace('OFF:', '')}
                              onChange={(e) => {
                                const next = [...numbers];
                                const isOff = next[i].startsWith('OFF:');
                                const cleanVal = e.target.value.replace(/\D/g, '');
                                next[i] = isOff ? `OFF:${cleanVal}` : cleanVal;
                                setNumbers(next);
                              }}
                              className={`w-full bg-surface-light border text-white text-xs px-4 py-4 rounded-xl outline-none focus:border-gold ${n.replace('OFF:', '').length === 13 ? 'border-green-500/50' : 'border-white/5'} ${n.startsWith('OFF:') ? 'opacity-50' : ''}`}
                              placeholder="Ex: 5598988887777"
                              disabled={n.startsWith('OFF:')}
                            />
                            {n.replace('OFF:', '').length > 0 && (
                              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold ${n.replace('OFF:', '').length >= 12 ? 'text-green-500' : 'text-red-500'}`}>
                                {n.replace('OFF:', '').length} dígitos
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await onSaveSettings({
                      whatsappNumbers: numbers.filter(n => n.trim() !== ''),
                      googleMapsUrl: mapsUrl,
                      backgroundImageUrl: backgroundImageUrl,
                      backgroundPosition: backgroundPos,
                      cardImageFit: cardImageFit,
                      promoActive: promoActive,
                      promoImageUrl: promoImageUrl,
                      promoLink: promoLink,
                      promoText: promoText
                    });
                    alert('Configurações salvas com sucesso!');
                  } catch (error) {
                    console.error("Erro ao salvar:", error);
                    alert("Erro ao salvar configurações.");
                  }
                }}
                className="w-full py-5 bg-gold text-black font-heading text-[11px] tracking-[0.3em] rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all"
              >
                SALVAR TUDO
              </button>
            </div>
          )}

          {
            activeTab === 'upload' && (
              <form onSubmit={handleSaveVehicle} className="space-y-8 animate-in fade-in duration-300 pb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-gold text-sm font-bold uppercase tracking-widest">
                    {fullEditingId ? '✏️ Editando Veículo' : '✨ Novo Cadastro'}
                  </h3>
                  {fullEditingId && (
                    <button type="button" onClick={resetForm} className="text-xs text-red-400 hover:text-red-300 underline uppercase tracking-wider">
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="flex p-1.5 bg-white/5 rounded-full border border-white/5">
                  <button type="button" onClick={() => setNewType(VehicleType.MOTO)} className={`flex-1 py-4 rounded-full flex items-center justify-center gap-3 transition-all ${newType === VehicleType.MOTO ? 'bg-gold text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>
                    <span className="material-symbols-outlined">motorcycle</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest">MOTO</span>
                  </button>
                  <button type="button" onClick={() => setNewType(VehicleType.CARRO)} className={`flex-1 py-4 rounded-full flex items-center justify-center gap-3 transition-all ${newType === VehicleType.CARRO ? 'bg-gold text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>
                    <span className="material-symbols-outlined">directions_car</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest">CARRO</span>
                  </button>
                </div>

                {/* Checkbox 0 KM & Repasse */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 flex items-center gap-3 p-4 bg-gold/10 border border-gold/20 rounded-2xl">
                    <input
                      type="checkbox"
                      id="isZeroKm"
                      checked={isZeroKm}
                      onChange={(e) => {
                        setIsZeroKm(e.target.checked);
                        if (e.target.checked) setNewKM('0');
                      }}
                      className="w-5 h-5 rounded border-gold/30 text-gold focus:ring-gold"
                    />
                    <label htmlFor="isZeroKm" className="text-sm font-bold text-gold uppercase tracking-wider cursor-pointer">
                      ✨ Veículo 0 KM
                    </label>
                  </div>

                  <div className="flex-1 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <input
                      type="checkbox"
                      id="isRepasse"
                      checked={isRepasse}
                      onChange={(e) => setIsRepasse(e.target.checked)}
                      className="w-5 h-5 rounded border-red-500/30 text-red-500 focus:ring-red-500"
                    />
                    <label htmlFor="isRepasse" className="text-sm font-bold text-red-500 uppercase tracking-wider cursor-pointer">
                      ⚠️ Repasse
                    </label>
                  </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] text-gold font-bold uppercase tracking-widest mb-4">Fotos do Veículo (Máx 6)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                        {currentImages.map((item, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10 group">
                            <img src={item.url} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeMedia(i, 'image')} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full"><span className="material-symbols-outlined text-[14px]">close</span></button>
                            {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-gold/90 text-black text-[7px] font-bold text-center py-0.5 uppercase">Capa</div>}
                          </div>
                        ))}
                        {currentImages.length < 6 && (
                          <button type="button" disabled={isUploading} onClick={() => imageInputRef.current?.click()} className={`aspect-square bg-surface-light border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'text-white/20 hover:border-gold hover:text-gold'}`}>
                            {isUploading ? <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined">add_a_photo</span>}
                          </button>
                        )}
                      </div>
                      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'image')} />
                    </div>

                    {currentImages.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                        <label className="text-[9px] text-gold uppercase font-bold tracking-widest mb-3 block">Ajustar Posição da Foto Principal (Capa)</label>
                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 rounded-lg overflow-hidden relative border border-white/20">
                            <img src={currentImages[0].url} className="w-full h-full object-cover" style={{ objectPosition: newImagePos }} />
                          </div>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-[8px] text-white/50 uppercase">Horizontal</span>
                                <span className="text-[8px] text-white/50">{newImagePos.split(' ')[0]}</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={parseInt(newImagePos.split(' ')[0])}
                                onChange={(e) => setNewImagePos(`${e.target.value}% ${newImagePos.split(' ')[1]}`)}
                                className="w-full accent-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-[8px] text-white/50 uppercase">Vertical</span>
                                <span className="text-[8px] text-white/50">{newImagePos.split(' ')[1]}</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={parseInt(newImagePos.split(' ')[1])}
                                onChange={(e) => setNewImagePos(`${newImagePos.split(' ')[0]} ${e.target.value}%`)}
                                className="w-full accent-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-[10px] text-gold font-bold uppercase tracking-widest mb-4">Vídeos (Opcional - Máx 3)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {currentVideos.map((item, i) => (
                          <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                            <video src={item.url} className="w-full h-full object-cover" muted />
                            <button type="button" onClick={() => removeMedia(i, 'video')} className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full"><span className="material-symbols-outlined">close</span></button>
                          </div>
                        ))}
                        {currentVideos.length < 3 && (
                          <button type="button" disabled={isUploading} onClick={() => videoInputRef.current?.click()} className={`aspect-video bg-surface-light border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'text-white/20 hover:border-gold hover:text-gold'}`}>
                            {isUploading ? <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined">videocam</span>}
                          </button>
                        )}
                      </div>
                      <input type="file" ref={videoInputRef} className="hidden" accept="video/*" multiple onChange={(e) => handleFileChange(e, 'video')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[8px] text-white/40 uppercase font-bold tracking-widest mb-2 ml-1">Modelo Comercial</label>
                      <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-xs px-5 py-4 rounded-xl focus:border-gold outline-none uppercase" placeholder="Ex: BMW S1000RR M PACK" />
                    </div>
                    <div>
                      <label className="block text-[8px] text-white/40 uppercase font-bold tracking-widest mb-2 ml-1">KM Atual</label>
                      <input value={newKM} onChange={e => setNewKM(e.target.value)} disabled={isZeroKm} className={`w-full bg-surface-light border border-white/5 text-white text-xs px-5 py-4 rounded-xl focus:border-gold outline-none ${isZeroKm ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder={isZeroKm ? "0 KM" : "Ex: 500"} />
                    </div>
                    <div>
                      <label className="block text-[8px] text-white/40 uppercase font-bold tracking-widest mb-2 ml-1">Preço (R$)</label>
                      <input
                        value={newPrice}
                        onChange={e => setNewPrice(formatCurrency(e.target.value))}
                        className="w-full bg-surface-light border border-white/5 text-white text-xs px-5 py-4 rounded-xl focus:border-gold outline-none"
                        placeholder="125.000"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-white/40 uppercase font-bold tracking-widest mb-2 ml-1">Ano / Modelo</label>
                      <input value={newYear} onChange={e => setNewYear(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-xs px-5 py-4 rounded-xl focus:border-gold outline-none" placeholder="2024" />
                    </div>
                    <div>
                      <label className="block text-[8px] text-white/40 uppercase font-bold tracking-widest mb-2 ml-1">Cor</label>
                      <input value={newColor} onChange={e => setNewColor(e.target.value.toUpperCase())} className="w-full bg-surface-light border border-white/5 text-white text-xs px-5 py-4 rounded-xl focus:border-gold outline-none" placeholder="Ex: PRETO" />
                    </div>
                    <div>

                      {newType === VehicleType.MOTO ? (
                        <div>
                          <label className="block text-[8px] text-white/40 uppercase font-bold tracking-widest mb-2 ml-1">Cilindradas (CC)</label>
                          <input value={newDisplacement} onChange={e => setNewDisplacement(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-xs px-5 py-4 rounded-xl focus:border-gold outline-none" placeholder="1000" />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-[8px] text-white/40 uppercase font-bold tracking-widest mb-2 ml-1">Câmbio</label>
                            <select value={newTransmission} onChange={e => setNewTransmission(e.target.value)} className="w-full bg-surface-light border border-white/5 text-white text-xs px-5 py-4 rounded-xl focus:border-gold outline-none">
                              <option value="Automático">Automático</option>
                              <option value="Manual">Manual</option>
                            </select>
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-[8px] text-white/40 uppercase font-bold tracking-widest mb-2 ml-1">PLACA (Final 3 Dígitos) *</label>
                        <input
                          value={newPlateLast3}
                          onChange={(e) => setNewPlateLast3(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase())}
                          className={`w-full bg-surface-light border ${!newPlateLast3 ? 'border-red-500/30' : 'border-white/5'} text-white text-xs px-5 py-4 rounded-xl focus:border-gold outline-none font-mono tracking-widest text-center uppercase`}
                          placeholder="ABC"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
                    {[
                      { label: 'Único Dono', state: isSingleOwner, set: setIsSingleOwner, tooltip: 'Apenas um proprietário.' },
                      { label: 'DUT', state: hasDut, set: setHasDut, tooltip: 'Documentação pronta.' },
                      { label: 'Manual', state: hasManual, set: setHasManual, tooltip: 'Acompanha manual.' },
                      { label: 'Chave Reserva', state: hasSpareKey, set: setHasSpareKey, tooltip: 'Possui chave reserva.' },
                      { label: 'Promoção', state: isPromoSemana, set: setIsPromoSemana, tooltip: 'Marcar com tag de promoção.' },
                      { label: 'Destaque', state: isFeatured, set: setIsFeatured, tooltip: 'Exibir no topo ou carrossel.' },
                    ].map(item => (
                      <div key={item.label} className="relative flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:border-gold/30 transition-all group/tooltip">
                        <input type="checkbox" id={`check-${item.label}`} checked={item.state} onChange={e => item.set(e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
                        <label htmlFor={`check-${item.label}`} className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer">
                          <span className="text-[10px] text-white/60 uppercase font-bold tracking-widest truncate">{item.label}</span>
                        </label>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-black/95 border border-gold/20 rounded-2xl text-[9px] text-white/70 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                          {item.tooltip}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  {fullEditingId && (
                    <button type="button" onClick={resetForm} className="flex-1 py-6 bg-white/5 text-white text-[13px] font-heading tracking-[0.3em] rounded-full hover:bg-white/10 transition-all">
                      CANCELAR
                    </button>
                  )}
                  <button type="submit" disabled={isUploading} className={`flex-1 py-6 bg-gold text-black text-[13px] font-heading tracking-[0.3em] rounded-full shadow-2xl transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gold-light active:scale-[0.98]'}`}>
                    {isUploading ? 'PROCESSANDO...' : fullEditingId ? 'ATUALIZAR VEÍCULO' : 'PUBLICAR NO CATÁLOGO'}
                  </button>
                </div>
              </form>
            )
          }

          {
            activeTab === 'inventory' && (
              <div className="space-y-4 pb-10">
                {/* DASHBOARD DE ESTATÍSTICAS (Estoque Real) */}
                {(() => {
                  const activeVehicles = vehicles.filter(v => !v.isSold);
                  const totalStock = activeVehicles.length;
                  const modelCounts = activeVehicles.reduce((acc, vehicle) => {
                    const model = vehicle.name.toUpperCase().trim();
                    acc[model] = (acc[model] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const sortedModels = Object.entries(modelCounts).sort(([, a], [, b]) => b - a);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in slide-in-from-top-4 duration-500">
                      {/* Card Total */}
                      <div className="bg-gradient-to-br from-gold/20 to-black/50 p-6 rounded-3xl border border-gold/20 flex flex-col justify-center items-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <span className="material-symbols-outlined text-6xl text-gold">two_wheeler</span>
                        </div>
                        <h3 className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-2 z-10">Total em Estoque</h3>
                        <div className="text-5xl font-heading text-white tracking-tighter z-10">{totalStock}</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-widest mt-2 z-10">{totalStock === 1 ? 'Veículo Disponível' : 'Veículos Disponíveis'}</div>
                      </div>

                      {/* Lista de Modelos */}
                      <div className="md:col-span-2 bg-white/5 p-5 rounded-3xl border border-white/5 h-[160px] flex flex-col">
                        <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 shrink-0">
                          <span className="material-symbols-outlined text-sm">list</span> Contagem por Modelo
                        </h3>
                        <div className="overflow-y-auto custom-scrollbar pr-2 space-y-2 flex-1">
                          {sortedModels.map(([model, count]) => (
                            <div key={model} className="flex justify-between items-center p-2 rounded-lg bg-black/20 hover:bg-white/5 transition-colors border border-white/5">
                              <span className="text-[10px] font-bold text-white uppercase truncate max-w-[70%]">{model}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-white/30 uppercase hidden sm:block">unidades</span>
                                <span className="text-[11px] font-heading text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20 min-w-[24px] text-center">{count}</span>
                              </div>
                            </div>
                          ))}
                          {sortedModels.length === 0 && (
                            <div className="text-center text-[10px] text-white/20 py-8 italic">Nenhum modelo cadastrado</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {vehicles.filter(v => !v.isSold).map(v => (
                  <div key={v.id} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-start gap-4 group hover:border-white/20 transition-all">
                    <img src={v.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/5 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      {editingId === v.id ? (
                        <div className="flex flex-col gap-2">
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-surface-light border border-gold/50 text-white text-[11px] px-3 py-1.5 rounded-lg focus:outline-none uppercase font-heading tracking-wider" />
                          <input
                            value={editPrice}
                            onChange={(e) => setEditPrice(formatCurrency(e.target.value))}
                            className="w-full bg-surface-light border border-gold/50 text-gold text-[10px] px-3 py-1.5 rounded-lg focus:outline-none font-bold"
                          />
                          <input value={editSpecs} onChange={e => setEditSpecs(e.target.value)} className="w-full bg-surface-light border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-lg focus:outline-none" placeholder="Specs" />
                        </div>
                      ) : (
                        <div className="cursor-pointer group/info" onClick={() => openFullEdit(v)}>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white text-xs font-heading tracking-wider truncate uppercase group-hover/info:text-gold transition-colors">{v.name}</h4>
                            {v.plate_last3 && <span className="text-[8px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded font-mono border border-white/5">{v.plate_last3}</span>}
                            {v.isFeatured && <span className="text-[8px] bg-gold text-black px-1.5 rounded font-bold uppercase">Destaque</span>}
                          </div>
                          <p className="text-gold text-[10px] font-bold">R$ {typeof v.price === 'number' ? v.price.toLocaleString('pt-BR') : v.price}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
                      {editingId === v.id ? (
                        <>
                          <button onClick={() => saveInlineEdit(v.id)} className="w-10 h-10 flex items-center justify-center bg-gold text-black rounded-full shadow-lg hover:scale-110 transition-all"><span className="material-symbols-outlined text-xl">check</span></button>
                          <button onClick={() => setEditingId(null)} className="w-10 h-10 flex items-center justify-center bg-white/10 text-white/50 rounded-full hover:bg-white/20 transition-all"><span className="material-symbols-outlined text-xl">close</span></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openFullEdit(v)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-blue-400 hover:bg-blue-400/20 transition-all" title="Editar Completo">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => {
                            onUpdateVehicle(v.id, { isFeatured: !v.isFeatured });
                            if (user?.email) logger.logAction(user.email, 'EDITAR', v.name, v.isFeatured ? 'Removeu Destaque' : 'Destacou');
                          }} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${v.isFeatured ? 'bg-gold/20 text-gold' : 'bg-white/5 text-white/20 hover:text-gold hover:bg-gold/10'}`} title={v.isFeatured ? "Remover Destaque" : "Destacar Veículo"}>
                            <span className="material-symbols-outlined text-[18px]">star</span>
                          </button>
                          <button onClick={() => {
                            onUpdateVehicle(v.id, { isPromoSemana: !v.isPromoSemana });
                            if (user?.email) logger.logAction(user.email, 'EDITAR', v.name, v.isPromoSemana ? 'Removeu Promoção' : 'Colocou em Promoção');
                          }} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${v.isPromoSemana ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10'}`} title={v.isPromoSemana ? "Remover Promoção" : "Colocar em Promoção"}>
                            <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                          </button>
                          <button onClick={() => setConfirmSoldId(v.id)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${v.isSold ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-yellow-500 hover:bg-yellow-500/20'}`} title={v.isSold ? "Marcar como Disponível" : "Marcar como Vendido"}>
                            <span className="material-symbols-outlined text-[18px]">{v.isSold ? 'check_circle' : 'sell'}</span>
                          </button>
                          <button onClick={() => onDeleteVehicle(v.id)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-red-500 hover:bg-red-500/20 transition-all" title="Excluir">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {vehicles.filter(v => !v.isSold).length === 0 && (
                  <div className="text-center py-12 text-white/20 text-xs font-bold uppercase tracking-widest bg-black/20 rounded-xl">
                    Nenhum veículo em estoque
                  </div>
                )}
              </div>
            )
          }

          {
            activeTab === 'sold' && (
              <div className="space-y-4 pb-10">
                {vehicles.filter(v => v.isSold).map(v => (
                  <div key={v.id} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-start gap-4 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">
                    <img src={v.imageUrl} className="w-16 h-16 rounded-2xl object-cover border border-white/5 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white/50 text-xs font-heading tracking-wider truncate uppercase line-through">{v.name}</h4>
                      <span className="text-[9px] text-green-500/80 uppercase font-bold tracking-wider block mt-1">VENDIDO</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
                      <button onClick={() => setConfirmSoldId(v.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/20 text-green-500 transition-all" title="Marcar como Disponível">
                        <span className="material-symbols-outlined text-[18px]">undo</span>
                      </button>
                      <button onClick={() => onDeleteVehicle(v.id)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-red-500 hover:bg-red-500/20 transition-all" title="Excluir do Histórico">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {vehicles.filter(v => v.isSold).length === 0 && (
                  <div className="text-center py-12 text-white/20 text-xs font-bold uppercase tracking-widest bg-black/20 rounded-xl">
                    Nenhum veículo vendido
                  </div>
                )}
              </div>
            )
          }

          {
            activeTab === 'leads' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">contact_phone</span> Leads (Inscritos WhatsApp)
                    </h3>
                    <div className="text-[10px] text-white/50 bg-white/10 px-3 py-1 rounded-full font-bold">
                      Total: {leads.length}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-black/20 text-[9px] uppercase tracking-widest text-white/50 font-bold border-b border-white/5">
                        <tr>
                          <th className="p-4">Data</th>
                          <th className="p-4">Nome</th>
                          <th className="p-4">WhatsApp</th>
                          <th className="p-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-white/70">
                        {leads.map(lead => (
                          <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 whitespace-nowrap opacity-60">
                              {lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '-'}
                            </td>
                            <td className="p-4 font-bold text-white uppercase">{lead.name || '-'}</td>
                            <td className="p-4 font-mono text-green-400">
                              <a href={`https://wa.me/55${lead.email?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                                {lead.email} <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                              </a>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-full text-white/20 hover:text-red-500 hover:bg-white/10 transition-all"
                                title="Excluir Lead"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {leads.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-white/20">Nenhum lead cadastrado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab === 'logs' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Seção de Auditoria (Admin Actions) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <h3 className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">security</span> Auditoria (Suas Ações)
                    </h3>
                    <button
                      onClick={handleClearAuditLogs}
                      className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete_sweep</span> Limpar Tudo
                    </button>
                  </div>
                  <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-black/20 text-[9px] uppercase tracking-widest text-white/50 font-bold border-b border-white/5">
                        <tr>
                          <th className="p-4">Data</th>
                          <th className="p-4">Ação</th>
                          <th className="p-4">Alvo</th>
                          <th className="p-4 hidden sm:table-cell">Detalhes</th>
                          <th className="p-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-white/70">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 whitespace-nowrap opacity-60">
                              {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : '-'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${log.action_type === 'CRIAR' ? 'bg-green-500/20 text-green-400' :
                                log.action_type === 'EXCLUIR' ? 'bg-red-500/20 text-red-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                {log.action_type}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-white max-w-[150px] truncate" title={log.target}>{log.target}</td>
                            <td className="p-4 hidden sm:table-cell opacity-60 truncate max-w-[200px]" title={log.details}>{log.details}</td>
                            <td className="p-4">
                              <button
                                onClick={() => log.id && handleDeleteAuditLog(log.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-full text-white/20 hover:text-red-500 hover:bg-white/10 transition-all"
                                title="Excluir Registro"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-white/20">Nenhuma ação registrada.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Seção de Acessos (Visitas) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">public</span> Visitas Recentes
                    </h3>
                    <button
                      onClick={handleClearAccessLogs}
                      className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete_sweep</span> Limpar Tudo
                    </button>
                  </div>
                  <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-black/20 text-[9px] uppercase tracking-widest text-white/50 font-bold border-b border-white/5">
                        <tr>
                          <th className="p-4">Data</th>
                          <th className="p-4">Local</th>
                          <th className="p-4">Dispositivo</th>
                          <th className="p-4 hidden sm:table-cell">IP</th>
                          <th className="p-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-white/70">
                        {accessLogs.map(log => {
                          // Tentar parsear o JSON para a visualização resumida
                          let deviceInfo = log.device_info;
                          let isp = '';
                          try {
                            const details = JSON.parse(log.device_info);
                            deviceInfo = `${details.platform} - ${details.browser || 'Navegador'} (${details.screen})`;
                            isp = details.isp;
                          } catch (e) {
                            // Fallback se for texto antigo
                          }

                          return (
                            <tr
                              key={log.id}
                              onClick={() => setSelectedLog(log)}
                              className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                              title="Clique para ver detalhes completos"
                            >
                              <td className="p-4 whitespace-nowrap opacity-60 group-hover:opacity-100 group-hover:text-gold transition-all">
                                {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : '-'}
                              </td>
                              <td className="p-4 font-bold text-white">
                                {log.location}
                                <div className="text-[8px] opacity-40 font-normal">{isp}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm opacity-50">
                                    {log.device_type === 'Mobile' ? 'smartphone' : 'computer'}
                                  </span>
                                  <span>{log.device_type}</span>
                                </div>
                                <div className="text-[8px] opacity-40 hidden sm:block truncate max-w-[150px]">{deviceInfo}</div>
                              </td>
                              <td className="p-4 hidden sm:table-cell font-mono opacity-50 group-hover:text-white transition-all">{log.ip}</td>
                              <td className="p-4">
                                <button
                                  onClick={(e) => log.id && handleDeleteAccessLog(log.id, e)}
                                  className="w-6 h-6 flex items-center justify-center rounded-full text-white/20 hover:text-red-500 hover:bg-white/10 transition-all"
                                  title="Excluir Registro"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {accessLogs.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-white/20">Nenhum acesso registrado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          }

          {/* Modal de Detalhes de Log */}
          {selectedLog && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
              <div className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedLog(null)} className="absolute top-4 right-4 text-white/30 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>

                <h3 className="text-gold font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">fingerprint</span> Detalhes do Acesso
                </h3>

                <div className="space-y-4 text-sm text-white/80">
                  <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] uppercase text-white/30 block">IP</span>
                      <span className="font-mono text-gold">{selectedLog.ip}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-white/30 block">Data</span>
                      <span>{selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString('pt-BR') : '-'}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl space-y-3">
                    <div>
                      <span className="text-[10px] uppercase text-white/30 block mb-1">Localização</span>
                      <div className="text-lg">{selectedLog.location}</div>
                    </div>

                    <hr className="border-white/5" />

                    <div>
                      <span className="text-[10px] uppercase text-white/30 block mb-1">Dados Técnicos</span>
                      <pre className="text-[10px] font-mono bg-black/50 p-2 rounded-lg overflow-x-auto text-green-400/80">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(selectedLog.device_info), null, 2);
                          } catch (e) {
                            return selectedLog.device_info;
                          }
                        })()}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {confirmSoldId && (() => {
            const vToConfirm = vehicles.find(v => v.id === confirmSoldId);
            const isMarkingAsSold = vToConfirm && !vToConfirm.isSold;

            return (
              <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-8">
                <div className="bg-surface border border-white/10 p-10 rounded-[2.5rem] max-w-sm w-full text-center space-y-8 shadow-3xl">
                  <span className="material-symbols-outlined text-red-500 text-5xl">shopping_cart_checkout</span>
                  <h3 className="text-white font-heading text-xl uppercase tracking-wider">Confirmar Alteração</h3>
                  <p className="text-white/50 text-xs">
                    {!isMarkingAsSold
                      ? "Deseja marcar este veículo como DISPONÍVEL novamente?"
                      : "Deseja marcar este veículo como VENDIDO? Ele sairá da vitrine principal."}
                  </p>

                  {/* Se estiver marcando como vendido, mostrar upload */}
                  {isMarkingAsSold && (
                    <div className="text-left bg-white/5 p-6 rounded-2xl border border-dashed border-white/20 hover:bg-white/10 transition-colors group">
                      <label className="text-[10px] text-gold uppercase font-bold tracking-widest mb-3 block text-center">
                        📸 Foto da Entrega (Opcional)
                      </label>
                      <input
                        type="file"
                        id="sales-photo-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setDeliveryPhoto(file);
                        }}
                      />
                      <label
                        htmlFor="sales-photo-upload"
                        className={`flex flex-col items-center justify-center gap-3 cursor-pointer p-4 rounded-xl transition-all ${deliveryPhoto ? 'bg-green-500/10 border border-green-500/50' : 'bg-black/30 border border-white/10 hover:border-gold/50'}`}
                      >
                        {deliveryPhoto ? (
                          <>
                            <div className="w-24 h-24 rounded-lg overflow-hidden shadow-lg border border-white/20">
                              <img src={URL.createObjectURL(deliveryPhoto)} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest bg-green-900/30 px-3 py-1 rounded-full">
                              Foto Selecionada
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/50 group-hover:text-gold group-hover:scale-110 transition-all">
                              <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                            </div>
                            <span className="text-[10px] text-white/50 group-hover:text-white uppercase font-bold text-center">
                              Clique para adicionar foto
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={async () => {
                        if (vToConfirm) {
                          let salesUrl = vToConfirm.salesPhotoUrl;

                          // Upload da foto se houver
                          if (!vToConfirm.isSold && deliveryPhoto) {
                            try {
                              salesUrl = await uploadFileToStorage(deliveryPhoto);
                            } catch (err) {
                              console.error(err);
                              alert("Erro ao enviar foto, salvando sem foto.");
                            }
                          }

                          const isNowSold = !vToConfirm.isSold;
                          const soldAt = isNowSold ? new Date().toISOString() : undefined;

                          onUpdateVehicle(confirmSoldId, {
                            isSold: isNowSold,
                            salesPhotoUrl: salesUrl,
                            soldAt: soldAt
                          });

                          if (user?.email) logger.logAction(user.email, 'EDITAR', vToConfirm.name, isNowSold ? 'Marcou como Vendido' : 'Marcou como Disponível');
                        }
                        setConfirmSoldId(null);
                        setDeliveryPhoto(null);
                      }}
                      className="w-full py-5 bg-gold text-black text-[11px] font-bold uppercase tracking-widest rounded-full hover:brightness-110"
                    >
                      Sim, confirmar
                    </button>
                    <button onClick={() => { setConfirmSoldId(null); setDeliveryPhoto(null); }} className="w-full py-5 bg-white/5 text-white/50 text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-white/10 hover:text-white transition-all">Cancelar</button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
