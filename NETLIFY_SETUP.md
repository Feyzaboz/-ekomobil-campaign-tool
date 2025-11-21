# Netlify Deployment Setup

## Sorun: "Event kaydedilemedi" Hatası

Bu hata, frontend'in production backend'e bağlanamamasından kaynaklanıyor.

## Çözüm Adımları

### 1. Backend'i Railway'da Deploy Et

Backend henüz Railway'da deploy edilmemişse:

1. Railway Dashboard'a git: https://railway.app/dashboard
2. "New Project" → "Deploy from GitHub repo"
3. Repository'yi seç: `ekomobil-campaign-tool`
4. Root directory: `backend`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Environment variables ekle:
   - `NODE_ENV=production`
   - `PORT=3001` (Railway otomatik atar, ama ekleyebilirsin)

Backend URL'i şu formatta olacak: `https://ekomobil-campaign-tool-backend.up.railway.app`

### 2. Netlify'da Environment Variable Ekle

1. Netlify Dashboard → Site Settings → Environment Variables
2. Yeni variable ekle:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://ekomobil-campaign-tool-backend.up.railway.app/api`
   - **Scopes**: Production, Preview, Deploy Previews (hepsini seç)

### 3. Frontend'i Yeniden Deploy Et

1. Netlify Dashboard → Deploys
2. "Trigger deploy" → "Clear cache and deploy site"

### 4. CORS Ayarları (Backend'de)

Backend'de CORS'un Netlify domain'ini kabul ettiğinden emin ol:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://ekomobil-campaign-tool.netlify.app',
    'http://localhost:5176'
  ]
}));
```

### 5. Test Et

1. https://ekomobil-campaign-tool.netlify.app adresine git
2. F12 → Console'u aç
3. Event eklemeyi dene
4. Hata varsa console'da görünecek

## Alternatif: Netlify Redirects Kullan

Eğer Railway backend URL'i değişirse, `netlify.toml` dosyasındaki redirect'i güncelle:

```toml
[[redirects]]
  from = "/api/*"
  to = "YOUR_RAILWAY_BACKEND_URL/api/:splat"
  status = 200
  force = true
```

## Sorun Giderme

- **"Event kaydedilemedi" hatası**: Backend'e bağlanamıyor
  - Backend URL'ini kontrol et
  - Network tab'ında API isteklerini kontrol et
  - CORS hatası varsa backend'de CORS ayarlarını kontrol et

- **CORS hatası**: Backend'de Netlify domain'i allow list'e ekle

- **404 hatası**: Backend route'ları kontrol et (`/api/events` endpoint'i var mı?)
