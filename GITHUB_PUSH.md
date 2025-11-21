# GitHub'a Push Etme - Hızlı Çözüm

Chrome'da GitHub'a login olduğunuz için, şu adımları izleyin:

## Yöntem 1: GitHub Personal Access Token (Önerilen)

1. **Token Oluştur:**
   - https://github.com/settings/tokens → "Generate new token (classic)"
   - Token adı: `ekomobil-push`
   - Expiration: 90 days (veya istediğiniz süre)
   - Scopes: `repo` (tüm repo yetkileri) ✅
   - "Generate token" butonuna tıklayın
   - Token'ı kopyalayın (sadece bir kez gösterilir!)

2. **Push Et:**
   Terminal'de şu komutu çalıştırın (YOUR_TOKEN yerine kopyaladığınız token'ı yapıştırın):

```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
git push https://YOUR_TOKEN@github.com/feyzaboz/ekomobil-campaign-tool.git main
```

## Yöntem 2: GitHub Desktop (Kolay)

1. GitHub Desktop uygulamasını indirin: https://desktop.github.com
2. GitHub hesabınızla login olun
3. Repository'yi açın: `ekomobil-campaign-tool`
4. "Push origin" butonuna tıklayın

## Yöntem 3: SSH Key (Uzun Vadeli)

1. SSH key oluşturun:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Public key'i GitHub'a ekleyin:
```bash
cat ~/.ssh/id_ed25519.pub
```
Bu çıktıyı kopyalayın ve https://github.com/settings/keys → "New SSH key" → yapıştırın

3. Push edin:
```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
git remote set-url origin git@github.com:feyzaboz/ekomobil-campaign-tool.git
git push origin main
```

## ✅ Push Sonrası

GitHub'a push ettikten sonra Netlify otomatik deploy başlatır. Kontrol edin:
- https://app.netlify.com → Site'nizi seçin → Deploys

