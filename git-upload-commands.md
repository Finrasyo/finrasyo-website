# Git Upload Commands - FinRasyo

## Terminal'de Çalıştırılacak Komutlar

### 1. Proje Klasörüne Git
```bash
# Replit'te Shell açın ve proje klasörüne gidin
cd /home/runner/workspace
```

### 2. Git Repository Başlat
```bash
# Git repository başlat
git init

# GitHub repository URL'inizi ekleyin (KULLANICI_ADI'nızı değiştirin)
git remote add origin https://github.com/KULLANICI_ADI/finrasyo.git
```

### 3. Dosyaları Hazırla
```bash
# Tüm dosyaları staging area'ya ekle
git add .

# Commit mesajı ile kaydet
git commit -m "Initial commit: FinRasyo financial analysis platform"
```

### 4. GitHub'a Yükle
```bash
# Ana branch'i main olarak ayarla
git branch -M main

# GitHub'a yükle
git push -u origin main
```

## Tüm Komutlar Tek Seferde:
```bash
cd /home/runner/workspace
git init
git remote add origin https://github.com/KULLANICI_ADI/finrasyo.git
git add .
git commit -m "Initial commit: FinRasyo financial analysis platform"
git branch -M main
git push -u origin main
```

## Sorun Çözümü

### Authentication Error:
GitHub username ve password/token ister:
- Username: GitHub kullanıcı adınız
- Password: Personal Access Token kullanın

### Personal Access Token Oluşturma:
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token → Classic
4. Permissions: repo (full access)
5. Token'ı kopyalayın ve password olarak kullanın

### Remote Already Exists:
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADI/finrasyo.git
```

## Başarı Kontrolü
Upload tamamlandıktan sonra:
1. GitHub repository sayfanızı yenileyin
2. Dosyaların yüklendiğini kontrol edin
3. README.md görünüyor mu kontrol edin

## Sonraki Adım
GitHub upload tamamlandıktan sonra Vercel'e geçin!