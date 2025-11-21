# GitHub'a Push Etme

GitHub'a push etmek için şu komutu çalıştırın:

```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
git push origin main
```

Eğer authentication hatası alırsanız:

1. GitHub Personal Access Token oluşturun: https://github.com/settings/tokens
2. Token ile push edin:
```bash
git push https://YOUR_TOKEN@github.com/feyzaboz/ekomobil-campaign-tool.git main
```

Veya SSH key kullanın:
```bash
git remote set-url origin git@github.com:feyzaboz/ekomobil-campaign-tool.git
git push origin main
```

