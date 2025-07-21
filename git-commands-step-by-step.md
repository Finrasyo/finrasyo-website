# Git Komutları - Adım Adım

Shell açık, hazırsınız! Bu komutları sırayla çalıştırın:

## Komut 1: Proje Klasörüne Git
```bash
cd /home/runner/workspace
```
**Ne yapıyor:** Proje klasörüne gidiyor
**Beklenen sonuç:** Hiçbir hata mesajı çıkmamalı

## Komut 2: Git Başlat
```bash
git init
```
**Ne yapıyor:** Git repository başlatıyor
**Beklenen sonuç:** "Initialized empty Git repository" mesajı

## Komut 3: GitHub Repository Bağla
```bash
git remote add origin https://github.com/KULLANICI_ADI/finrasyo.git
```
**⚠️ ÖNEMLİ:** KULLANICI_ADI yerine gerçek GitHub kullanıcı adınızı yazın!

**Örnek:** Eğer GitHub kullanıcı adınız "mehmet123" ise:
```bash
git remote add origin https://github.com/mehmet123/finrasyo.git
```

## Komut 4: Dosyaları Hazırla
```bash
git add .
```
**Ne yapıyor:** Tüm dosyaları commit için hazırlıyor
**Beklenen sonuç:** Hiçbir çıktı olmamalı (sessizce çalışır)

## Komut 5: Commit Oluştur
```bash
git commit -m "Initial commit: FinRasyo financial analysis platform"
```
**Ne yapıyor:** Dosyaları kaydediyor
**Beklenen sonuç:** "X files changed" gibi mesaj

## Komut 6: Ana Branch Ayarla
```bash
git branch -M main
```
**Ne yapıyor:** Ana branch'i main yapıyor
**Beklenen sonuç:** Hiçbir çıktı

## Komut 7: GitHub'a Yükle
```bash
git push -u origin main
```
**Ne yapıyor:** Kodu GitHub'a yükliyor
**Beklenen:** Username ve password isteyecek!

### Authentication İçin:
- **Username:** GitHub kullanıcı adınız
- **Password:** Personal Access Token (GitHub şifreniz DEĞİL!)

## Personal Access Token Alma:
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)  
3. Generate new token → Classic
4. Permissions: "repo" seç
5. Token'ı kopyala ve password olarak kullan

## Başarı İşaretleri:
✅ "Enumerating objects" mesajı
✅ "Writing objects: 100%" mesajı  
✅ "Branch 'main' set up to track" mesajı

## Hata Çözümü:
❌ "remote origin already exists" → `git remote remove origin` sonra tekrar dene
❌ "Authentication failed" → Personal Access Token kullan
❌ "Permission denied" → Repository public mi kontrol et

## Sonraki Adım:
Upload başarılı olduğunda GitHub repository sayfanızı yenileyin, dosyalar görünmelidir!