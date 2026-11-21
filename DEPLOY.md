# Manual de Implantação e Publicação (Deploy) — Controle de Insumos

Este guia orienta a publicação definitiva do sistema em nuvem, permitindo que qualquer colaborador acesse a aplicação pelo computador, tablet ou celular via link seguro (HTTPS) sem depender de um computador local ligado.

---

## 🌟 Opção 1: Publicação com Vercel (Recomendada — Gratuita & Rápida)

A **Vercel** é a plataforma mais indicada para aplicações Vite / React com suporte nativo a roteamento SPA e certificado SSL automático.

### Método A: Via GitHub (Deploy Contínuo)
1. Crie um repositório no seu [GitHub](https://github.com) (ex: `controle-insumos`).
2. No terminal do projeto, inicialize e envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "feat: versão final multiusuário em tempo real"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/controle-insumos.git
   git push -u origin main
   ```
3. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
4. Clique em **"Add New..."** > **"Project"** e selecione o repositório `controle-insumos`.
5. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`: `https://kpoozprkgwejzzxztjyv.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb296cHJrZ3dlanp6eHp0anl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzY0MTcsImV4cCI6MjEwNDY1MjQxN30.69_ON4i9i8q6kLqDvtQhphdD4yMqVzft4pRIr86hBZ4`
6. Clique em **"Deploy"**. Em menos de 1 minuto seu link estará ativo (ex: `https://controle-insumos.vercel.app`).

### Método B: Via Linha de Comando (CLI da Vercel)
Se preferir publicar direto pelo seu terminal:
```bash
npx vercel
```
- Confirme o diretório (`./`), selecione sua conta e aceite as configurações padrão do Vite. O deploy gerará seu link instantaneamente.

---

## 🚀 Opção 2: Publicação com Netlify (Arrastar e Soltar ou Git)

1. No terminal do projeto, gere a pasta de produção compilada:
   ```bash
   npm run build
   ```
2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
3. Arraste a pasta **`dist`** gerada para a área indicada na página.
4. Seu aplicativo já estará online com o arquivo de redirecionamento `public/_redirects` já preparado para rotas limpas.

---

## 🛡️ Credenciais Iniciais de Acesso

- **URL do Banco / API:** `https://kpoozprkgwejzzxztjyv.supabase.co`
- **Usuário Mestre (Administrador):**
  - **Login:** `admin`
  - **Senha:** `admin123`
- **Exemplo de Operador de Acabamento Testado:**
  - **Login:** `faccao`
  - **Senha:** `123`

*(Novos usuários e alterações de senha podem ser feitos a qualquer momento pelo menu **Usuários & Permissões** logado como `admin`)*.
