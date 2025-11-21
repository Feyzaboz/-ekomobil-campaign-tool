# Railway'a GitHub Bağlama Rehberi

## Yöntem 1: Railway Dashboard'dan (En Kolay)

1. **Railway Dashboard'a Git:**
   - https://railway.app/dashboard
   - Login ol

2. **GitHub Bağlantısını Kontrol Et:**
   - Sağ üst köşedeki profil ikonuna tıkla
   - "Settings" → "Connected Accounts"
   - GitHub'ın bağlı olup olmadığını kontrol et

3. **GitHub Bağla:**
   - Eğer GitHub bağlı değilse:
     - "Connect GitHub" butonuna tıkla
     - GitHub authorization sayfasına yönlendirileceksin
     - "Authorize Railway" butonuna tıkla
     - Repository'lere erişim izni ver

4. **Yeni Proje Oluştur:**
   - Dashboard → "New Project"
   - "Deploy from GitHub repo" seçeneğini seç
   - `Feyzaboz/-ekomobil-campaign-tool` repository'sini görüyor olmalısın
   - Repository'yi seç ve "Deploy Now"

## Yöntem 2: Railway CLI ile

```bash
# Railway CLI'yi yükle
npm install -g @railway/cli

# Login ol
railway login

# Projeyi bağla
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
railway link

# Deploy et
railway up
```

## Yöntem 3: Manuel Deploy (GitHub Bağlantısı Olmadan)

Eğer GitHub bağlayamazsan, manuel olarak deploy edebilirsin:

1. **Railway Dashboard → New Project → Empty Project**

2. **GitHub Repo'yu Clone Et:**
   ```bash
   git clone https://github.com/Feyzaboz/-ekomobil-campaign-tool.git
   cd -ekomobil-campaign-tool
   ```

3. **Railway CLI ile Deploy:**
   ```bash
   railway login
   railway init
   railway link
   railway up
   ```

## Sorun Giderme

### GitHub Authorization Hatası
- Railway dashboard'dan çıkış yap ve tekrar giriş yap
- GitHub'da Railway app'inin izinlerini kontrol et: https://github.com/settings/applications
- Railway app'ini revoke edip tekrar authorize et

### Repository Görünmüyor
- GitHub'da repository'nin private/public olduğunu kontrol et
- Railway'ın repository'ye erişim izni olduğundan emin ol
- Repository adını kontrol et: `Feyzaboz/-ekomobil-campaign-tool`

### Railway CLI Hatası
- Node.js versiyonunu kontrol et: `node --version` (v18+ olmalı)
- Railway CLI'yi güncelle: `npm install -g @railway/cli@latest`

