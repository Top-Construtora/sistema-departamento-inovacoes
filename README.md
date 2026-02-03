# Sistema de Inovações e Tecnologia

![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/Licença-Privado-red)

Sistema de gestão para departamentos de inovação e tecnologia. Gerenciamento de projetos, demandas internas, chamados de suporte, portfólio, sistemas de acesso com cofre de credenciais, identidade visual e notas globais. Monorepo com frontend React e backend Express, ambos em TypeScript.

---

## Funcionalidades

### Projetos
- Cadastro e acompanhamento de **projetos internos**
- Tipos: sistema interno, automação, pesquisa, integração, melhoria
- Status: ideia, em análise, em desenvolvimento, em testes, em produção, arquivado
- Classificação de **risco** (baixo, médio, alto)
- Atribuição de **equipe** por projeto

### Demandas Internas
- **Quadro Kanban** com drag & drop (@dnd-kit)
- Tipos: bug, melhoria, nova feature, estudo, suporte interno, documentação
- Prioridades: baixa, média, alta, crítica
- Status: a fazer, em andamento, em validação, concluída

### Chamados de Suporte
- **Protocolo automático** (YYYY######)
- Categorias: problema, melhoria, requisição de acesso, automação, consultoria
- Status completo: novo, triagem, em atendimento, aguardando usuário, validação, concluído, cancelado, reaberto
- Sistema de **comentários** por chamado

### Portfólio do Departamento
- Vitrine de **projetos realizados** com imagens e equipe
- Categorias: automação, sistema interno, aplicativo, infra, pesquisa, integração, dashboard
- Controle de **versões** por projeto
- Galeria de **imagens**

### Sistemas de Acesso & Credenciais
- Cadastro de **sistemas e plataformas** utilizados
- **Cofre de credenciais** com criptografia AES-256-GCM
- Ambientes: produção, homologação, desenvolvimento
- **Log de auditoria** de acessos às credenciais
- Tipos: plataforma de curso, desenvolvimento, infra, comunicação, analytics, cloud, banco de dados, API externa

### Identidade Visual
- Gestão de **logos** (principal, horizontal, vertical, ícone, monocromático, P&B, negativo, simplificado)
- **Paleta de cores** com hex, RGB e descrição
- **Fontes tipográficas** por uso (título, subtítulo, corpo, destaque, código, decorativo)
- **Templates de arquivos** (slide, documento, assinatura de e-mail, papel timbrado, cartão de visita, banner, post social, relatório)

### Notas Globais
- Sistema de **chat/notas** da equipe
- Upload de **anexos** por nota
- Comunicação interna do departamento

### Dashboard & Métricas
- **Indicadores** consolidados do departamento
- Gráficos interativos (**Recharts**)
- Métricas de projetos, demandas e chamados

### Gestão de Usuários
- **3 perfis**: Líder, Analista, Externo
- Definição de senha no primeiro acesso
- Controle de acesso por perfil

### Auditoria
- **Log completo** de todas as ações do sistema
- Rastreamento de acessos a credenciais

---

## Arquitetura

```
sistema-inovacoes/
├── frontend/          # React 18 + Vite + TypeScript
├── backend/           # Express 4 + TypeScript + Supabase (ESM)
└── package.json       # Scripts do monorepo (concurrently)
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18.x
- Conta no [Supabase](https://supabase.com/) com projeto configurado

## Instalação

```bash
# Instalar todas as dependências (raiz + frontend + backend)
npm run install:all
```

## Executando

```bash
# Frontend + Backend simultaneamente (recomendado)
npm run dev

# Apenas frontend (http://localhost:5173)
npm run dev:frontend

# Apenas backend (http://localhost:3333)
npm run dev:backend
```

## Build

```bash
# Build completo (frontend + backend)
npm run build

# Build individual
npm run build:frontend    # Gera dist/ estático
npm run build:backend     # Compila TypeScript para dist/
```

## Testes

```bash
# Backend (Jest)
cd backend && npm test
cd backend && npm run test:watch
cd backend && npm run test:coverage
```

---

## Frontend

### Estrutura

```
frontend/src/
├── components/         # 12 componentes reutilizáveis
│   ├── ChamadoForm/           # Formulário de chamado
│   ├── DemandaForm/           # Formulário de demanda
│   ├── DefinirSenhaModal/     # Modal de definição de senha
│   ├── Kanban/                # Quadro Kanban com drag & drop
│   ├── Layout/                # Layout principal (Header + Sidebar)
│   └── ui/                    # Componentes de UI base
├── pages/              # 14 páginas
│   ├── Login/                 # Autenticação
│   ├── Home/                  # Página inicial
│   ├── Dashboard/             # Dashboard com métricas
│   ├── Projetos/              # Lista de projetos
│   ├── ProjetoDetalhes/       # Detalhes do projeto
│   ├── Demandas/              # Quadro Kanban de demandas
│   ├── Chamados/              # Lista de chamados
│   ├── ChamadoDetalhes/       # Detalhes do chamado
│   ├── Portfolio/             # Portfólio do departamento
│   ├── SistemasAcesso/        # Sistemas e credenciais
│   ├── SistemaDetalhes/       # Detalhes do sistema
│   ├── IdentidadeVisual/      # Gestão de identidade visual
│   ├── Notas/                 # Notas globais da equipe
│   └── Usuarios/              # Gestão de usuários
├── services/           # 13 serviços de API
│   ├── api.ts                 # Cliente Axios centralizado
│   ├── auth.service.ts
│   ├── usuarios.service.ts
│   ├── projetos.service.ts
│   ├── demandas.service.ts
│   ├── chamados.service.ts
│   ├── portfolio.service.ts
│   ├── sistemasAcesso.service.ts
│   ├── identidadeVisual.service.ts
│   ├── metrics.service.ts
│   ├── audit.service.ts
│   ├── upload.service.ts
│   └── notas.service.ts
├── contexts/
│   └── AuthContext.tsx         # Autenticação + JWT
├── types/
│   └── index.ts               # Todas as definições TypeScript
├── utils/                     # Utilitários
└── styles/                    # Estilos globais CSS
```

### Principais Bibliotecas

| Biblioteca | Uso |
|---|---|
| **React 18** | Framework UI |
| **Vite** | Build tool com HMR |
| **TypeScript** | Tipagem estática |
| **React Router DOM** | Roteamento SPA |
| **Axios** | Cliente HTTP com interceptors |
| **Recharts** | Gráficos e visualizações |
| **@dnd-kit** | Drag & drop (Kanban) |
| **Lucide React** | Ícones SVG |

### Configuração de Ambiente

O frontend usa proxy do Vite em desenvolvimento:

```typescript
// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3333',
      changeOrigin: true,
    },
  },
}
```

Variáveis de ambiente (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3333/api
```

