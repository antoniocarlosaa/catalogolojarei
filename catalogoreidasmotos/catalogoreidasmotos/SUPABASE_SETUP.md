# Configuração do Supabase - Rei das Motos

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: rei-das-motos-catalog
   - **Database Password**: (escolha uma senha forte)
   - **Region**: South America (São Paulo)
5. Clique em "Create new project"

## Passo 2: Obter Credenciais

Após criar o projeto:

1. Vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave pública)

## Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=sua_project_url_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

## Passo 4: Criar Tabelas no Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Cole e execute o SQL abaixo:

```sql
-- Tabela de Veículos
CREATE TABLE vehicles (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de Configurações
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_numbers TEXT[],
  google_maps_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração inicial
INSERT INTO settings (whatsapp_numbers, google_maps_url)
VALUES (ARRAY[]::TEXT[], '');

-- Habilitar RLS (Row Level Security)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para vehicles
CREATE POLICY "Veículos são visíveis para todos"
  ON vehicles FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir veículos"
  ON vehicles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar veículos"
  ON vehicles FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem deletar veículos"
  ON vehicles FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas de acesso para settings
CREATE POLICY "Configurações são visíveis para todos"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem atualizar configurações"
  ON settings FOR UPDATE
  USING (auth.role() = 'authenticated');
```

## Passo 5: Configurar Storage para Imagens/Vídeos

1. No Supabase, vá em **Storage**
2. Clique em "Create a new bucket"
3. Nome: `vehicle-media`
4. **Public bucket**: ✅ Marque como público
5. Clique em "Create bucket"

## Passo 6: Criar Usuário Administrador

1. No Supabase, vá em **Authentication** → **Users**
2. Clique em "Add user"
3. Escolha "Create new user"
4. Preencha:
   - **Email**: seu_email@exemplo.com
   - **Password**: (escolha uma senha forte)
   - **Auto Confirm User**: ✅ Marque
5. Clique em "Create user"

## Passo 7: Testar Conexão

Após configurar tudo, rode o projeto:

```bash
npm run dev
```

O sistema agora está conectado ao Supabase! 🎉

## Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou corretamente a `anon key`
- Verifique se o arquivo `.env.local` está na raiz do projeto

### Erro: "Failed to fetch"
- Verifique se a `VITE_SUPABASE_URL` está correta
- Verifique sua conexão com internet

### Erro de autenticação
- Certifique-se de que criou um usuário no painel do Supabase
- Verifique se marcou "Auto Confirm User"

## Próximos Passos

Após configurar o Supabase:
1. O sistema automaticamente usará o banco de dados
2. Faça login com o email/senha que criou
3. Comece a cadastrar veículos!
