# Railway Backend Deploy Rehberi

## Adım Adım Railway Deployment

### 1. GitHub Repository Seçimi

Railway dashboard'da "New Project" → GitHub repository seçtiğinizde:

1. **Repository'yi seçin**: `ekomobil-campaign-tool` repository'sini bulun ve seçin
2. **"Deploy Now"** veya **"Add Service"** butonuna tıklayın

### 2. Service Ayarları

Repository seçildikten sonra Railway otomatik olarak deploy başlatır. Şimdi ayarları yapın:

#### A. Root Directory Ayarlama

1. Service'e tıklayın (veya Settings'e gidin)
2. **Settings** sekmesine gidin
3. **Root Directory** bölümünü bulun
4. **Root Directory** değerini `backend` olarak ayarlayın
5. **Save** butonuna tıklayın

#### B. Build & Start Commands

1. **Settings** → **Build** sekmesine gidin
2. **Build Command** alanına yazın:
   ```
   cd backend && npm install && npm run build
   ```
3. **Start Command** alanına yazın:
   ```
   cd backend && npm start
   ```

**VEYA** daha basit yöntem:

1. **Settings** → **Deploy** sekmesine gidin
2. **Root Directory**: `backend` olarak ayarlayın
3. Railway otomatik olarak `package.json`'daki `start` script'ini kullanacak

### 3. Environment Variables

1. **Variables** sekmesine gidin
2. Şu environment variable'ları ekleyin:

```
NODE_ENV=production
PORT=3001
```

**Not**: Railway otomatik olarak `PORT` environment variable'ını sağlar, ama ekleyebilirsiniz.

### 4. Deploy

1. Ayarları kaydettikten sonra Railway otomatik olarak yeniden deploy başlatır
2. **Deployments** sekmesinden deploy loglarını izleyebilirsiniz
3. Deploy başarılı olduğunda **Settings** → **Networking** sekmesinden public URL'i görebilirsiniz

### 5. Public URL Alma

1. **Settings** → **Networking** sekmesine gidin
2. **Generate Domain** butonuna tıklayın (eğer yoksa otomatik oluşturulur)
3. Public URL şu formatta olacak: `https://ekomobil-campaign-tool-backend-production.up.railway.app`

### 6. Health Check

Backend'in çalıştığını kontrol edin:

```bash
curl https://YOUR_RAILWAY_URL/api/health
```

Response: `{"status":"ok"}` olmalı.

## Sorun Giderme

### Build Hatası

- **Hata**: `npm: command not found`
  - **Çözüm**: Railway otomatik olarak Node.js yükler, ama `package.json`'da Node.js versiyonu belirtin:
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

### Port Hatası

- **Hata**: `Port already in use`
  - **Çözüm**: Railway otomatik olarak `PORT` environment variable'ını sağlar. Backend'de `process.env.PORT` kullanın:
  ```typescript
  const PORT = process.env.PORT || 3001;
  ```

### Database Path Hatası

- JSON database için persistent storage gerekebilir
- Railway'da **Volumes** ekleyebilirsiniz veya Railway'ın sağladığı storage'ı kullanın

## Önemli Notlar

1. **Root Directory**: Mutlaka `backend` olarak ayarlayın
2. **Build Command**: `cd backend && npm install && npm run build`
3. **Start Command**: `cd backend && npm start`
4. **Public URL**: Netlify'da `VITE_API_URL` environment variable'ına ekleyin

## Sonraki Adım

Backend deploy edildikten sonra:

1. Public URL'i kopyalayın
2. Netlify Dashboard → Environment Variables → `VITE_API_URL` = `https://YOUR_RAILWAY_URL/api`
3. Frontend'i yeniden deploy edin

