# GitHub Push Sorunu - Çözüm

## Sorun
Token'ın `repo` scope'una sahip olması gerekiyor. Mevcut token bu yetkiye sahip değil.

## Çözüm 1: Token'ı Yeniden Oluşturun (Önerilen)

1. **Token Oluştur:**
   - https://github.com/settings/tokens → "Generate new token (classic)"
   - Token adı: `ekomobil-push`
   - Expiration: 90 days
   - **Scopes: `repo` seçin** (tüm repo yetkileri) ✅
   - "Generate token" butonuna tıklayın
   - Token'ı kopyalayın

2. **Push Et:**
```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
git push https://YOUR_NEW_TOKEN@github.com/Feyzaboz/-ekomobil-campaign-tool.git main
```

## Çözüm 2: GitHub Desktop (Kolay)

1. GitHub Desktop'ı indirin: https://desktop.github.com
2. GitHub hesabınızla login olun
3. File → Clone Repository → `Feyzaboz/-ekomobil-campaign-tool`
4. Local path: `/Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool`
5. "Push origin" butonuna tıklayın

## Çözüm 3: SSH Key (Uzun Vadeli)

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
git remote set-url origin git@github.com:Feyzaboz/-ekomobil-campaign-tool.git
git push origin main
```

## ✅ Hazır Commit'ler

13 commit hazır ve push edilmeyi bekliyor:
- Fix brand offer error
- Netlify build configuration fixes
- Deployment guides
- _redirects file fixes
- ve daha fazlası...

