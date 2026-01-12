# 🚀 GUIA RÁPIDO - DEPLOY NO VERCEL

## Método 1: CLI (5 minutos) ⚡

### Passo a Passo

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login
# → Abre navegador para autenticar

# 3. Ir para pasta do projeto
cd kanban-chatwoot

# 4. Deploy
vercel

# Responda às perguntas:
# ? Set up and deploy "~/kanban-chatwoot"? [Y/n] → Y
# ? Which scope do you want to deploy to? → Seu username
# ? Link to existing project? [y/N] → N
# ? What's your project's name? → kanban-chatwoot
# ? In which directory is your code located? → ./
# ? Want to override the settings? [y/N] → N

# 5. Adicionar variáveis de ambiente
vercel env add CHATWOOT_API_URL
# Cole: https://convertechat.com.br

vercel env add CHATWOOT_ACCOUNT_ID  
# Cole: 18

vercel env add CHATWOOT_API_TOKEN
# Cole: LAF6xQwZAYm6yRTVgVLaZDga

# 6. Deploy para produção
vercel --prod
```

**Pronto! Você receberá uma URL tipo:**
```
https://kanban-chatwoot-xxx.vercel.app
```

---

## Método 2: Interface Web (10 minutos) 🖱️

### Passo a Passo

1. **Acesse [vercel.com](https://vercel.com)** e faça login com GitHub

2. **Click em "Add New" → "Project"**

3. **Duas opções:**

   **A) Se tem Git configurado:**
   - Importe o repositório GitHub
   - Vercel detecta Next.js automaticamente
   
   **B) Se não tem Git:**
   - Use Vercel CLI (Método 1) ou
   - Crie repo no GitHub primeiro:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/kanban-chatwoot.git
   git push -u origin main
   ```

4. **Configure Environment Variables:**
   - Settings → Environment Variables
   - Adicione as 3 variáveis:
     ```
     CHATWOOT_API_URL = https://convertechat.com.br
     CHATWOOT_ACCOUNT_ID = 18
     CHATWOOT_API_TOKEN = LAF6xQwZAYm6yRTVgVLaZDga
     ```

5. **Deploy!**
   - Click em "Deploy"
   - Aguarde 1-2 minutos
   - Acesse a URL gerada

---

## ⚙️ Comandos Úteis

```bash
# Ver deployments
vercel ls

# Ver logs
vercel logs

# Remover projeto
vercel remove kanban-chatwoot

# Redeploy
vercel --prod

# Ver variáveis de ambiente
vercel env ls
```

---

## 🔧 Resolução de Problemas

### Erro: "Missing environment variables"
```bash
# Adicione novamente:
vercel env add CHATWOOT_API_URL production
vercel env add CHATWOOT_ACCOUNT_ID production
vercel env add CHATWOOT_API_TOKEN production

# Redeploy
vercel --prod
```

### Erro: "Build failed"
```bash
# Limpe cache e tente novamente
vercel --force
```

### Página em branco após deploy
- Abra DevTools (F12)
- Verifique erros no console
- Provavelmente faltam variáveis de ambiente

---

## 📱 Testando o Deploy

1. Acesse a URL fornecida pelo Vercel
2. Deve carregar em menos de 1 segundo
3. Teste:
   - ✅ Tabs de agentes funcionando
   - ✅ Drag & drop entre colunas
   - ✅ Criar novo card
   - ✅ Editar custom fields
   - ✅ Tema claro/escuro

---

## 🎉 Depois do Deploy

### Domínio Customizado (Opcional)

1. Va em: Settings → Domains
2. Adicione seu domínio: `kanban.seusite.com`
3. Configure DNS conforme instruções
4. SSL automático em poucos minutos

### Atualizações Automáticas

Se usou GitHub:
- Cada `git push` = deploy automático
- Preview em pull requests
- Rollback fácil

---

## 💰 Custos

**Vercel Free Tier:**
- ✅ 100GB bandwidth/mês
- ✅ Deployments ilimitados
- ✅ SSL automático
- ✅ Edge functions

**Suficiente para 99% dos casos!**

---

## 🚀 Próximos Passos

1. [ ] Fazer primeiro deploy
2. [ ] Testar todas funcionalidades
3. [ ] Configurar domínio próprio (opcional)
4. [ ] Compartilhar com equipe

**Tempo total: ~5 minutos** ⚡

---

Precisa de ajuda? Verifique o README.md completo!
