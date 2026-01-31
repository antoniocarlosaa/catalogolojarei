# Como Duplicar e Adaptar o Projeto para Outra Loja

Este guia explica como pegar o código atual do "Rei das Motos" e transformá-lo em um catálogo novo para outra loja (ex: "Império dos Carros").

## 1. Copiar o Projeto no Computador
1.  Vá até a pasta onde o projeto está salvo.
2.  Copie a pasta inteira `catalogoreidasmotos`.
3.  Cole e renomeie para o nome da nova loja (ex: `catalogo-nova-loja`).
4.  Abra essa nova pasta no VS Code.

## 2. Limpar Instalações Antigas
Para evitar erros, é bom "resetar" as instalações:
1.  Apague a pasta `node_modules`.
2.  Apague a pasta `.git` (se quiser começar um histórico de alterações do zero).
3.  Abra o terminal no VS Code e rode: `npm install`.

## 3. Criar um Novo Banco de Dados (Supabase)
Cada loja deve ter seu próprio banco de dados para não misturar os veículos e clientes.
1.  Entre em [supabase.com](https://supabase.com) e crie um **Novo Projeto**.
2.  Dê o nome da nova loja e defina a senha.
3.  Vá em **Project Settings > API**.
4.  Copie a `Project URL` e a `anon public key`.

## 4. Conectar o Novo Banco
1.  No VS Code da nova loja, abra o arquivo `.env.local`.
2.  Substitua as chaves antigas pelas chaves do **NOVO** Supabase que você copiou.
3.  **Configurar Tabelas**:
    - Você precisará criar as tabelas novamente neste novo banco.
    - Use o arquivo `SUPABASE_SETUP.md` (que já temos no projeto) e rode os comandos SQL no "SQL Editor" do novo painel do Supabase.

## 5. Personalizar o Visual (Branding)
Aqui é onde você deixa a loja com a cara nova.

### Alterar Nome e Logo
- **Arquivo**: `components/Header.tsx`
- **O que mudar**: Procure por "REI DAS MOTOS" e mude para o nome da nova loja.

### Alterar Cores (Tema)
O projeto usa cores definidas (principalmente o Dourado/Gold e Preto).
- **Arquivo**: `tailwind.config.js`
- **O que mudar**:
  Procure a seção `colors`:
  ```javascript
  colors: {
      gold: '#FFD700', // <--- Mude este código Hex para a cor principal da nova loja (ex: Vermelho: #FF0000)
      // ...
  }
  ```
- **Arquivo**: `index.css`
- **O que mudar**: Verifique se há estilos globais manuais usando cores fixas e altere.

### Alterar Configurações Padrão
- **Arquivo**: `App.tsx` (Estado inicial)
- Embora o painel Admin permita mudar whatsapp e imagens, você pode querer mudar os valores padrão iniciais no código se desejar.

## 6. Publicar (Deploy)
1.  Crie um novo repositório no GitHub para essa nova loja.
2.  Conecte o projeto ao GitHub (`git init`, `git add .`, `git commit`, `git remote add ...`).
3.  Vá na Vercel, clique em "Add New Project" e importe esse novo repositório.

Pronto! Agora você tem duas lojas independentes rodando com o mesmo sistema base.
