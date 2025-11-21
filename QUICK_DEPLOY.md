# 🚀 Hızlı Deploy Rehberi

## Adım 1: GitHub Repository Oluştur

1. GitHub'da yeni bir repository oluşturun: `ekomobil-campaign-tool`
2. Repository URL'ini kopyalayın

## Adım 2: Kodu GitHub'a Push Et

```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
git remote add origin https://github.com/YOUR_USERNAME/ekomobil-campaign-tool.git
git branch -M main
git push -u origin main
```

## Adım 3: Backend Deploy (Railway)

1. https://railway.app → "Start a New Project" → "Deploy from GitHub repo"
2. Repository'nizi seçin
3. "Add Service" → "Empty Service"
4. Settings → Variables:
   - `NODE_ENV=production`
   - `DATABASE_PATH=/app/data/db.json`
5. Settings → Deploy:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Deploy butonuna tıklayın
7. Backend URL'ini kopyalayın (örn: `https://ekomobil-backend.railway.app`)

## Adım 4: Frontend Deploy (Netlify)

1. https://app.netlify.com → "Add new site" → "Import an existing project"
2. GitHub repository'nizi seçin
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`
4. Environment variables:
   - `VITE_API_URL`: Backend URL + `/api` (örn: `https://ekomobil-backend.railway.app/api`)
5. "Deploy site" butonuna tıklayın
6. Site URL'ini kopyalayın

## ✅ Tamamlandı!

Frontend: `https://doa-marketplace-cms.netlify.app`
Backend: `https://ekomobil-backend.railway.app`

