# Backend Production Deploy Rehberi

## Railway ile Deploy (Önerilen)

### 1. Railway Hesabı Oluştur
1. https://railway.app adresine git
2. "Start a New Project" butonuna tıkla
3. GitHub hesabınla login ol

### 2. Projeyi Railway'a Bağla
1. "New Project" → "Deploy from GitHub repo"
2. `Feyzaboz/-ekomobil-campaign-tool` repository'sini seç
3. "Deploy Now" butonuna tıkla

### 3. Backend Ayarlarını Yap
Railway otomatik olarak backend'i bulacak, ama ayarları kontrol et:

**Settings → Root Directory:**
- `backend` yaz

**Settings → Build Command:**
- `npm install && npm run build`

**Settings → Start Command:**
- `npm start`

### 4. Environment Variables Ekle
Railway dashboard → Variables sekmesine git:

```
NODE_ENV=production
PORT=3001
DATABASE_PATH=/app/data/db.json
```

### 5. Domain'i Aktifleştir
1. Settings → Generate Domain
2. Railway otomatik bir domain verecek (örn: `ekomobil-backend.up.railway.app`)
3. Bu URL'i kopyala - bu senin production backend URL'in!

### 6. Verileri Sync Et
Local backend'den production'a veri taşımak için:

```bash
cd backend
PRODUCTION_API_URL=https://ekomobil-backend.up.railway.app/api npm run sync-from-local
```

---

## Render ile Deploy (Alternatif)

### 1. Render Hesabı Oluştur
1. https://render.com adresine git
2. "Get Started for Free" butonuna tıkla
3. GitHub hesabınla login ol

### 2. Yeni Web Service Oluştur
1. Dashboard → "New +" → "Web Service"
2. GitHub repository'ni bağla: `Feyzaboz/-ekomobil-campaign-tool`
3. Ayarları yap:

**Name:**
- `ekomobil-campaign-backend`

**Root Directory:**
- `backend`

**Environment:**
- `Node`

**Build Command:**
- `npm install && npm run build`

**Start Command:**
- `npm start`

**Environment Variables:**
```
NODE_ENV=production
PORT=3001
DATABASE_PATH=/opt/render/project/src/backend/data/db.json
```

### 3. Deploy Et
1. "Create Web Service" butonuna tıkla
2. Render otomatik deploy başlatacak
3. Deploy tamamlandığında URL'i al (örn: `ekomobil-campaign-backend.onrender.com`)

### 4. Verileri Sync Et
```bash
cd backend
PRODUCTION_API_URL=https://ekomobil-campaign-backend.onrender.com/api npm run sync-from-local
```

---

## Netlify Functions ile Deploy (Alternatif)

Netlify Functions kullanarak backend'i Netlify'a deploy edebilirsin, ama bu daha karmaşık. Railway veya Render önerilir.

---

## Önemli Notlar

1. **Database:** JSON file storage kullanıyoruz, bu production'da sorun çıkarabilir. İleride PostgreSQL'e geçmek gerekebilir.

2. **CORS:** Backend'de CORS ayarları var, frontend URL'ini eklemeyi unutma:
   ```javascript
   // backend/src/index.ts
   app.use(cors({
     origin: ['https://ekomobil-campaign-tool.netlify.app', 'http://localhost:5176']
   }));
   ```

3. **Environment Variables:** Frontend'de `VITE_API_URL` environment variable'ını production backend URL'i ile ayarla:
   - Netlify dashboard → Site settings → Environment variables
   - `VITE_API_URL` = `https://your-backend-url.railway.app/api`

---

## Hızlı Başlangıç (Railway)

1. https://railway.app → Login
2. New Project → Deploy from GitHub
3. Repository seç → Deploy
4. Settings → Root Directory: `backend`
5. Variables → `NODE_ENV=production`, `PORT=3001`
6. Settings → Generate Domain
7. Domain URL'ini kopyala
8. Local'den sync et:
   ```bash
   cd backend
   PRODUCTION_API_URL=https://your-domain.railway.app/api npm run sync-from-local
   ```

