-- CORREÇÃO DE PERMISSÕES (RLS)
-- Execute este script no SQL Editor do Supabase para corrigir o erro "new row violates row-level security policy"

-- 1. Garante que RLS está ativo (Segurança)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- 2. Limpa políticas antigas que podem estar com defeito
DROP POLICY IF EXISTS "Apenas usuários autenticados podem inserir veículos" ON vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar veículos" ON vehicles;
DROP POLICY IF EXISTS "Veículos são públicos" ON vehicles;
DROP POLICY IF EXISTS "Enable read for everyone" ON vehicles;

-- 3. Cria Política de INSERÇÃO (Authenticated Users Only)
-- Permite que qualquer usuário logado cadastre veículos
CREATE POLICY "Enable insert for authenticated users only"
ON vehicles FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Cria Política de ATUALIZAÇÃO (Authenticated Users Only)
-- Permite que qualquer usuário logado edite veículos
CREATE POLICY "Enable update for authenticated users only"
ON vehicles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Cria Política de LEITURA (Public)
-- Permite que qualquer pessoa (mesmo sem login) veja os veículos no site
CREATE POLICY "Enable read for everyone"
ON vehicles FOR SELECT
TO public
USING (true);

-- 6. Cria Política de EXCLUSÃO (Authenticated Users Only)
CREATE POLICY "Enable delete for authenticated users only"
ON vehicles FOR DELETE
TO authenticated
USING (true);

-- Confirmação
SELECT 'Permissões corrigidas com sucesso!' as status;
