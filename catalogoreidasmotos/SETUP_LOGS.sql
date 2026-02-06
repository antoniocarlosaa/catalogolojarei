-- SISTEMA DE LOGS E MONITORAMENTO

-- 1. Tabela de Logs de Acesso (Visitas)
CREATE TABLE access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT,
  location TEXT, -- Cidade, Estado, Baseado no IP
  device_info TEXT, -- Modelo do aparelho/Navegador
  device_type TEXT, -- 'Mobile' ou 'Desktop'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Auditoria (Ações do Admin)
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT, -- Quem fez a ação
  action_type TEXT, -- 'CRIAR', 'EDITAR', 'EXCLUIR', 'LOGIN'
  target TEXT, -- Nome do veículo ou item afetado
  details TEXT, -- Resumo da alteração
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Segurança (RLS)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de VISITAS (Público pode INSERIR, só Admin pode LER)
-- Qualquer um que entra no site grava o log
CREATE POLICY "Public Log Insert" ON access_logs FOR INSERT TO public WITH CHECK (true);
-- Só usuário logado vê os logs
CREATE POLICY "Admin Log Select" ON access_logs FOR SELECT TO authenticated USING (true);


-- 5. Políticas de AUDITORIA (Só Admin faz tudo)
CREATE POLICY "Admin Audit Insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Audit Select" ON audit_logs FOR SELECT TO authenticated USING (true);

-- Confirmação
SELECT 'Sistema de Logs criado com sucesso!' as status;
