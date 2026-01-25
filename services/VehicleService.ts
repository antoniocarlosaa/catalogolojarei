import { Vehicle, AppSettings } from '../types';
import { supabase } from './supabase';
import { INITIAL_VEHICLES } from '../constants';

class VehicleService {
  private storageKey = 'rei_das_motos_db_v2';
  private settingsKey = 'rei_das_motos_settings_v2';

  // Buscar todos os veículos
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao buscar do Supabase, usando fallback:', error);
        return this.getFallbackVehicles();
      }

      // Se o banco está vazio, mas pode haver dados locais
      if (!data || data.length === 0) {
        return this.getFallbackVehicles();
      }

      // Conversão
      const supabaseVehicles = data.map(v => this.convertFromDatabase(v));

      // Se temos dados do Supabase, ATUALIZAMOS o cache local com a verdade do servidor.
      // Isso remove "fantasmas" (veículos deletados em outros dispositivos).
      localStorage.setItem(this.storageKey, JSON.stringify(supabaseVehicles));

      return supabaseVehicles;
    } catch (error) {
      console.error('Erro ao conectar com Supabase, usando fallback:', error);
      return this.getFallbackVehicles();
    }
  }

  // Fallback: tentar localStorage, se não tiver, usar dados iniciais
  private getFallbackVehicles(): Vehicle[] {
    const localData = localStorage.getItem(this.storageKey);
    if (localData) {
      console.log('Usando dados do localStorage');
      return JSON.parse(localData);
    }
    console.log('Usando dados iniciais');
    return INITIAL_VEHICLES;
  }

  // Converter dados do banco para formato do app
  private convertFromDatabase(dbVehicle: any): Vehicle {
    return {
      id: dbVehicle.id,
      name: dbVehicle.name,
      price: dbVehicle.price || dbVehicle.price_text || 0,
      type: dbVehicle.type,
      imageUrl: dbVehicle.image_url,
      images: dbVehicle.images || [],
      videoUrl: dbVehicle.video_url,
      videos: dbVehicle.videos || [],
      isSold: dbVehicle.is_sold || false,
      isFeatured: dbVehicle.is_featured || false,
      isPromoSemana: dbVehicle.is_promo_semana || false,
      isPromoMes: dbVehicle.is_promo_mes || false,
      isZeroKm: dbVehicle.is_zero_km || false,
      isRepasse: dbVehicle.is_repasse || false,
      specs: dbVehicle.specs,
      km: dbVehicle.km,
      year: dbVehicle.year,
      color: dbVehicle.color,
      category: dbVehicle.category,
      displacement: dbVehicle.displacement,
      transmission: dbVehicle.transmission,
      fuel: dbVehicle.fuel,
      motor: dbVehicle.motor,
      isSingleOwner: dbVehicle.is_single_owner || false,
      hasDut: dbVehicle.has_dut || false,
      hasManual: dbVehicle.has_manual || false,
      hasSpareKey: dbVehicle.has_spare_key || false,
      hasRevisoes: dbVehicle.has_revisoes || false,
      imagePosition: dbVehicle.image_position,
      plate_last3: dbVehicle.plate_last3,
    };
  }

  // Salvar novo veículo
  async saveVehicle(vehicle: Vehicle): Promise<void> {
    try {
      // Sempre salvar localmente primeiro para garantir disponibilidade imediata
      const currentLocal = this.getFallbackVehicles();
      const updatedLocal = [vehicle, ...currentLocal];
      localStorage.setItem(this.storageKey, JSON.stringify(updatedLocal));

      const { error } = await supabase
        .from('vehicles')
        .insert([{
          id: vehicle.id,
          name: vehicle.name,
          price: typeof vehicle.price === 'number' ? vehicle.price : null,
          price_text: typeof vehicle.price === 'string' ? vehicle.price : null,
          type: vehicle.type,
          image_url: vehicle.imageUrl,
          images: vehicle.images || [],
          video_url: vehicle.videoUrl,
          videos: vehicle.videos || [],
          is_sold: vehicle.isSold || false,
          is_featured: vehicle.isFeatured || false,
          is_promo_semana: vehicle.isPromoSemana || false,
          is_promo_mes: vehicle.isPromoMes || false,
          is_zero_km: vehicle.isZeroKm || false,
          is_repasse: vehicle.isRepasse || false,
          specs: vehicle.specs,
          km: vehicle.km,
          year: vehicle.year,
          color: vehicle.color,
          category: vehicle.category,
          displacement: vehicle.displacement,
          transmission: vehicle.transmission,
          fuel: vehicle.fuel,
          motor: vehicle.motor,
          is_single_owner: vehicle.isSingleOwner || false,
          has_dut: vehicle.hasDut || false,
          has_manual: vehicle.hasManual || false,
          has_spare_key: vehicle.hasSpareKey || false,
          has_revisoes: vehicle.hasRevisoes || false,
          plate_last3: vehicle.plate_last3,
        }]);

      if (error) {
        console.warn('Erro ao salvar no Supabase, mantido apenas local:', error);
        alert(`Erro de sincronização (Supabase): ${error.message || JSON.stringify(error)}`);
      }
    } catch (error: any) {
      console.error('Erro ao conectar com Supabase, mantido apenas local:', error);
      alert(`Erro de conexão: ${error.message || JSON.stringify(error)}`);
    }
  }

  // Atualizar veículo
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    try {
      // Atualizar localmente primeiro
      const vehicles = this.getFallbackVehicles();
      const updatedLocal = vehicles.map(v => v.id === id ? { ...v, ...updates } : v);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedLocal));

      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.price !== undefined) {
        updateData.price = typeof updates.price === 'number' ? updates.price : null;
        updateData.price_text = typeof updates.price === 'string' ? updates.price : null;
      }
      if (updates.isSold !== undefined) updateData.is_sold = updates.isSold;
      if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
      if (updates.isPromoSemana !== undefined) updateData.is_promo_semana = updates.isPromoSemana;
      if (updates.isPromoMes !== undefined) updateData.is_promo_mes = updates.isPromoMes;
      if (updates.specs !== undefined) updateData.specs = updates.specs;
      if (updates.plate_last3 !== undefined) updateData.plate_last3 = updates.plate_last3;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.km !== undefined) updateData.km = updates.km;
      if (updates.year !== undefined) updateData.year = updates.year;
      // Add other missing fields if crucial, but plate_last3 was the request.
      // Actually checking AdminPanel logic, it sends most fields. Let's make sure update handles ALL fields sent by Full Edit.
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.images !== undefined) updateData.images = updates.images;
      if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl;
      if (updates.videos !== undefined) updateData.videos = updates.videos;
      if (updates.isZeroKm !== undefined) updateData.is_zero_km = updates.isZeroKm;
      if (updates.isRepasse !== undefined) updateData.is_repasse = updates.isRepasse;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.displacement !== undefined) updateData.displacement = updates.displacement;
      if (updates.transmission !== undefined) updateData.transmission = updates.transmission;
      if (updates.fuel !== undefined) updateData.fuel = updates.fuel;
      if (updates.motor !== undefined) updateData.motor = updates.motor;
      if (updates.isSingleOwner !== undefined) updateData.is_single_owner = updates.isSingleOwner;
      if (updates.hasDut !== undefined) updateData.has_dut = updates.hasDut;
      if (updates.hasManual !== undefined) updateData.has_manual = updates.hasManual;
      if (updates.hasSpareKey !== undefined) updateData.has_spare_key = updates.hasSpareKey;
      if (updates.hasRevisoes !== undefined) updateData.has_revisoes = updates.hasRevisoes;
      if (updates.imagePosition !== undefined) updateData.image_position = updates.imagePosition;


      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.warn('Erro ao atualizar no Supabase, mantido local:', error);
        alert(`Erro ao atualizar (Supabase): ${error.message || JSON.stringify(error)}`);
      }
    } catch (error: any) {
      console.error('Erro ao conectar com Supabase, mantido local:', error);
      alert(`Erro de conexão na atualização: ${error.message || JSON.stringify(error)}`);
    }
  }

  // Deletar veículo
  async deleteVehicle(id: string): Promise<void> {
    try {
      // Deletar localmente primeiro
      const vehicles = this.getFallbackVehicles();
      const updatedLocal = vehicles.filter(v => v.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedLocal));

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Erro ao deletar no Supabase, mantido local:', error);
      }
    } catch (error) {
      console.error('Erro ao conectar com Supabase, mantido local:', error);
    }
  }

  // Buscar configurações
  async getSettings(): Promise<AppSettings> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.warn('Erro ao buscar configurações do Supabase, usando fallback:', error);
        return this.getFallbackSettings();
      }

      const local = this.getFallbackSettings();

      return {
        whatsappNumbers: data?.whatsapp_numbers || local.whatsappNumbers || [],
        googleMapsUrl: data?.google_maps_url || local.googleMapsUrl || '',
        backgroundImageUrl: data?.background_image_url || local.backgroundImageUrl || '',
        backgroundPosition: data?.background_position || local.backgroundPosition || '50% 50%',
        cardImageFit: data?.card_image_fit || local.cardImageFit || 'cover',
      };
    } catch (error) {
      console.error('Erro ao conectar com Supabase, usando configurações locais:', error);
      return this.getFallbackSettings();
    }
  }

  // Fallback para configurações
  private getFallbackSettings(): AppSettings {
    const localData = localStorage.getItem(this.settingsKey);
    if (localData) {
      console.log('Usando configurações do localStorage');
      return JSON.parse(localData);
    }
    return { whatsappNumbers: [], googleMapsUrl: '', backgroundImageUrl: '', backgroundPosition: '50% 50%', cardImageFit: 'cover' };
  }

  // Salvar configurações
  async saveSettings(settings: AppSettings): Promise<void> {
    // Salvar localmente primeiro
    localStorage.setItem(this.settingsKey, JSON.stringify(settings));

    try {
      // Primeiro, buscar o ID da configuração existente
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        // Atualizar configuração existente
        const { data: updatedData, error } = await supabase
          .from('settings')
          .update({
            whatsapp_numbers: settings.whatsappNumbers,
            google_maps_url: settings.googleMapsUrl,
            background_image_url: settings.backgroundImageUrl,
            background_position: settings.backgroundPosition,
            card_image_fit: settings.cardImageFit,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select(); // Verificar se realmente salvou

        if (error) throw error;
        if (!updatedData || updatedData.length === 0) {
          throw new Error("Salvo falhou: O banco recusou a edição. Tente deslogar e logar novamente.");
        }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('settings')
          .insert([{
            whatsapp_numbers: settings.whatsappNumbers,
            google_maps_url: settings.googleMapsUrl,
            background_image_url: settings.backgroundImageUrl,
            background_position: settings.backgroundPosition,
            card_image_fit: settings.cardImageFit,
          }]);

        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Erro ao salvar configurações no Supabase:', error);
      // RE-THROW erro para que o UI saiba que falhou no servidor
      throw error;
    }
  }
}

export const db = new VehicleService();
