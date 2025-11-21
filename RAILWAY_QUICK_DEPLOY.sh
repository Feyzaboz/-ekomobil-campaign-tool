#!/bin/bash

# Railway Quick Deploy Script
# Bu script Railway CLI kullanarak backend'i deploy eder

echo "🚀 Railway Backend Deploy Başlatılıyor..."
echo ""

# Railway CLI'yi npx ile çalıştır (global kurulum gerektirmez)
echo "📦 Railway CLI kontrol ediliyor..."

# Login kontrolü
if ! npx @railway/cli whoami 2>/dev/null; then
    echo "🔐 Railway'a login olun..."
    npx @railway/cli login
fi

# Backend dizinine git
cd backend || exit 1

echo ""
echo "📁 Backend dizininde Railway projesi oluşturuluyor..."
echo ""

# Railway projesi oluştur veya mevcut projeye bağlan
if [ ! -f ".railway" ]; then
    echo "🆕 Yeni Railway projesi oluşturuluyor..."
    npx @railway/cli init
else
    echo "🔗 Mevcut Railway projesine bağlanılıyor..."
    npx @railway/cli link
fi

echo ""
echo "🚀 Deploy başlatılıyor..."
echo ""

# Deploy et
npx @railway/cli up

echo ""
echo "✅ Deploy tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. Railway Dashboard'dan public URL'i alın"
echo "2. Netlify'da VITE_API_URL environment variable'ına ekleyin"
echo "3. Frontend'i yeniden deploy edin"

