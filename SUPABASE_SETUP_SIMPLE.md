# Supabase Setup Guide

Esta aplicação agora está preparada para usar **Supabase** como banco de dados na nuvem. Aqui está como fazer o setup:

## 1. Criar um Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Sign In" ou "New Project"
3. Crie um novo projeto:
   - **Name**: Escolha um nome (ex: "barreiro-360")
   - **Password**: Crie uma senha segura
   - **Region**: Escolha a região mais próxima (ex: São Paulo - sa-east-1)
4. Aguarde a criação do projeto (2-3 minutos)

## 2. Copiar a Connection String

1. No dashboard do Supabase, vá para **Settings** → **Database**
2. Copie a **"Connection string"** (URI mode)
3. A string será algo como: `postgresql://[user]:[password]@[host]:[port]/[database]`

## 3. Configurar Variável de Ambiente

### Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL=postgresql://[seu-user]:[sua-senha]@[seu-host]:5432/[seu-banco]?sslmode=require
```

### Deploy em Produção

Quando fizer deploy (Netlify, Vercel, etc), adicione a variável de ambiente:
- **Variable Name**: `DATABASE_URL`
- **Value**: Cole a connection string do Supabase

## 4. Executar Migração SQL

1. No dashboard Supabase, vá para **SQL Editor**
2. Crie uma nova query
3. Cole o conteúdo do arquivo: `database/supabase-migration.sql`
4. Clique em "Run" ou execute o SQL

Isso vai criar todas as tabelas necessárias.

## 5. Inserir Dados de Exemplo (Opcional)

Para inserir dados de teste, execute o script:

```bash
pnpm db:seed
```

**Nota**: Em produção com Supabase, você pode querer adaptar o script para usar a API do Supabase em vez do SQLite.

## 6. Desenvolvemento Local com SQLite

Por padrão, em desenvolvimento a aplicação usa **SQLite** (arquivo local). Basta rodar:

```bash
pnpm dev
```

O banco será criado automaticamente em `database/dev.db`.

## 7. Deploy em Produção

### Com Netlify

1. [Connect Netlify](#open-mcp-popover)
2. Configure a variável `DATABASE_URL` no Netlify
3. Deploy a aplicação

### Com Vercel

1. [Connect Vercel](#open-mcp-popover)
2. Configure a variável `DATABASE_URL` no Vercel
3. Deploy a aplicação

## Resumo

- **Local**: SQLite (arquivo `database/dev.db`)
- **Produção**: Supabase (PostgreSQL)
- **Compatibilidade**: O código funciona em ambos automaticamente

A aplicação detecta automaticamente se deve usar SQLite (desenvolvimento) ou conectar a Supabase (produção via `DATABASE_URL`).
