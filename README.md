# 📦 Sistema de Controle e Gestão de Insumos (ControleInsumos)

> Plataforma web moderna e responsiva para requisição, separação, rastreabilidade e controle de estoque de insumos industriais com sincronização em tempo real entre dispositivos móveis e desktops.

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Perfis de Acesso (RBAC)](#-perfis-de-acesso-rbac)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Passo a Passo para Iniciar o Projeto](#-passo-a-passo-para-iniciar-o-projeto)
  - [1. Clonar o repositório](#1-clonar-o-repositório)
  - [2. Instalar dependências](#2-instalar-dependências)
  - [3. Configurar variáveis de ambiente](#3-configurar-variáveis-de-ambiente)
  - [4. Iniciar o servidor local](#4-iniciar-o-servidor-local)
  - [5. Como testar no celular (mesma rede Wi-Fi)](#5-como-testar-no-celular-mesma-rede-wi-fi)
- [Credenciais para Primeiro Acesso](#-credenciais-para-primeiro-acesso)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Deploy](#-deploy)

---

## 🚀 Visão Geral

O **ControleInsumos** foi desenvolvido para eliminar o uso de papéis avulsos e falhas de comunicação entre os setores operacionais (como o **Acabamento**) e o **Almoxarifado**. 

Com foco em usabilidade, os operadores de fábrica podem registrar requisições diretamente de seus celulares ou tablets, enquanto a equipe do Almoxarifado acompanha os pedidos em tempo real no computador, confere os itens e gera **Checklists em PDF com campos de assinatura física**.

---

## ✨ Funcionalidades Principais

- ⚡ **Sincronização em Tempo Real (Realtime):** Novas solicitações e alterações de status aparecem instantaneamente em todas as telas conectadas sem necessidade de recarregar a página.
- 📱 **Interface 100% Responsiva:** Adaptada para uso em telas pequenas (smartphones e coletores) e telas grandes (estações do almoxarifado e gerência).
- 📴 **Resiliência e Modo Offline:** Suporte a fila local com sincronização automática caso ocorram instabilidades na rede.
- 📄 **Geração Automática de PDF (Checklist de Separação):**
  - Tabela organizada com itens, quantidades solicitadas e unidades de medida.
  - Campos de conferência (*check-boxes* físicos).
  - Linhas formais para assinaturas de quem separou (Almoxarifado) e de quem retirou (Acabamento/Operador).
- 👥 **Gestão Centralizada de Perfis e Permissões:** Controle restrito de acessos com gerenciamento exclusivo pelo Administrador.
- 📊 **Histórico e Rastreabilidade:** Registro completo de solicitações atendidas, canceladas e pendentes com data/hora e identificação do solicitante.

---

## 🔐 Perfis de Acesso (RBAC)

O sistema possui controle de acesso refinado por perfil:

| Perfil | Acessos e Permissões |
| :--- | :--- |
| **Administrador** | • Acesso total a todas as telas do sistema.<br>• Painel exclusivo de **Gestão de Usuários** (criação, alteração de senhas, ativação/desativação e atribuição de cargos). |
| **Almoxarifado** | • Painel de atendimento e fila de pedidos em tempo real.<br>• Geração de Checklist em PDF para separação e conferência.<br>• Consulta e gestão do catálogo de insumos.<br>• Histórico geral de pedidos. |
| **Acabamento (Operador)** | • Abertura rápida de novas requisições de insumos.<br>• Acompanhamento do status de suas solicitações em andamento.<br>• Consulta do histórico de suas próprias solicitações. |

---

## 🛠 Tecnologias Utilizadas

- **Frontend:**
  - [React 18](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) - Bundler ultrarrápido
  - [Tailwind CSS](https://tailwindcss.com/) - Estilização moderna e utilitária
  - [Lucide React](https://lucide.dev/) - Pacote de ícones minimalistas
  - [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) - Renderização vetorial de relatórios em PDF
- **Backend & Banco de Dados:**
  - [Supabase](https://supabase.com/) (PostgreSQL, Realtime WebSockets, Row Level Security)

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Gerenciador de pacotes `npm` (incluso com o Node) ou `yarn`/`pnpm`.
- Navegador web moderno (Chrome, Edge, Firefox, Safari).

---

## 🏁 Passo a Passo para Iniciar o Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU-USUARIO/ControleInsumos.git
cd ControleInsumos
```

### 2. Instalar dependências

Execute o comando abaixo para baixar e instalar as dependências do projeto:

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (ou copie o `.env.example`):

```bash
cp .env.example .env
```

Preencha as variáveis de conexão com o seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

> **Dica:** Se você já possui o arquivo `.env` configurado na sua máquina local, certifique-se de que ele não seja compartilhado em repositórios públicos.

### 4. Iniciar o servidor local

Para rodar a aplicação em modo de desenvolvimento:

```bash
npm run dev
```

O terminal exibirá o endereço local, geralmente:
👉 **`http://localhost:5173`**

Abra o endereço no seu navegador para utilizar o sistema.

---

### 5. Como testar no celular (mesma rede Wi-Fi)

Para testar a sincronização em tempo real entre o computador e um smartphone:

1. Inicie o Vite liberando o host para a rede local:
   ```bash
   npm run dev -- --host
   ```
2. O terminal exibirá o IP de rede, por exemplo:
   ```text
   Network: http://192.168.1.15:5173/
   ```
3. Conecte o celular na **mesma rede Wi-Fi** do computador e abra esse endereço no navegador do celular.
4. Faça login com o perfil **Acabamento** no celular e **Almoxarifado** no PC:
   - Crie uma solicitação pelo celular e veja-a surgir instantaneamente na tela do computador!

---

## 🔑 Credenciais para Primeiro Acesso

O banco de dados possui o usuário mestre de fábrica pré-configurado:

| Campo | Valor Padrão |
| :--- | :--- |
| **Usuário** | `admin` |
| **Senha** | `admin123` |
| **Perfil** | Administrador |

> 🔒 **Recomendação:** Após o primeiro acesso, acesse o menu **Usuários** para cadastrar os colaboradores da equipe e alterar a senha de fábrica do administrador caso necessário.

---

## 📁 Estrutura de Pastas

```text
ControleInsumos/
├── public/                 # Arquivos públicos e ícones
├── src/
│   ├── components/         # Componentes modulares de UI (Modais, Sidebar, Tabelas)
│   ├── lib/                # Configuração e cliente Supabase (supabaseClient.ts)
│   ├── services/           # Lógica de integração com Supabase, PDF e Realtime
│   ├── types/              # Tipagens TypeScript (Perfis, Insumos, Solicitações)
│   ├── App.tsx             # Componente raiz e roteamento de telas
│   ├── index.css           # Estilos globais e diretivas Tailwind
│   └── main.tsx            # Ponto de entrada da aplicação
├── .env.example            # Exemplo de configuração de variáveis de ambiente
├── package.json            # Metadados do projeto e scripts
├── tailwind.config.js      # Customização do design system Tailwind
├── tsconfig.json           # Configurações do compilador TypeScript
└── vite.config.ts          # Configurações do Vite
```

---

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento Vite com Hot Module Replacement (HMR).
- `npm run build`: Compila o TypeScript e gera os arquivos estáticos otimizados para produção na pasta `dist/`.
- `npm run preview`: Executa um servidor local simulando o build de produção.

---

## 🌐 Deploy

O projeto está pronto para implantação em plataformas modernas de hospedagem estática:

- **Vercel:** Contém arquivo [vercel.json](file:///c:/Users/miche/OneDrive/Área de Trabalho/Projetos/ControleInsumos/vercel.json) configurado para suporte a Single Page Application (SPA).
- **Netlify:** Contém regras de redirecionamento no diretório `public/_redirects`.

Para mais detalhes passo a passo sobre publicação em nuvem, consulte o documento [DEPLOY.md](file:///c:/Users/miche/OneDrive/Área de Trabalho/Projetos/ControleInsumos/DEPLOY.md).

---

## 📄 Licença

Este projeto foi desenvolvido para fins industriais e de controle de estoque interno. Todos os direitos reservados.
