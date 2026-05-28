# Documentação de Arquitetura Front-end (Ecossistema React)

Este documento consolida todas as decisões arquiteturais, padrões de design (UX/UI), estratégias de segurança e ferramentas adotadas para o desenvolvimento da aplicação de gerenciamento de usuários, agora reestruturada para o ecossistema React.

---

## 1. Stack Tecnológica Completa

| Tecnologia / Biblioteca | Camada / Responsabilidade | Justificativa Técnica |
| :--- | :--- | :--- |
| **React 18+ (Functional Components & Hooks)** | Framework Core | Biblioteca líder de mercado, permitindo modularidade extrema, ecossistema vasto e reutilização de lógica através de Custom Hooks. |
| **Vite** | Ferramenta de Build / Bundler | Mantido pela sua compilação extremamente veloz baseada em ES Modules e HMR instantâneo para React. |
| **TypeScript** | Linguagem / Tipagem Estática | Garante segurança em tempo de compilação, tipagem estrita de usuários, permissões e payloads de API. |
| **React Router v6** | Roteamento SPA | Gerenciamento de histórico de navegação e proteção de rotas privadas (Private Routes / Protected Layouts). |
| **Zustand** | Gerenciamento de Estado | Substituto ideal para o Pinia no React: minimalista, não necessita de providers complexos (como o Redux) e gerencia a sessão de forma direta. |
| **Tailwind CSS + shadcn/ui** | Estilização e Componentes UI | A versão original do shadcn para React, garantindo controle visual total e acessibilidade nativa via Radix UI. |
| **Axios** | Cliente HTTP | Uso de interceptadores globais para manipulação de tokens, tratamento automático de JSON e captura de erros (ex: 401). |
| **React Hook Form + Zod** | Validação de Formulários | Substituto do VeeValidate no React. Evita re-renderizações desnecessárias e integra-se perfeitamente aos schemas do Zod. |
| **ESLint + Prettier** | Qualidade e Padronização | Garantia de código limpo, padronizado e com as regras específicas (eslint-plugin-react-hooks). |
| **Vitest + Cypress** | Estratégia de Testes | Vitest para testes unitários rápidos de lógica e hooks; Cypress para testes End-to-End (E2E) críticos (ex: fluxo de login). |

---

## 2. Arquitetura de Pastas Estruturada

```text
src/
 ┣ api/          # Configuração e instâncias do Axios (interceptadores de req/res)
 ┣ assets/       # Estilos globais (Tailwind) e assets estáticos
 ┣ components/   # Componentes UI reutilizáveis (gerados via shadcn/ui na pasta ui/)
 ┣ hooks/        # Custom Hooks para lógica compartilhada (useAuth, useUsers)
 ┣ layouts/      # Estruturas de página (AuthLayout, DashboardLayout)
 ┣ routes/       # Definição do React Router e componentes de PrivateRoute
 ┣ store/        # Stores do Zustand (useAuthStore.ts para gerenciamento de sessão)
 ┣ types/        # Interfaces e definições estritas do TypeScript
 ┗ pages/        # Páginas principais renderizadas pelas rotas
   ┣ Login.tsx
   ┣ Dashboard.tsx
   ┗ Users/
     ┣ UserList.tsx
     ┗ UserForm.tsx