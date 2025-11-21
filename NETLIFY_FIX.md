# Netlify Deploy Sorunları ve Çözümleri

## Site Yansımadıysa Kontrol Edilecekler:

### 1. Netlify Dashboard'da Build Ayarları

Netlify dashboard'da şu ayarları kontrol edin:

**Build & deploy settings:**
- Base directory: `frontend` ✅
- Build command: `npm ci && npm run build` ✅
- Publish directory: `frontend/dist` ✅

### 2. Environment Variables

Netlify dashboard → Site settings → Environment variables:
- `VITE_API_URL`: Backend API URL'iniz (örn: `https://your-backend.railway.app/api`)

### 3. Build Logları Kontrol

Netlify dashboard → Deploys → En son deploy → Build log'ları kontrol edin.

### 4. Manuel Deploy

Eğer GitHub'dan deploy çalışmıyorsa, manuel deploy yapın:

```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool/frontend
npm run build
npx netlify-cli deploy --dir=dist --prod
```

### 5. GitHub'a Push

GitHub'a push etmek için:

```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
git push origin main
```

Eğer authentication hatası alırsanız, GitHub Personal Access Token kullanın.

