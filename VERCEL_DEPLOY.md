# Deploy no Vercel (Simples)

Guia rápido para deployar a aplicação no Vercel com Supabase.

## Pré-requisitos

✅ Código no GitHub  
✅ Conta no [Vercel](https://vercel.com) (pode usar GitHub para login)  
✅ Supabase configurado com banco criado (ver `SUPABASE_SETUP_SIMPLE.md`)  

## 🚀 Deploy em 3 Passos

### Passo 1: Sincronizar Git
Envie o código para o GitHub:
```bash
git add .
git commit -m "Pronto para Vercel"
git push origin main
```

### Passo 2: Conectar Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New" → "Project"
3. Selecione seu repositório no GitHub
4. Clique em "Import"

### Passo 3: Adicionar `DATABASE_URL`
Na tela "Configure Project":
1. Role até "Environment Variables"
2. Adicione uma variável:
   - **Name**: `DATABASE_URL`
   - **Value**: Cole a connection string do Supabase
     ```
     postgresql://[user]:[password]@[host]:5432/[database]?sslmode=require
     ```
3. Clique em "Add"
4. Clique em **"Deploy"**

## ✅ Pronto!

Após 2-5 minutos, você terá a aplicação live em `https://seu-projeto.vercel.app` 🎉

## 🔄 Próximas Atualizações

Basta fazer push para main que o Vercel faz deploy automático:
```bash
git push origin main
```

## 📋 Checklist

- [ ] Código no GitHub
- [ ] Supabase criado com migration SQL executada
- [ ] `DATABASE_URL` configurada no Vercel
- [ ] Deploy realizado
- [ ] App funcionando em `vercel.app`

## 🆘 Se algo der errado

**Frontend não carrega:**
- Verifique os logs: Vercel Dashboard → Project → Deployments → Logs

**APIs retornam erro:**
- Certifique-se que a migration SQL foi executada no Supabase
- Verifique `DATABASE_URL` está correta

**"DATABASE_URL is not defined":**
- Adicione a variável no Vercel
- Redeploy manualmente
