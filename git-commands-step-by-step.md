# GitHub Kurulum Komutları - Adım Adım

## 1. İlk Kurulum (Sadece bir kez yapılır)

```bash
# Proje klasörüne gidin
cd /path/to/your/project

# Git'i başlatın
git init

# Tüm dosyaları ekleyin
git add .

# İlk commit
git commit -m "İlk commit - FinRasyo projesi"

# Ana branch adını main yapın
git branch -M main

# GitHub repository'nizi bağlayın (KULLANICI_ADINIZ değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/finrasyo-website.git

# İlk push
git push -u origin main
```

## 2. Günlük Kullanım (Her değişiklik için)

```bash
# Değişiklikleri ekleyin
git add .

# Commit mesajı yazın
git commit -m "Açıklayıcı mesaj buraya"

# GitHub'a gönderin
git push
```

## 3. Netlify Build Ayarları

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Base directory:** (boş)

## 4. Örnek Günlük İş Akışı

1. Kodu değiştirin
2. Terminal açın
3. `git add .`
4. `git commit -m "Navbar rengini değiştirdim"`
5. `git push`
6. 2-3 dakika bekleyin
7. www.finrasyo.com otomatik güncellenecek

## 5. Faydalı Git Komutları

```bash
# Durum kontrolü
git status

# Commit geçmişi
git log --oneline

# Son değişiklikleri geri alma
git reset HEAD~1

# Branch oluşturma
git checkout -b yeni-feature

# Branch değiştirme
git checkout main
```

## 6. İlk Test İçin

Küçük bir değişiklik yapın (örneğin README.md'ye bir satır ekleyin):

```bash
echo "# FinRasyo - Otomatik deployment aktif!" >> README.md
git add .
git commit -m "Otomatik deployment testi"
git push
```

2-3 dakika sonra site güncellenecek!