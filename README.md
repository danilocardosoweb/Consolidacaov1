# Sistema de Gerenciamento de Células e Visitantes

## Sobre o Projeto

Sistema desenvolvido para gerenciamento de células e visitantes de uma igreja, com funcionalidades para cadastro, acompanhamento e geração de relatórios.

## Tecnologias Utilizadas

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Como Executar o Projeto Localmente

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para Configuração

1. **Clone o repositório**
   ```sh
   git clone <URL_DO_REPOSITÓRIO>
   cd <NOME_DO_PROJETO>
   ```

2. **Instale as dependências**
   ```sh
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. **Inicie o servidor de desenvolvimento**
   ```sh
   npm run dev
   # ou
   yarn dev
   ```

5. **Acesse o projeto**
   Abra seu navegador e acesse: [http://localhost:5173](http://localhost:5173)

## Estrutura do Projeto

- `/src/components` - Componentes React reutilizáveis
- `/src/pages` - Páginas da aplicação
- `/src/hooks` - Hooks personalizados
- `/src/integrations` - Configurações de integrações (como Supabase)
- `/src/lib` - Utilitários e funções auxiliares
- `/public` - Arquivos estáticos (imagens, etc.)

## Deploy

Para fazer o deploy do projeto, você pode usar serviços como:

- Vercel
- Netlify
- Render
- Railway

Certifique-se de configurar as variáveis de ambiente corretamente no serviço de hospedagem escolhido.