---

## Backend

### Estrutura

```
backend/src/
├── server.ts            # Entry point (porta 3333)
├── app.ts               # Configuração Express (CORS, Helmet, rotas)
├── config/
│   └── env.ts           # Variáveis de ambiente
├── controllers/         # 14 controllers
│   ├── authController.ts
│   ├── usuarioController.ts
│   ├── projetoController.ts
│   ├── demandaController.ts
│   ├── chamadoController.ts
│   ├── portfolioController.ts
│   ├── sistemasAcessoController.ts
│   ├── identidadeVisualController.ts
│   ├── metricsController.ts
│   ├── auditController.ts
│   ├── uploadController.ts
│   └── notasController.ts
├── routes/              # 14 arquivos de rotas
│   ├── auth.ts
│   ├── usuarios.ts
│   ├── projetos.ts
│   ├── demandas.ts
│   ├── chamados.ts
│   ├── portfolio.ts
│   ├── sistemasAcesso.ts
│   ├── identidadeVisual.ts
│   ├── metrics.ts
│   ├── audit.ts
│   ├── upload.ts
│   ├── notas.ts
│   └── index.ts
├── services/            # 13 serviços de negócio
│   ├── authService.ts
│   ├── usuarioService.ts
│   ├── projetoService.ts
│   ├── demandaService.ts
│   ├── chamadoService.ts
│   ├── portfolioService.ts
│   ├── sistemasAcessoService.ts
│   ├── identidadeVisualService.ts
│   ├── metricsService.ts
│   ├── auditService.ts
│   ├── uploadService.ts
│   └── notasService.ts
├── middlewares/          # 4 middlewares
│   ├── authMiddleware.ts      # JWT + controle de perfil
│   ├── errorHandler.ts        # Handler global de erros
│   ├── rateLimiter.ts         # Rate limiting
│   └── upload.ts              # Multer (upload de arquivos)
└── database/
    └── migrations/      # 11 scripts SQL
```

### Endpoints da API

#### Autenticação (`/api/auth`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/login` | Login com email/senha |
| POST | `/definir-senha` | Definir senha no primeiro acesso |

