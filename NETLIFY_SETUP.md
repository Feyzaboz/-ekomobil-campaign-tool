# Netlify Deploy Kurulumu

## Netlify CLI ile Deploy

### 1. Netlify CLI Login

Terminal'de şu komutu çalıştırın:
```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool
npx netlify-cli login
```

Bu komut tarayıcınızı açacak ve Netlify hesabınızla login olmanızı isteyecek.

### 2. Site Oluştur ve Deploy Et

Login olduktan sonra:
```bash
# Site oluştur
npx netlify-cli sites:create --name ekomobil-campaign-tool

# Deploy et
cd frontend
npm run build
cd ..
npx netlify-cli deploy --dir=frontend/dist --prod
```

### 3. GitHub'a Bağla (Otomatik Deploy)

Netlify dashboard'da:
1. https://app.netlify.com → "Add new site" → "Import an existing project"
2. GitHub'ı seçin
3. `Feyzaboz/-ekomobil-campaign-tool` repository'sini seçin
4. Build settings:
   - Base directory: `frontend`
   - Build command: `npm ci && npm run build`
   - Publish directory: `frontend/dist`
5. Environment variables:
   - `VITE_API_URL` = Backend URL + `/api`

## Netlify API Token ile (Alternatif)

Eğer CLI kullanmak istemiyorsanız, Netlify API token ile de deploy edebilirsiniz:

1. https://app.netlify.com/user/applications → "New access token"
2. Token'ı kopyalayın
3. Şu komutu çalıştırın:
```bash
export NETLIFY_AUTH_TOKEN=your_token_here
npx netlify-cli deploy --dir=frontend/dist --prod
```

## Manuel Deploy (Hızlı Test)

```bash
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool/frontend
npm run build
npx netlify-cli deploy --dir=dist --prod
```

