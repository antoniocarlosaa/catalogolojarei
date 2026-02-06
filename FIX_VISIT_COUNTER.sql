-- 🚨 SCRIPT PARA CORRIGIR O CONTADOR DE VISITAS 🚨
-- Execute este script no SQL Editor do Supabase para fazer o contador funcionar.

-- 1. Cria a tabela de logs se ela não existir
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip TEXT,
    location TEXT,
    device_info TEXT,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilita segurança (RLS)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- 3. Limpa políticas antigas para evitar erros
DROP POLICY IF EXISTS "Public can insert visits" ON access_logs;
DROP POLICY IF EXISTS "Public can view visits" ON access_logs;
DROP POLICY IF EXISTS "Anon inserts" ON access_logs;
DROP POLICY IF EXISTS "Anon reads" ON access_logs;

-- 4. PERMITIR QUE QUALQUER PESSOA (Anônima) REGISTRE VISITA
CREATE POLICY "Public can insert visits"
ON access_logs FOR INSERT
TO public
WITH CHECK (true);

-- 5. PERMITIR QUE QUALQUER PESSOA LEIA O CONTADOR
CREATE POLICY "Public can view visits"
ON access_logs FOR SELECT
TO public
USING (true);

-- 6. Confirmação
SELECT 'SUCESSO: Contador de visitas configurado e liberado!' as status;
