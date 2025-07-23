# Git Upload Komutları - FinRasyo

Repository URL: https://github.com/Finrasyo/finrasyo-website

## Terminal'de Çalıştırılacak Komutlar

```bash
# 1. Git'i başlat
git init

# 2. Tüm dosyaları ekle
git add .

# 3. İlk commit
git commit -m "FinRasyo projesi ilk yükleme"

# 4. Ana branch'i main yap
git branch -M main

# 5. Repository'yi bağla
git remote add origin https://github.com/Finrasyo/finrasyo-website.git

# 6. Dosyaları GitHub'a yükle
git push -u origin main
```

## Adım Adım Yapılacaklar

1. **Proje klasörüne git**
   - Terminal/Command Prompt aç
   - `cd` komutyla proje klasörüne git

2. **Komutları sırayla çalıştır**
   - Her komutu tek tek kopyala-yapıştır
   - Enter tuşuna bas
   - Sonraki komuta geç

3. **GitHub kullanıcı adı/şifre**
   - İlk push'ta kullanıcı adı: Finrasyo
   - Şifre: GitHub şifreniz (veya personal access token)

4. **Başarı kontrolü**
   - https://github.com/Finrasyo/finrasyo-website adresinde dosyalar görünmeli
   - Tüm proje dosyaları yüklenmiş olmalı

## Hata Durumları

- **"git not found"**: Git kurmanız gerekiyor
- **"Permission denied"**: GitHub kullanıcı adı/şifre kontrol
- **"Repository not found"**: URL kontrolü

## Sonraki Adım

Dosyalar yüklendikten sonra Netlify'de "Import from Git" yapacağız.