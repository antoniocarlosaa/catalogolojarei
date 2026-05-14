CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode inserir (inscrever-se)
CREATE POLICY "Permitir inserção pública" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);

-- Política: Apenas leitura para admin (ou pública para teste se necessário, mas seguro é limitar)
-- Como o painel admin roda no cliente, precisamos que o usuário logado (authenticated) consiga ler
CREATE POLICY "Permitir leitura para autenticados" ON newsletter_subscriptions FOR SELECT TO authenticated USING (true);

-- Adicionar colunas de Promoção na tabela settings (caso não existam)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'promo_active') THEN
        ALTER TABLE settings ADD COLUMN promo_active BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'promo_image_url') THEN
        ALTER TABLE settings ADD COLUMN promo_image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'promo_link') THEN
        ALTER TABLE settings ADD COLUMN promo_link TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'promo_text') THEN
        ALTER TABLE settings ADD COLUMN promo_text TEXT;
    END IF;
END $$;
