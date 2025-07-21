# Vercel Setup Guide - FinRasyo

GitHub upload tamamlandıktan sonra bu adımları takip edin:

## Adım 1: Vercel Hesabı
1. **vercel.com** adresine gidin
2. **"Continue with GitHub"** ile giriş yapın
3. GitHub hesabınıza erişim izni verin

## Adım 2: Project Import
1. Dashboard'da **"Import Project"** tıklayın
2. GitHub repository listesinde **finrasyo** bulun
3. **"Import"** butonuna tıklayın

## Adım 3: Build Settings
**Framework Preset:** Other
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Root Directory:** `/` (default)

## Adım 4: Environment Variables
**Environment Variables** sekmesinde ekleyin:

| Name | Value | Notes |
|------|-------|-------|
| DATABASE_URL | [Replit'den kopyala] | PostgreSQL connection |
| STRIPE_SECRET_KEY | [Replit'den kopyala] | Stripe private key |
| VITE_STRIPE_PUBLIC_KEY | [Replit'den kopyala] | Stripe public key |
| SESSION_SECRET | [Yeni oluştur] | Random string |

## Adım 5: Deploy
1. **"Deploy"** butonuna tıklayın
2. Build process başlayacak (2-3 dakika)
3. Başarılı olursa temporary URL alacaksınız

## Adım 6: Custom Domain
1. **Settings → Domains** gidin
2. **"Add Domain"** → `www.finrasyo.com`
3. Vercel size DNS records verecek
4. Bu records'ları Cloudflare'de güncelleyin

## DNS Records (Cloudflare'de)
```
Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy: DNS Only (gri bulut)
```

## Test
Temporary URL'de navigation test edin:
- Navbar linkleri çalışıyor mu?
- Sayfalar arası geçiş sorunsuz mu?
- Database bağlantısı var mı?

## Sorun Giderme
- **Build Error:** package.json scripts kontrol
- **Database Error:** Environment variables kontrol
- **404 Error:** vercel.json routing kontrol