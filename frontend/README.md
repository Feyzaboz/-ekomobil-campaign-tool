# Ekomobil Campaign Tool - Frontend

## Netlify Deployment

Bu proje Netlify'a deploy edilebilir.

### Build Komutu
```bash
npm run build
```

### Publish Directory
```
dist
```

### Environment Variables
Netlify dashboard'da şu environment variable'ı ekleyin:
- `VITE_API_URL`: Backend API URL'i (örn: `https://your-backend.herokuapp.com/api`)

### Deploy Adımları

1. Netlify hesabınıza giriş yapın
2. "New site from Git" seçin
3. GitHub repository'nizi bağlayın
4. Build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
5. Environment variables ekleyin
6. Deploy butonuna tıklayın

