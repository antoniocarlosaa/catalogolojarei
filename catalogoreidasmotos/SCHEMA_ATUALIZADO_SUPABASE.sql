-- ==========================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETA - MOTOS & CIA
-- Execute este script no "SQL Editor" do Supabase
-- ==========================================

-- 1. TABELA DE VEÍCULOS
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC,
  price_text TEXT,
  type TEXT NOT NULL CHECK (type IN ('MOTOS', 'CARROS')),
  image_url TEXT,
  images TEXT[],
  video_url TEXT,
  videos TEXT[],
  is_sold BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_promo_semana BOOLEAN DEFAULT false,
  is_promo_mes BOOLEAN DEFAULT false,
  is_zero_km BOOLEAN DEFAULT false,
  is_repasse BOOLEAN DEFAULT false,
  specs TEXT,
  km INTEGER,
  year TEXT,
  color TEXT,
  category TEXT,
  displacement TEXT,
  transmission TEXT,
  fuel TEXT,
  motor TEXT,
  is_single_owner BOOLEAN DEFAULT false,
  has_dut BOOLEAN DEFAULT false,
  has_manual BOOLEAN DEFAULT false,
  has_spare_key BOOLEAN DEFAULT false,
  has_revisoes BOOLEAN DEFAULT false,
  image_position TEXT DEFAULT '50% 50%',
  plate_last3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Desativando RLS em vehicles para manter como estava funcionando publicamente
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;

-- 2. TABELA DE CONFIGURAÇÕES (Admin)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_numbers TEXT[],
  google_maps_url TEXT,
  promo_active BOOLEAN DEFAULT false,
  promo_image_url TEXT,
  promo_link TEXT,
  promo_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração inicial se estiver vazia
INSERT INTO public.settings (whatsapp_numbers, google_maps_url)
SELECT ARRAY[]::TEXT[], ''
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Configurações são visíveis para todos" ON settings;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar configurações" ON settings;

CREATE POLICY "Configurações são visíveis para todos" ON settings FOR SELECT USING (true);
CREATE POLICY "Apenas usuários autenticados podem atualizar configurações" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. TABELA DE NEWSLETTER
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir inserção pública" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON newsletter_subscriptions;

CREATE POLICY "Permitir inserção pública" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura para autenticados" ON newsletter_subscriptions FOR SELECT TO authenticated USING (true);

-- 4. TABELA DO CONTADOR DE VISITAS
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip TEXT,
    location TEXT,
    device_info TEXT,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert visits" ON access_logs;
DROP POLICY IF EXISTS "Public can view visits" ON access_logs;

CREATE POLICY "Public can insert visits" ON access_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can view visits" ON access_logs FOR SELECT TO public USING (true);

-- 5. STORAGE BUCKET E POLITICAS (Para uploads de imagem)
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('vehicle-media', 'vehicle-media', true)
    ON CONFLICT (id) DO NOTHING;
    
    BEGIN
        CREATE POLICY "Liberar Upload Geral" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'vehicle-media');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
        CREATE POLICY "Liberar Leitura Geral" ON storage.objects FOR SELECT TO public USING (bucket_id = 'vehicle-media');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
     BEGIN
        CREATE POLICY "Liberar Atualizacao Geral" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'vehicle-media');
     EXCEPTION WHEN duplicate_object THEN NULL; END;
     
     BEGIN
        CREATE POLICY "Liberar Delete Geral" ON storage.objects FOR DELETE TO public USING (bucket_id = 'vehicle-media');
     EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
