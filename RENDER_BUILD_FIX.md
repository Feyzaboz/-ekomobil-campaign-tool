# Render.com Build Hatası Çözümü

## Sorun
Render.com'da build başarısız oluyor.

## Çözüm: Render.com Build Settings

Render.com dashboard'da şu ayarları yapın:

### 1. Root Directory
- **Root Directory**: `backend` olarak ayarlayın
- Settings → Build & Deploy → Root Directory: `backend`

### 2. Build Command
- **Build Command**: 
  ```
  npm install && npm run build
  ```

### 3. Start Command
- **Start Command**: 
  ```
  npm start
  ```

### 4. Environment Variables
- `NODE_ENV` = `production`
- `PORT` = `10000` (Render.com otomatik atar, ama ekleyebilirsiniz)

## Önemli Notlar

1. **Root Directory**: Render.com'da service oluştururken veya settings'den `backend` olarak ayarlayın
2. **Build Command**: `cd backend` eklemeyin, çünkü Root Directory zaten `backend`
3. **Start Command**: `cd backend` eklemeyin

## Alternatif: render.yaml Kullanımı

Eğer `render.yaml` kullanıyorsanız, dosya repository root'unda olmalı ve Root Directory ayarı gerekmez.

## Build Loglarını Kontrol

Render.com dashboard'da:
1. Service'inizi seçin
2. **Logs** sekmesine gidin
3. Build loglarını inceleyin
4. Hata mesajlarını kontrol edin

## Yaygın Hatalar

### "Cannot find module"
- **Çözüm**: `npm install` çalıştığından emin olun
- Build command'de `npm install` olmalı

### "Command failed"
- **Çözüm**: Build command'i kontrol edin
- `cd backend` eklemeyin (Root Directory zaten backend)

### "Port already in use"
- **Çözüm**: `PORT` environment variable'ını kontrol edin
- Render.com otomatik atar, `process.env.PORT` kullanın

## Test

Deploy başarılı olduktan sonra:

```bash
curl https://ekomobil-campaign-tool.onrender.com/api/health
```

Response: `{"status":"ok"}` olmalı.

