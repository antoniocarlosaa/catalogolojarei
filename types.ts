
export enum VehicleType {
  MOTO = 'MOTOS',
  CARRO = 'CARROS',
}

export interface Vehicle {
  id: string;
  name: string;
  price: number | string;
  type: VehicleType;
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  videos?: string[];
  isSold?: boolean;
  imagePosition?: string; // "x% y%" para object-position
  isFeatured?: boolean;
  isPromoSemana?: boolean;
  isPromoMes?: boolean;
  isZeroKm?: boolean; // Indica se é 0 KM
  isRepasse?: boolean; // Veículo de repasse
  specs?: string;
  km?: number;
  year?: string; // Ano do veículo
  color?: string; // Cor do veículo
  // Common flags
  isSingleOwner?: boolean;
  hasDut?: boolean;
  hasManual?: boolean;
  hasSpareKey?: boolean;
  hasRevisoes?: boolean; // Para carros
  // Specific attributes
  category?: string; // e.g., "Naked", "SUV", "Esportiva"
  displacement?: string; // CC for bikes
  transmission?: string; // For cars
  fuel?: string; // For cars
  motor?: string; // Motor do carro (ex: 1.0, 2.0 Turbo)
  plate_last3?: string; // Últimos 3 dígitos da placa
}

export type CategoryFilter = 'TUDO' | 'MOTOS' | 'CARROS' | 'PROMOÇÕES';

export interface AppSettings {
  whatsappNumbers: string[];
  googleMapsUrl?: string;
  backgroundImageUrl?: string;
  backgroundPosition?: string; // e.g. "50% 50%"
  cardImageFit?: 'cover' | 'contain';
}
