# Render.com Build Command Hatası Çözümü

## Sorun
```
bash: line 1: cd: backend: No such file or directory
```

## Neden?
Render.com'da **Root Directory** `backend` olarak ayarlandığında, tüm komutlar zaten `backend` dizininde çalışır. Bu yüzden build command'de `cd backend` yazmamalısınız.

## Çözüm

### Render.com Dashboard'da Build Command

**YANLIŞ:**
```
cd backend && npm install && npm run build
```

**DOĞRU:**
```
npm install && npm run build
```

### Render.com Dashboard'da Start Command

**YANLIŞ:**
```
cd backend && npm start
```

**DOĞRU:**
```
npm start
```

## Render.com Settings

1. **Root Directory**: `backend` (sadece bu, başında/sonunda boşluk yok)
2. **Build Command**: `npm install && npm run build` (`cd backend` YOK)
3. **Start Command**: `npm start` (`cd backend` YOK)

## render.yaml Kullanıyorsanız

`render.yaml` dosyası zaten doğru ayarlanmış:
- `rootDir: backend` → Render.com otomatik olarak backend dizinine geçer
- `buildCommand: npm install && npm run build` → `cd backend` yok
- `startCommand: npm start` → `cd backend` yok

## Kontrol

Render.com Dashboard'da:
1. Settings → Build & Deploy
2. Build Command alanında `cd backend` var mı kontrol edin
3. Varsa silin, sadece `npm install && npm run build` bırakın
4. Start Command alanında `cd backend` var mı kontrol edin
5. Varsa silin, sadece `npm start` bırakın

