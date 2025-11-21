# ✅ Deploy Checklist

## Tamamlanan İşlemler

- ✅ Backend Render.com'da deploy edildi: https://ekomobil-campaign-tool.onrender.com
- ✅ Frontend Netlify'da deploy edildi: https://ekomobil-campaign-tool.netlify.app
- ✅ Backend URL güncellendi: `https://ekomobil-campaign-tool.onrender.com/api`
- ✅ netlify.toml güncellendi
- ✅ API client güncellendi
- ✅ GitHub'a push edildi

## Kontrol Listesi

### Backend (Render.com)
- [ ] Backend çalışıyor mu? https://ekomobil-campaign-tool.onrender.com/api/health
- [ ] Response: `{"status":"ok"}` olmalı
- [ ] Markalar yüklü mü? https://ekomobil-campaign-tool.onrender.com/api/brands
- [ ] Kategoriler yüklü mü? https://ekomobil-campaign-tool.onrender.com/api/categories

### Frontend (Netlify)
- [ ] Site açılıyor mu? https://ekomobil-campaign-tool.netlify.app
- [ ] Markalar sayfası çalışıyor mu?
- [ ] Event ekleme çalışıyor mu?
- [ ] Backend'e bağlanıyor mu? (F12 → Network tab)

### Environment Variables
- [ ] Netlify'da `VITE_API_URL` = `https://ekomobil-campaign-tool.onrender.com/api` ayarlı mı?
- [ ] Veya netlify.toml dosyası güncel mi?

## Sorun Giderme

### Backend uyku modunda
- İlk request 30-60 saniye sürebilir
- Health check yapın: `curl https://ekomobil-campaign-tool.onrender.com/api/health`

### Frontend backend'e bağlanamıyor
- F12 → Console'da hata var mı?
- Network tab'ında API istekleri başarısız mı?
- CORS hatası var mı? (Backend'de CORS ayarlarını kontrol edin)

### Markalar görünmüyor
- Backend'de markalar var mı? `/api/brands` endpoint'ini kontrol edin
- Frontend'de API call başarılı mı? Network tab'ını kontrol edin

## Test Senaryoları

1. **Markalar Sayfası**
   - Markalar listeleniyor mu?
   - Cashback oranları görünüyor mu?
   - Filtreler çalışıyor mu?

2. **Kategoriler Sayfası**
   - Kategoriler listeleniyor mu?
   - Cashback oranları görünüyor mu?

3. **Kampanya Oluşturma**
   - Event ekleme çalışıyor mu?
   - Kampanya oluşturma çalışıyor mu?

## Başarı Kriterleri

✅ Tüm sayfalar açılıyor
✅ Backend API'ye bağlanıyor
✅ Markalar ve kategoriler görünüyor
✅ Event ekleme çalışıyor
✅ Hata yok (Console temiz)

