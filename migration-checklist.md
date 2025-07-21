# Vercel Migration Checklist - FinRasyo

## Ön Hazırlık ✅
- [x] vercel.json configuration dosyası oluşturuldu
- [x] Migration rehberi hazırlandı
- [ ] GitHub repository oluştur
- [ ] Kodları GitHub'a yükle

## GitHub Setup (15 dakika)
```bash
# Terminal'de proje klasöründe:
git init
git add .
git commit -m "Initial commit for Vercel migration"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/finrasyo.git
git push -u origin main
```

## Vercel Setup (30 dakika)
1. [ ] vercel.com'a git → "Continue with GitHub"
2. [ ] "Import Project" → finrasyo repository seç
3. [ ] Build settings: Framework Preset = "Other"
4. [ ] Build Command: `npm run vercel-build` 
5. [ ] Output Directory: `dist`

## Environment Variables Transfer
Vercel Dashboard → Settings → Environment Variables:
- [ ] `DATABASE_URL` (Replit'den kopyala)
- [ ] `STRIPE_SECRET_KEY` (Replit'den kopyala)  
- [ ] `VITE_STRIPE_PUBLIC_KEY` (Replit'den kopyala)
- [ ] `SESSION_SECRET` (yeni oluştur)

## Database Migration (2 saat)
1. [ ] Replit database backup al:
   ```bash
   pg_dump $DATABASE_URL > finrasyo_backup.sql
   ```
2. [ ] Vercel'de yeni database oluştur (Neon/PlanetScale)
3. [ ] Backup'ı yeni database'e restore et
4. [ ] Yeni DATABASE_URL'i environment variables'a ekle

## Domain Transfer (24 saat)
1. [ ] Vercel Dashboard → Project → Settings → Domains
2. [ ] "Add Domain" → www.finrasyo.com
3. [ ] Vercel'den DNS records al
4. [ ] Cloudflare'de DNS records güncelle:
   ```
   Type: CNAME
   Name: www  
   Content: cname.vercel-dns.com
   Proxy: DNS Only (gri bulut)
   ```

## Test & Go Live
- [ ] Temporary URL test: https://finrasyo-xxx.vercel.app
- [ ] Navigation test (navbar linkleri)
- [ ] Database connectivity test
- [ ] www.finrasyo.com DNS propagation bekle
- [ ] Final test: Navigation problemi çözüldü mü?

## Rollback Plan
Eğer sorun olursa:
1. Cloudflare DNS'de eski A record'ları restore et
2. 5-10 dakika bekle
3. Replit'e geri dön

## Tahmini Süre
- Hazırlık: 1 saat
- Deployment: 30 dakika  
- Database: 2 saat
- DNS: 24 saat
- **Toplam: 1-2 gün**

## İletişim
- Vercel docs: vercel.com/docs
- Migration rehber: /vercel-migration-guide.html
- Problem yaşarsan: build logs kontrol et