# Guia de Deploy na Vercel - Rei das Motos Luxury Catalog

Este guia passo a passo ajudará você a colocar seu catálogo online usando a Vercel.

## Pré-requisitos
1.  Uma conta no [GitHub](https://github.com).
2.  Uma conta na [Vercel](https://vercel.com) (pode entrar com sua conta GitHub).
3.  Seu projeto estar funcionando localmente.

## Passo 1: Preparar o Código

1.  Abra seu terminal no VS Code.
2.  Certifique-se de que todas as suas alterações foram salvas.
3.  Execute os seguintes comandos para enviar seu código para o GitHub (se ainda não fez isso):

```bash
git add .
git commit -m "Preparando para deploy na Vercel"
git push
```
*(Se você ainda não conectou seu repositório local ao GitHub, precisará criar um repositório no site do GitHub e seguir as instruções que eles fornecem para fazer o "push" de um repositório existente).*

## Passo 2: Configurar na Vercel

1.  Acesse o painel da [Vercel](https://vercel.com/dashboard).
2.  Clique no botão **"Add New..."** e selecione **"Project"**.
3.  Na lista "Import Git Repository", você deve ver o seu repositório `rei-das-motos---luxury-catalog` (ou o nome que você deu). Clique em **"Import"**.

## Passo 3: Configuração do Projeto

Na tela de configuração de "Configure Project":

1.  **Project Name**: Pode deixar como está ou mudar se quiser.
2.  **Framework Preset**: A Vercel deve detectar automaticamente como **Vite**. Se não, selecione "Vite".
3.  **Root Directory**: Deixe como `./` (ou vazio).
4.  **Environment Variables** (MUITO IMPORTANTE):
    Você precisa adicionar as chaves que estão no seu arquivo `.env.local` aqui.
    
    Clique para expandir a seção "Environment Variables" e adicione:

    *   **Nome**: `VITE_SUPABASE_URL`
    *   **Valor**: `https://goacxbpdikiljwuafjbr.supabase.co`
    *   Clique em **Add**.

    *   **Nome**: `VITE_SUPABASE_ANON_KEY`
    *   **Valor**: *(Copie o valor longo que começa com `eyJ` do seu arquivo .env.local)*
    *   Clique em **Add**.

    *   **Nome**: `GEMINI_API_KEY`
    *   **Valor**: *(Se você tiver uma chave real, coloque aqui. Se for apenas placeholder, pode pular ou colocar o placeholder)*
    *   Clique em **Add**.

## Passo 4: Deploy

1.  Após configurar as variáveis, clique no botão **"Deploy"**.
2.  Aguarde alguns instantes enquanto a Vercel constrói seu site.
3.  Se tudo der certo, você verá uma tela de "Congratulations!".
4.  Clique na imagem do site ou em "Visit" para ver seu catálogo online.

## Solução de Problemas Comuns

*   **Tela Branca ou Erro 404 ao atualizar a página**: O arquivo `vercel.json` que já criamos deve prevenir isso.
*   **Erro de conexão com o banco de dados**: Verifique se as Variáveis de Ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) foram copiadas corretamente, sem espaços extras.

---
Se tiver qualquer dúvida ou erro durante o processo, me avise!
