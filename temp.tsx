import React, { useState, useRef, useEffect } from 'react';
import { Vehicle, VehicleType, AppSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { logger, AccessLog, AuditLog } from '../services/LogService';
import { db } from '../services/VehicleService';
import { supabase } from '../services/supabase';
import { storageService } from '../services/StorageService';


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
      const data = await db.getNewsletterSubscriptions();
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
</div></div></div></div></div>);};
export default AdminPanel;
