# Railway'da Repository Bulamama Sorunu - Çözüm

## Sorun
Railway'da "ekomobil-campaign-tool" yazdığınızda repository bulunamıyor.

## Neden?
GitHub repository adınız: **`-ekomobil-campaign-tool`** (tire ile başlıyor)

Railway'da arama yaparken tam adı kullanmanız gerekiyor.

## Çözüm Yöntemleri

### Yöntem 1: Tam Repository Adını Kullanın

Railway'da arama yaparken şunları deneyin:

1. **`-ekomobil-campaign-tool`** (tire ile başlayan)
2. **`Feyzaboz/-ekomobil-campaign-tool`** (tam GitHub path)
3. **`ekomobil-campaign-tool`** (tire olmadan - eğer Railway tire'yi ignore ediyorsa)

### Yöntem 2: GitHub'dan Direkt Bağlayın

1. Railway Dashboard → **Settings** → **Connected Accounts**
2. GitHub hesabınızın bağlı olduğundan emin olun
3. **New Project** → **Deploy from GitHub repo**
4. Repository listesinde **`-ekomobil-campaign-tool`** veya **`ekomobil-campaign-tool`** arayın
5. Repository'yi seçin

### Yöntem 3: Railway CLI ile Deploy (Önerilen)

Terminal'de şu komutları çalıştırın:

```bash
# Railway CLI'yi kurun (eğer yoksa)
npm install -g @railway/cli

# Railway'a login olun
railway login

# Proje dizinine gidin
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool

# Railway projesi oluşturun ve deploy edin
railway init
railway link  # Mevcut projeye bağlanmak için

# Backend'i deploy edin
cd backend
railway up
```

### Yöntem 4: Repository Adını Değiştirin (En Kolay)

GitHub'da repository adını değiştirerek tire'yi kaldırabilirsiniz:

1. GitHub → Repository → **Settings** → **General**
2. **Repository name** bölümünde **`ekomobil-campaign-tool`** yazın (tire olmadan)
3. **Rename** butonuna tıklayın
4. Railway'da tekrar arayın

**Not**: Repository adını değiştirdikten sonra local git remote'u güncelleyin:
```bash
git remote set-url origin https://github.com/Feyzaboz/ekomobil-campaign-tool.git
```

## Hızlı Çözüm (Railway CLI)

Aşağıdaki komutları terminal'de çalıştırın:

```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Login
railway login

# Proje dizinine git
cd /Users/feyzaboz/Documents/Cursor/ekomobil-campaign-tool/backend

# Yeni Railway projesi oluştur ve deploy et
railway init
railway up
```

Railway CLI otomatik olarak:
- Repository'yi bulur
- Build yapar
- Deploy eder
- Public URL verir

## Sorun Devam Ederse

1. Railway Dashboard'da **Settings** → **Connected Accounts** kontrol edin
2. GitHub hesabınızın bağlı olduğundan emin olun
3. GitHub'da repository'nin **private** olup olmadığını kontrol edin (Railway free plan'da private repo'lar için limit olabilir)

