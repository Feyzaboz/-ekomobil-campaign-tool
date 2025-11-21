# Deployment Guide

## Backend Deployment (Railway/Heroku/Render)

### Railway (Önerilen)

1. Railway hesabı oluşturun: https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Repository'yi seçin
4. Root directory: `backend`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Environment variables:
   - `NODE_ENV=production`
   - `PORT` (Railway otomatik ayarlar)
   - `DATABASE_PATH=/app/data/db.json`

### Heroku

```bash
cd backend
heroku create ekomobil-campaign-tool-backend
heroku config:set NODE_ENV=production
git subtree push --prefix backend heroku main
```

### Render

1. Render hesabı oluşturun: https://render.com
2. "New Web Service"
3. GitHub repository'yi bağlayın
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

## Frontend Deployment (Netlify)

### Netlify CLI ile

```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Netlify Dashboard ile

1. https://app.netlify.com adresine gidin
2. "Add new site" → "Import an existing project"
3. GitHub repository'nizi seçin
4. Build settings:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`
5. Environment variables:
   - `VITE_API_URL`: Backend URL'iniz (örn: `https://your-backend.railway.app/api`)

## Environment Variables

### Backend
- `NODE_ENV=production`
- `PORT=3001` (veya platform tarafından sağlanan)
- `DATABASE_PATH=/app/data/db.json` (veya platform path'i)

### Frontend
- `VITE_API_URL=https://your-backend-url.com/api`

