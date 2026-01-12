# 🚀 Kanban Chatwoot - Vercel

Kanban moderno e rápido para gerenciar conversas do Chatwoot, organizado por agentes.

## ✨ Funcionalidades

- 📊 **Kanban por Agente** - Visualize conversas separadas por agente
- 🏷️ **Drag & Drop** - Arraste cards entre etiquetas
- ➕ **Criar Contatos** - Crie novos contatos com conversa inicial
- ✏️ **Editar Custom Fields** - Edite informações dos contatos
- 🌓 **Tema Escuro** - Alternância entre claro/escuro
- ⚡ **Ultra Rápido** - Deploy no Vercel com edge functions

## 🛠️ Instalação Local

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Chatwoot com API token

### Passo a Passo

1. **Clone ou extraia o projeto**
```bash
cd kanban-chatwoot
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Renomeie `.env.example` para `.env.local` e preencha:

```env
CHATWOOT_API_URL=https://convertechat.com.br
CHATWOOT_ACCOUNT_ID=18
CHATWOOT_API_TOKEN=LAF6xQwZAYm6yRTVgVLaZDga
```

4. **Rode o projeto localmente**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🚀 Deploy no Vercel (RECOMENDADO)

### Opção 1: Deploy via CLI (Mais Rápido)

1. **Instale o Vercel CLI**
```bash
npm i -g vercel
```

2. **Faça login no Vercel**
```bash
vercel login
```

3. **Deploy o projeto**
```bash
vercel
```

4. **Configure as variáveis de ambiente no Vercel**

Durante o deploy, o Vercel vai perguntar se você quer adicionar variáveis. Adicione:

```
CHATWOOT_API_URL=https://convertechat.com.br
CHATWOOT_ACCOUNT_ID=18
CHATWOOT_API_TOKEN=LAF6xQwZAYm6yRTVgVLaZDga
```

5. **Pronto!** Seu kanban estará disponível em uma URL como:
```
https://kanban-chatwoot-xxx.vercel.app
```

### Opção 2: Deploy via GitHub

1. **Crie um repositório no GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/kanban-chatwoot.git
git push -u origin main
```

2. **Acesse [vercel.com](https://vercel.com)**

3. **Clique em "Import Project"**

4. **Conecte seu repositório GitHub**

5. **Configure as variáveis de ambiente**
   - Vá em: Settings → Environment Variables
   - Adicione as 3 variáveis do Chatwoot

6. **Deploy automático!**
   - Cada push no GitHub = deploy automático
   - Preview branches disponíveis

## 📁 Estrutura do Projeto

```
kanban-chatwoot/
├── pages/
│   ├── index.js              → Página principal (Frontend React)
│   └── api/
│       ├── kanban.js         → GET dados completos do kanban
│       ├── contacts/
│       │   ├── [contactId].js  → GET contato específico
│       │   ├── create.js       → POST criar contato + conversa
│       │   └── update.js       → PUT atualizar custom fields
│       └── conversations/
│           └── move.js         → POST mover conversa entre etiquetas
├── lib/
│   └── chatwoot.js           → Cliente API do Chatwoot
├── .env.local                → Variáveis de ambiente (NÃO commitar)
├── .env.example              → Exemplo de variáveis
├── next.config.js            → Configuração do Next.js
└── package.json              → Dependências

```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `CHATWOOT_API_URL` | URL base do Chatwoot | `https://convertechat.com.br` |
| `CHATWOOT_ACCOUNT_ID` | ID da conta no Chatwoot | `18` |
| `CHATWOOT_API_TOKEN` | Token de acesso da API | `LAF6xQwZAYm6yRTVgVLaZDga` |

### Como obter o API Token

1. Acesse seu Chatwoot
2. Vá em: Profile Settings → Access Token
3. Copie o token gerado

## 🎯 Uso

### Interface Principal

1. **Tabs de Agentes** - Clique para ver conversas de cada agente
2. **Drag & Drop** - Arraste cards entre colunas para mudar etiquetas
3. **Novo Card** - Botão verde cria novo contato com conversa
4. **Editar** - Botão ✏️ em cada card edita custom fields
5. **Abrir Conversa** - Click no card abre no Chatwoot

### Criando um Novo Card

1. Click em "➕ Novo Card"
2. Preencha:
   - Nome (obrigatório)
   - Email, telefone (opcional)
   - Inbox (obrigatório)
   - Mensagem inicial (obrigatório)
   - Etiqueta (opcional)
3. Card aparece automaticamente no kanban!

## 🚀 Performance

### Comparativo de Velocidade

| Plataforma | Tempo de Carregamento |
|------------|----------------------|
| Google Apps Script | 2-5 segundos |
| **Vercel** | **100-300ms** ⚡ |

**10-50x mais rápido!**

## 🐛 Troubleshooting

### Erro: "Error loading data"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o API token tem permissões

### Cards não aparecem após criar
- Confirme que a mensagem inicial foi enviada
- Verifique se o inbox está correto

### Drag & Drop não funciona
- Recarregue a página
- Limpe o cache do navegador

## 📝 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento local (porta 3000)
npm run build    # Build para produção
npm run start    # Inicia servidor de produção
npm run lint     # Verifica código
```

## 🔄 Atualizações

Para atualizar o deploy no Vercel:

```bash
# Se usou CLI
vercel --prod

# Se usou GitHub
git push  # Deploy automático!
```

## 💡 Dicas de Otimização

1. **Cache**: O Vercel faz cache automático das rotas
2. **Edge Functions**: API routes rodam em edge (mais rápido)
3. **ISR**: Considere implementar Incremental Static Regeneration

## 🤝 Suporte

Problemas? Abra uma issue ou entre em contato!

## 📄 Licença

MIT License

---

**Desenvolvido com ❤️ usando Next.js + Vercel**
