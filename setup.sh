#!/bin/bash

echo "🚀 Kanban Chatwoot - Setup Automático"
echo "======================================"
echo ""

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "📥 Instale Node.js 18+ em: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo ""

# Instala dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas!"
echo ""

# Configura .env.local
if [ ! -f .env.local ]; then
    echo "⚙️ Configurando variáveis de ambiente..."
    cp .env.example .env.local
    echo ""
    echo "📝 Por favor, edite o arquivo .env.local com suas credenciais:"
    echo "   - CHATWOOT_API_URL"
    echo "   - CHATWOOT_ACCOUNT_ID"
    echo "   - CHATWOOT_API_TOKEN"
    echo ""
else
    echo "✅ .env.local já existe"
    echo ""
fi

# Pergunta se quer fazer deploy
echo "🚀 Deseja fazer deploy no Vercel agora? (y/n)"
read -r deploy

if [ "$deploy" = "y" ] || [ "$deploy" = "Y" ]; then
    # Verifica se Vercel CLI está instalado
    if ! command -v vercel &> /dev/null; then
        echo "📥 Instalando Vercel CLI..."
        npm i -g vercel
    fi
    
    echo ""
    echo "🚀 Iniciando deploy..."
    echo ""
    vercel
    
    echo ""
    echo "🎉 Deploy concluído!"
    echo ""
    echo "⚠️ IMPORTANTE: Configure as variáveis de ambiente no Vercel:"
    echo "   vercel env add CHATWOOT_API_URL"
    echo "   vercel env add CHATWOOT_ACCOUNT_ID"
    echo "   vercel env add CHATWOOT_API_TOKEN"
    echo ""
    echo "Depois rode: vercel --prod"
else
    echo ""
    echo "✅ Setup completo!"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Edite .env.local com suas credenciais"
    echo "   2. Rode: npm run dev"
    echo "   3. Acesse: http://localhost:3000"
    echo ""
    echo "🚀 Para deploy:"
    echo "   npm i -g vercel"
    echo "   vercel"
    echo ""
fi

echo "📖 Leia o README.md para mais informações"
echo ""
echo "🎉 Tudo pronto!"