#### Usuários (`/api/usuarios`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar usuários |
| POST | `/` | Criar usuário |
| GET | `/:id` | Detalhes do usuário |
| PUT | `/:id` | Atualizar usuário |
| DELETE | `/:id` | Remover usuário |

#### Projetos (`/api/projetos`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar projetos |
| POST | `/` | Criar projeto |
| GET | `/:id` | Detalhes do projeto |
| PUT | `/:id` | Atualizar projeto |
| DELETE | `/:id` | Remover projeto |

#### Demandas (`/api/demandas`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar demandas |
| POST | `/` | Criar demanda |
| PUT | `/:id` | Atualizar demanda |
| DELETE | `/:id` | Remover demanda |

#### Chamados (`/api/chamados`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar chamados |
| POST | `/` | Criar chamado (protocolo automático) |
| GET | `/:id` | Detalhes do chamado |
| PUT | `/:id` | Atualizar chamado |
| DELETE | `/:id` | Remover chamado |

#### Portfólio (`/api/portfolio`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar projetos do portfólio |
| POST | `/` | Criar item do portfólio |
| GET | `/:id` | Detalhes do item |
| PUT | `/:id` | Atualizar item |
| DELETE | `/:id` | Remover item |

#### Sistemas de Acesso (`/api/sistemas-acesso`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar sistemas |
| POST | `/` | Criar sistema |
| GET | `/:id` | Detalhes com credenciais |
| PUT | `/:id` | Atualizar sistema |
| DELETE | `/:id` | Remover sistema |

#### Identidade Visual (`/api/identidade-visual`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Configuração completa |
| PUT | `/` | Atualizar configuração |
| POST | `/logos` | Upload de logo |
| POST | `/templates` | Upload de template |

#### Outros
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/metrics` | Métricas do dashboard |
| GET | `/api/audit` | Logs de auditoria |
| POST | `/api/upload` | Upload de arquivos |
| CRUD | `/api/notas` | Notas globais da equipe |
| GET | `/api/health` | Health check |

### Variáveis de Ambiente

Crie `backend/.env`:

```env
# Servidor
PORT=3333
NODE_ENV=development

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key

# JWT
JWT_SECRET=sua-chave-secreta
JWT_EXPIRES_IN=7d
```

---

## Banco de Dados

### Tabelas principais

| Grupo | Tabelas |
|---|---|
| **Usuários** | `usuarios` (líder, analista, externo) |
| **Projetos** | `projetos`, `projeto_equipe` |
| **Demandas** | `demandas` |
| **Chamados** | `chamados`, `chamado_comentarios` |
| **Portfólio** | `portfolio_projetos`, `portfolio_equipe`, `portfolio_imagens`, `portfolio_versoes` |
| **Sistemas** | `sistemas_acesso`, `credenciais`, `credenciais_log` |
| **Identidade** | `identidade_visual_config`, `logos`, `paleta_cores`, `fontes_tipograficas`, `templates_arquivos` |
| **Sistema** | `notas`, `nota_anexos`, `audit_logs` |

### Perfis de Usuário

| Perfil | Acesso |
|---|---|
| **Líder** | Acesso total: usuários, projetos, demandas, chamados, sistemas, identidade visual, métricas |
| **Analista** | Acesso interno: projetos, demandas, chamados, portfólio, notas |
| **Externo** | Acesso limitado: visualização de chamados e portfólio |

### Segurança de Credenciais

As credenciais armazenadas no cofre utilizam criptografia **AES-256-GCM**. Todo acesso é registrado no `credenciais_log` com IP, data e usuário.

---

## Segurança

- **Helmet** para headers HTTP seguros
- **CORS** configurado para o frontend
- **Rate Limiting** contra abuso de requisições
- **JWT** para autenticação stateless (expiração 7 dias)
- **bcryptjs** para hash de senhas
- **AES-256-GCM** para criptografia de credenciais
- **Middleware de autorização** por perfil (líder, analista, externo)
- **Auditoria completa** de ações sensíveis

## Deploy

| Componente | Plataforma |
|---|---|
| Frontend | Vercel (build estático) |
| Backend | Render / servidor Node.js |
| Banco de dados | Supabase (PostgreSQL gerenciado) |
| Arquivos | Supabase Storage |

```bash
# Build de produção
npm run build

# Iniciar backend em produção
cd backend && npm start
```

---

Desenvolvido por **GIO**
