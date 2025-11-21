# Render.com Backend Deploy Rehberi (Ücretsiz)

Railway free plan'ında sadece database deploy edebilirsiniz. Backend API için **Render.com** kullanacağız (ücretsiz).

## Render.com'a Deploy

### 1. Render.com'a Kayıt Ol

1. https://render.com adresine git
2. "Get Started for Free" butonuna tıkla
3. GitHub hesabınla kayıt ol

### 2. Yeni Web Service Oluştur

1. Render Dashboard → **New** → **Web Service**
2. **Connect GitHub** butonuna tıkla
3. Repository'yi seç: `Feyzaboz/-ekomobil-campaign-tool`
4. **Connect** butonuna tıkla

### 3. Service Ayarları

Aşağıdaki ayarları yapın:

- **Name**: `ekomobil-campaign-tool-backend`
- **Environment**: `Node`
- **Build Command**: 
  ```
  cd backend && npm install && npm run build
  ```
- **Start Command**: 
  ```
  cd backend && npm start
  ```
- **Root Directory**: `backend` (önemli!)

### 4. Environment Variables

**Environment Variables** sekmesine git ve ekle:

```
NODE_ENV=production
PORT=10000
```

**Not**: Render free plan'ında port otomatik olarak `PORT` environment variable'ından alınır.

### 5. Deploy

1. **Create Web Service** butonuna tıkla
2. Deploy otomatik başlar (5-10 dakika sürebilir)
3. Deploy tamamlandığında public URL alırsınız: `https://ekomobil-campaign-tool-backend.onrender.com`

### 6. Health Check

Deploy tamamlandıktan sonra:

```bash
curl https://ekomobil-campaign-tool-backend.onrender.com/api/health
```

Response: `{"status":"ok"}` olmalı.

## Netlify'da Environment Variable Güncelle

1. Netlify Dashboard → Site Settings → Environment Variables
2. `VITE_API_URL` değerini güncelle:
   ```
   https://ekomobil-campaign-tool-backend.onrender.com/api
   ```
3. Frontend'i yeniden deploy et

## Render.com Free Plan Özellikleri

- ✅ Ücretsiz
- ✅ 750 saat/ay (yeterli)
- ✅ Otomatik deploy (GitHub push)
- ✅ SSL sertifikası (otomatik)
- ⚠️ 15 dakika idle sonrası uyku modu (ilk request'te 30-60 saniye bekleme)

## Render.com'da CORS Ayarları

Backend'de CORS ayarlarını güncelleyin:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://ekomobil-campaign-tool.netlify.app',
    'http://localhost:5176'
  ]
}));
```

## Alternatif: Fly.io (Daha Hızlı)

Eğer Render.com yavaş gelirse, Fly.io kullanabilirsiniz:

1. https://fly.io → Sign up
2. Fly CLI kur: `curl -L https://fly.io/install.sh | sh`
3. Login: `fly auth login`
4. Deploy: 
   ```bash
   cd backend
   fly launch
   ```

Fly.io free plan'ında uyku modu yok, daha hızlı.

