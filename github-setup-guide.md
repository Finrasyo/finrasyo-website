# GitHub Repository Setup - FinRasyo

## Adım 1: GitHub Repository Oluşturma

1. **GitHub'a git**: https://github.com
2. **Sign in** ile giriş yapın
3. **"New repository"** butonuna tıklayın (yeşil buton, sağ üstte)
4. **Repository details**:
   - Repository name: `finrasyo`
   - Description: `Financial ratio analysis platform for BIST companies`
   - Visibility: **Public** (ücretsiz hosting için gerekli)
   - ✅ Add a README file
   - ✅ Add .gitignore: Node
   - License: MIT License
5. **"Create repository"** tıklayın

## Adım 2: Local Git Setup

Terminal'i açın ve proje klasörünüze gidin:

```bash
# Mevcut proje klasöründe
cd /path/to/your/finrasyo-project

# Git başlat
git init

# Remote repository bağlantısı (KULLANICI_ADI'nızı değiştirin)
git remote add origin https://github.com/KULLANICI_ADI/finrasyo.git

# Staging area'ya dosyaları ekle
git add .

# Commit oluştur
git commit -m "Initial commit: FinRasyo financial analysis platform"

# Ana branch'i main olarak ayarla
git branch -M main

# GitHub'a yükle
git push -u origin main
```

## Adım 3: Dosya Kontrolü

Yüklenmemesi gereken dosyalar için .gitignore kontrol edin:

```
node_modules/
dist/
.env
.env.local
.replit
*.log
.DS_Store
```

## Adım 4: Repository URL

GitHub repository URL'iniz şu şekilde olacak:
`https://github.com/KULLANICI_ADI/finrasyo`

Bu URL'i Vercel'de kullanacaksınız.

## Sorun Giderme

**Problem**: "remote origin already exists"
**Çözüm**: 
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADI/finrasyo.git
```

**Problem**: Authentication error
**Çözüm**: GitHub Personal Access Token kullanın (Settings → Developer settings → Personal access tokens)

## Sonraki Adım

Repository hazır olduğunda Vercel'e geçin:
1. vercel.com → Continue with GitHub
2. Import finrasyo repository
3. Deploy settings configure edin