# Netlify Deploy Başlatma Rehberi

## Sorun: Deploy Otomatik Başlamadı

### Çözüm 1: Manuel Deploy Tetikleme

1. **Netlify Dashboard'a Git**
   - https://app.netlify.com
   - Site'inizi seçin: `ekomobil-campaign-tool`

2. **Deploys Sekmesine Git**
   - Sol menüden **"Deploys"** sekmesine tıklayın
   - Sağ üstte **"Trigger deploy"** butonuna tıklayın
   - **"Deploy site"** seçeneğini seçin
   - Veya **"Clear cache and deploy site"** seçeneğini kullanın (önerilen)

### Çözüm 2: GitHub Bağlantısını Kontrol Et

Eğer deploy başlamıyorsa, GitHub repository bağlantısı kopmuş olabilir:

1. **Site configuration** → **Build & deploy** sekmesine gidin
2. **Continuous Deployment** bölümünü kontrol edin
3. Eğer repository bağlı değilse:
   - **"Link repository"** butonuna tıklayın
   - GitHub repository'yi seçin: `Feyzaboz/-ekomobil-campaign-tool`
   - **"Save"** butonuna tıklayın

### Çözüm 3: Build Settings Kontrolü

1. **Site configuration** → **Build & deploy** → **Build settings**
2. Şu ayarların doğru olduğundan emin olun:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
3. **"Save"** butonuna tıklayın

### Çözüm 4: Netlify CLI ile Deploy (Terminal'den)

Eğer dashboard'dan yapamıyorsanız, terminal'den deploy edebilirsiniz:

```bash
# Netlify CLI kur (eğer yoksa)
npm install -g netlify-cli

# Login ol
netlify login

# Proje dizinine git
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool/frontend

# Build yap
npm run build

# Deploy et
netlify deploy --prod --dir=dist
```

## Hızlı Kontrol Listesi

- [ ] GitHub repository Netlify'a bağlı mı?
- [ ] Build settings doğru mu? (Base directory: frontend)
- [ ] Environment variables ayarlı mı? (VITE_API_URL)
- [ ] Son commit GitHub'a push edildi mi?

## Sorun Devam Ederse

1. **Netlify Support'a Başvur**
   - Dashboard → Help → Contact support

2. **Logları Kontrol Et**
   - Deploys sekmesinde deploy loglarını inceleyin
   - Hata mesajlarını kontrol edin

3. **Yeni Site Oluştur**
   - Eğer hiçbir şey işe yaramazsa, yeni bir Netlify site'i oluşturun
   - GitHub repository'yi tekrar bağlayın

