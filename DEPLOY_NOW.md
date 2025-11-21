# 🚀 Şimdi Deploy Et!

## GitHub'a Push (Manuel)

Terminal'de şu komutu çalıştırın:

```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
git push origin main
```

Eğer authentication hatası alırsanız, GitHub Personal Access Token kullanın:

1. https://github.com/settings/tokens → "Generate new token (classic)"
2. `repo` scope'unu seçin
3. Token'ı kopyalayın
4. Şu komutu çalıştırın:
```bash
git push https://YOUR_TOKEN@github.com/feyzaboz/ekomobil-campaign-tool.git main
```

## Netlify Deploy Kontrolü

GitHub'a push ettikten sonra:

1. Netlify dashboard'a gidin: https://app.netlify.com
2. Site'nizi seçin
3. "Deploys" sekmesine gidin
4. "Trigger deploy" → "Deploy site" butonuna tıklayın
5. Build loglarını kontrol edin

### Netlify Build Ayarları (Kontrol Edin):

- **Base directory**: `frontend` ✅
- **Build command**: `npm ci && npm run build` ✅  
- **Publish directory**: `frontend/dist` ✅
- **Environment variable**: `VITE_API_URL` = Backend URL + `/api`

## Backend Deploy (Railway)

1. https://railway.app → "New Project" → "Deploy from GitHub repo"
2. Repository'nizi seçin
3. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Environment Variables:
   - `NODE_ENV=production`
   - `DATABASE_PATH=/app/data/db.json`

## ✅ Tamamlandı!

Frontend: https://doa-marketplace-cms.netlify.app
Backend: Railway URL'iniz

