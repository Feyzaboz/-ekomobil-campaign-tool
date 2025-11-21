# Netlify Environment Variables Ekleme Rehberi

## Adım Adım

### 1. Netlify Dashboard'a Giriş

1. https://app.netlify.com adresine git
2. Login ol

### 2. Site'inizi Seçin

1. Dashboard'da sitenizi bulun: **ekomobil-campaign-tool** (veya site adınız)
2. Site'in üzerine tıklayın

### 3. Site Settings'e Git

**Yöntem 1:**
- Site sayfasında sağ üstte **"Site settings"** butonuna tıklayın
- Veya sol menüden **"Site configuration"** → **"Environment variables"**

**Yöntem 2:**
- Site sayfasında üst menüden **"Site configuration"** sekmesine tıklayın
- Sol menüden **"Environment variables"** seçeneğine tıklayın

**Yöntem 3 (Eski Arayüz):**
- Site sayfasında **"Settings"** butonuna tıklayın
- Sol menüden **"Environment variables"** seçeneğine tıklayın

### 4. Environment Variable Ekle

1. **"Add a variable"** veya **"Add environment variable"** butonuna tıklayın
2. **Key**: `VITE_API_URL`
3. **Value**: `https://ekomobil-campaign-tool-backend.onrender.com/api`
   (Render.com'dan aldığınız backend URL'i + `/api`)
4. **Scopes**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Deploy Previews
   (Hepsini seçin)
5. **"Add"** veya **"Save"** butonuna tıklayın

### 5. Deploy'i Tetikle

1. **"Deploys"** sekmesine gidin
2. **"Trigger deploy"** → **"Deploy site"** butonuna tıklayın
3. Veya **"Clear cache and deploy site"** seçeneğini kullanın

## Görsel Rehber

```
Netlify Dashboard
  └── Your Site (ekomobil-campaign-tool)
      └── Site configuration (üst menü)
          └── Environment variables (sol menü)
              └── Add a variable
                  ├── Key: VITE_API_URL
                  ├── Value: https://YOUR_BACKEND_URL/api
                  └── Scopes: Production, Preview, Deploy Previews
```

## Alternatif: netlify.toml ile

Eğer dashboard'da bulamazsanız, `netlify.toml` dosyasına ekleyebilirsiniz:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_API_URL = "https://ekomobil-campaign-tool-backend.onrender.com/api"
```

**Not**: Bu yöntem güvenlik açısından daha az güvenli (URL public olur), ama çalışır.

## Kontrol

Deploy tamamlandıktan sonra:

1. Site'inizi açın: https://ekomobil-campaign-tool.netlify.app
2. F12 → Console'u açın
3. Network tab'ında API isteklerini kontrol edin
4. Backend URL'inin doğru olduğundan emin olun

