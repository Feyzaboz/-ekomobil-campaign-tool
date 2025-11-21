# Deployment Instructions

## 🚀 Hızlı Deploy Adımları

### 1. GitHub'a Push

```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

### 2. Backend Deploy (Railway - Önerilen)

1. https://railway.app adresine gidin ve hesap oluşturun
2. "New Project" → "Deploy from GitHub repo"
3. Repository'nizi seçin
4. "Add Service" → "Empty Service"
5. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Environment Variables:
   - `NODE_ENV=production`
   - `DATABASE_PATH=/app/data/db.json`
7. Deploy butonuna tıklayın
8. Backend URL'ini kopyalayın (örn: `https://ekomobil-backend.railway.app`)

### 3. Frontend Deploy (Netlify)

1. https://app.netlify.com adresine gidin ve hesap oluşturun
2. "Add new site" → "Import an existing project"
3. GitHub repository'nizi seçin
4. Build settings:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`
5. Environment variables ekleyin:
   - Key: `VITE_API_URL`
   - Value: Backend URL'iniz + `/api` (örn: `https://ekomobil-backend.railway.app/api`)
6. "Deploy site" butonuna tıklayın
7. Site URL'ini kopyalayın (örn: `https://doa-marketplace-cms.netlify.app`)

### 4. Custom Domain (Opsiyonel)

Netlify'da "Domain settings" → "Add custom domain" → `doa-marketplace-cms.netlify.app`

## ✅ Deploy Sonrası Kontrol

1. Backend health check: `https://your-backend-url.com/api/health`
2. Frontend: `https://doa-marketplace-cms.netlify.app`
3. Test: Marka ekleme/düzenleme işlemlerini test edin

## 🔧 Sorun Giderme

- Backend çalışmıyorsa: Railway logs'u kontrol edin
- Frontend API hatası: `VITE_API_URL` environment variable'ını kontrol edin
- CORS hatası: Backend'de CORS ayarlarını kontrol edin

