# Barreiro 360 - Pronto para Vercel

Aplicação full-stack sem Prisma, otimizada para deploy no **Vercel** com **Supabase**.

## ⚡ Quick Start

### Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento (SQLite local)
pnpm dev

# Abrir http://localhost:8080
```

### Deploy Vercel + Supabase

**Passo 1:** Configurar Supabase
- [SUPABASE_SETUP_SIMPLE.md](./SUPABASE_SETUP_SIMPLE.md)

**Passo 2:** Deploy no Vercel
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

## 🏗️ Arquitetura

```
📁 Projeto
├─ 📁 client/          → React SPA (Vite)
│  ├─ 📁 pages/        → Rotas (Index, Dashboard, etc)
│  ├─ 📁 components/   → Componentes React
│  └─ 📁 hooks/        → Custom hooks
│
├─ 📁 server/          → Express API
│  ├─ index.ts         → Configuração e rotas
│  ├─ routes/          → Handlers de API
│  └─ database.ts      → Queries SQLite/Supabase
│
├─ 📁 database/        → SQL migrations
│  ├─ init.sql         → Schema SQLite
│  └─ supabase-migration.sql → Schema PostgreSQL
│
└─ 📄 vercel.json      → Configuração Vercel
```

## 📊 Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS + Radix UI
- **Backend**: Express.js
- **Database**: SQLite (dev) / Supabase PostgreSQL (prod)
- **Deploy**: Vercel

## 🗄️ Banco de Dados

### Desenvolvimento
- Usa **SQLite** (arquivo local `database/dev.db`)
- Sem setup necessário, funciona offline

### Produção
- Usa **Supabase** (PostgreSQL)
- Defina `DATABASE_URL` no Vercel

## 📝 Variáveis de Ambiente

```bash
# .env.local (desenvolvimento)
DATABASE_URL=postgresql://localhost/dev (opcional)
```

```
# Vercel Dashboard (produção)
DATABASE_URL=postgresql://[user]:[pass]@[host]:5432/[db]?sslmode=require
```

## 🚀 Build e Deploy

```bash
# Build local
pnpm build          # Frontend
pnpm build:server   # Backend Node.js

# Deploy (automático no Vercel via Git)
git push origin main
```

## 📚 Documentação

- [AGENTS.md](./AGENTS.md) - Arquitetura e desenvolvimento
- [SUPABASE_SETUP_SIMPLE.md](./SUPABASE_SETUP_SIMPLE.md) - Setup do banco
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Deploy

## 🛠️ Comandos Úteis

```bash
pnpm dev              # Rodar localmente
pnpm build            # Build frontend
pnpm build:server     # Build backend
pnpm start            # Rodar servidor de produção
pnpm test             # Testes
pnpm typecheck        # Validar TypeScript
pnpm db:seed          # Seed banco com dados
```

## 🚀 Status

✅ Sem Prisma  
✅ Pronto para Vercel  
✅ Supabase configurado  
✅ SQLite para desenvolvimento  
✅ Deploy automático via Git  

---

**Próximo passo?** Siga [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) para fazer deploy em 3 passos!
