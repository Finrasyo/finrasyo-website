import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, generatePasswordResetToken, verifyPasswordResetToken, comparePasswords, hashPassword } from "./auth";
import { z } from "zod";
import { 
  insertCompanySchema, 
  insertFinancialDataSchema,
  insertReportSchema,
  insertPaymentSchema
} from "@shared/schema";
import { getCompanyFinancials, getAllCompaniesFinancials } from "./api/company-financials";
import Stripe from 'stripe';
import crypto from 'crypto';
import path from 'path';

const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10)
});

// Stripe client kurulumu
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY çevre değişkeni eksik");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // CRITICAL FIX: Server-side routing for Cloudflare proxy issue
  app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
  
  app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
  
  app.get('/how-it-works', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
  
  app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
  
  // Şifre sıfırlama endpointleri
  app.post("/api/request-password-reset", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "E-posta adresi gereklidir" });
      }
      
      console.log("Şifre sıfırlama isteği yapıldı:", email);
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        console.log("Kullanıcı bulunamadı:", email);
        // Güvenlik nedeniyle kullanıcı bulunamasa bile başarılı yanıt döndür
        return res.status(200).json({ 
          message: "Şifre sıfırlama talimatları e-posta adresinize gönderilmiştir" 
        });
      }
      
      console.log("Kullanıcı bulundu:", user.username, user.id);
      
      // Token oluştur
      const token = generatePasswordResetToken(user.id);
      
      // Gerçek uygulamada burada e-posta gönderilecek
      // sendEmail(email, `Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
      // ${process.env.SITE_URL || 'http://localhost:5000'}/reset-password?token=${token}`);
      
      console.log(`Şifre sıfırlama token'ı (gerçek uygulamada mail ile gönderilecek): ${token}`);
      console.log(`Şifre sıfırlama bağlantısı: http://localhost:5000/reset-password?token=${token}`);
      
      res.status(200).json({ 
        message: "Şifre sıfırlama talimatları e-posta adresinize gönderilmiştir",
        // DEV ONLY: Gerçek uygulamada bu token kullanıcıya gösterilmez
        token: token
      });
    } catch (error: any) {
      console.error("Şifre sıfırlama hatası:", error);
      res.status(500).json({ message: "Şifre sıfırlama isteği başarısız oldu" });
    }
  });
  
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token ve yeni şifre gereklidir" });
      }
      
      // Token'ı doğrula
      const userId = verifyPasswordResetToken(token);
      
      if (!userId) {
        return res.status(400).json({ message: "Geçersiz veya süresi dolmuş token" });
      }
      
      // Kullanıcıyı bul
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      
      // Şifreyi güncelle
      const hashedPassword = await hashPassword(password);
      
      // Şifreyi veritabanında güncelle
      await storage.updateUserPassword(userId, hashedPassword);
      res.status(200).json({ message: "Şifreniz başarıyla sıfırlandı" });
    } catch (error: any) {
      console.error("Şifre sıfırlama hatası:", error);
      res.status(500).json({ message: "Şifre sıfırlama başarısız oldu" });
    }
  });
  
  // Şirket finansal verileri API'leri
  app.get("/api/company-financials/:companyCode", getCompanyFinancials);
  app.get("/api/company-financials", getAllCompaniesFinancials);

  // Company routes
  app.get("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companies = await storage.getCompanies(req.user.id);
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const company = await storage.getCompany(parseInt(req.params.id));
      
      if (!company) {
        return res.status(404).json({ message: "Şirket bulunamadı" });
      }
      
      if (company.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu şirkete erişim izniniz yok" });
      }
      
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertCompanySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Şirket bulunamadı" });
      }
      
      if (company.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu şirketi düzenleme izniniz yok" });
      }
      
      const updatedCompany = await storage.updateCompany(companyId, req.body);
      res.json(updatedCompany);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Şirket bulunamadı" });
      }
      
      if (company.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu şirketi silme izniniz yok" });
      }
      
      await storage.deleteCompany(companyId);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Financial data routes
  app.get("/api/companies/:id/financial-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Şirket bulunamadı" });
      }
      
      if (company.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu şirketin verilerine erişim izniniz yok" });
      }
      
      const financialData = await storage.getFinancialDataForCompany(companyId);
      res.json(financialData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/financial-data/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const financialData = await storage.getFinancialData(parseInt(req.params.id));
      
      if (!financialData) {
        return res.status(404).json({ message: "Finansal veri bulunamadı" });
      }
      
      const company = await storage.getCompany(financialData.companyId);
      
      if (!company || company.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu finansal veriye erişim izniniz yok" });
      }
      
      res.json(financialData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Company financials API endpoints
  app.get("/api/company-financials/:companyCode", getCompanyFinancials);
  app.get("/api/company-financials", getAllCompaniesFinancials);

  app.post("/api/financial-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Finansal veri ekleme isteği:", JSON.stringify(req.body));
      const data = req.body;
      
      // Girdi doğrulama
      if (!data.companyId) {
        return res.status(400).json({ message: "companyId alanı gereklidir" });
      }
      
      const company = await storage.getCompany(data.companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Şirket bulunamadı" });
      }
      
      if (company.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu şirkete veri ekleme izniniz yok" });
      }
      
      // Calculate ratios
      const currentRatio = data.totalCurrentAssets / data.totalCurrentLiabilities;
      const liquidityRatio = (data.totalCurrentAssets - data.inventory) / data.totalCurrentLiabilities;
      const acidTestRatio = data.cashAndEquivalents / data.totalCurrentLiabilities;
      
      const validatedData = {
        ...insertFinancialDataSchema.parse(data),
        currentRatio,
        liquidityRatio,
        acidTestRatio
      };
      
      const financialData = await storage.createFinancialData(validatedData);
      
      // Update company last updated timestamp
      await storage.updateCompany(data.companyId, { lastUpdated: new Date() });
      
      res.status(201).json(financialData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Report routes
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const reports = await storage.getReportsForUser(req.user.id);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Rapor oluşturma isteği alındı:", req.body);
      const { 
        companyId, 
        financialDataId, 
        format, 
        name, 
        type = 'financial', 
        status = 'completed',
        numCompanies, 
        numPeriods, 
        numRatios, 
        price 
      } = req.body;
      
      // Girdi doğrulama
      if (!companyId || !financialDataId || !name) {
        console.error("Rapor isteği eksik parametrelerle geldi:", req.body);
        return res.status(400).json({ message: "companyId, financialDataId ve name alanları gereklidir" });
      }
      
      // Fiyat parametrelerini al veya varsayılan değerleri kullan
      const companies = numCompanies || 1;
      const periods = numPeriods || 1;
      const ratios = numRatios || 1;
      const unitPrice = 0.25; // TL cinsinden birim fiyat
      
      // Dinamik toplam fiyat hesaplaması
      const totalPrice = price || (companies * periods * ratios * unitPrice);
      
      // Gereken kredi sayısı (1 TL = 1 kredi)
      const requiredCredits = Math.ceil(totalPrice);
      
      console.log("Rapor fiyat hesaplaması:", { companies, periods, ratios, totalPrice, requiredCredits });
      
      // Admin kullanıcılar için kredi kontrolü yapılmaz
      const isAdmin = req.user.role === "admin";
      
      // Normal kullanıcılar için kredi kontrolü
      if (!isAdmin && req.user.credits < requiredCredits) {
        return res.status(402).json({ 
          message: `Yeterli krediniz yok. Bu rapor için ${requiredCredits} kredi gerekiyor, ancak hesabınızda ${req.user.credits} kredi bulunmaktadır. Lütfen kredi satın alın.`
        });
      }
      
      // Validate company ownership - admin ise sahiplik kontrolü yapılmaz
      const company = await storage.getCompany(companyId);
      if (!company || (!isAdmin && company.userId !== req.user.id)) {
        return res.status(403).json({ message: "Bu şirket için rapor oluşturma izniniz yok" });
      }
      
      // Validate financial data
      const financialData = await storage.getFinancialData(financialDataId);
      if (!financialData || financialData.companyId !== companyId) {
        return res.status(404).json({ message: "Finansal veri bulunamadı" });
      }
      
      // Rapor adını ya istekten al ya da varsayılan değer kullan
      const reportName = name || `${company.name} Finansal Oran Raporu`;
      
      console.log("Rapor verisi hazırlandı:", { 
        userId: req.user.id,
        companyId,
        financialDataId,
        type,
        name: reportName,
        status,
        format,
      });
      
      const validatedData = insertReportSchema.parse({
        userId: req.user.id,
        companyId,
        financialDataId,
        type,
        name: reportName,
        status,
        format: format || "pdf",
      });
      
      // Create report - tüm gerekli alanları içeren doğrulanmış veriyi kullan
      const report = await storage.createReport(validatedData);
      
      // Admin değilse kredi düşülür
      if (!isAdmin) {
        await storage.updateUserCredits(req.user.id, req.user.credits - requiredCredits);
      }
      
      res.status(201).json(report);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe Payment Intent oluşturma (ödeme niyeti)
  app.post("/api/credits/payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount, credits } = req.body;
      
      // Doğrulama
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Geçersiz ödeme tutarı" });
      }
      
      if (!credits || typeof credits !== 'number' || credits <= 0) {
        return res.status(400).json({ message: "Geçersiz kredi miktarı" });
      }
      
      // Kuruşa çevir (ör. 99.99 TL -> 9999 kuruş)
      const amountInCents = Math.round(amount * 100);
      
      // Stripe ödeme niyeti oluştur
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'try', // Türk Lirası
        metadata: {
          userId: req.user.id.toString(),
          credits: credits.toString()
        }
      });
      
      // Ödeme client secret'ı frontend'e gönder
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error("Ödeme niyeti oluşturma hatası:", error);
      res.status(500).json({ 
        message: "Ödeme başlatılırken bir hata oluştu", 
        error: error.message 
      });
    }
  });
  
  // Ödeme tamamlandığında
  app.post("/api/credits/payment-complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Ödeme bilgisi eksik" });
      }
      
      // Stripe'dan ödeme bilgisini al
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Ödeme başarılı mı kontrol et
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Ödeme henüz tamamlanmamış" });
      }
      
      // Kullanıcı doğrulama (metadata'dan kullanıcı kimliğini kontrol et)
      if (paymentIntent.metadata.userId !== req.user.id.toString()) {
        return res.status(403).json({ message: "Bu ödeme işlemi sizin hesabınıza ait değil" });
      }
      
      const credits = parseInt(paymentIntent.metadata.credits);
      const amount = paymentIntent.amount / 100; // Kuruştan TL'ye çevir
      
      // Ödeme kaydı oluştur
      const payment = await storage.createPayment({
        userId: req.user.id,
        amount,
        credits,
        stripePaymentId: paymentIntent.id,
        status: "completed"
      });
      
      // Kullanıcıya kredileri ekle
      const updatedUser = await storage.updateUserCredits(
        req.user.id, 
        req.user.credits + credits
      );
      
      res.status(201).json({ payment, user: updatedUser });
    } catch (error: any) {
      console.error("Ödeme tamamlama hatası:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get report by ID with all necessary data to generate the report
  app.get("/api/reports/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const reportId = parseInt(req.params.id);
      
      console.log(`Rapor verileri isteniyor: ID=${reportId}`);
      
      const report = await storage.getReport(reportId);
      
      if (!report) {
        console.error(`Rapor bulunamadı: ID=${reportId}`);
        return res.status(404).json({ message: "Rapor bulunamadı" });
      }
      
      if (report.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Bu raporu görüntüleme izniniz yok" });
      }
      
      // Get the financial data and company for this report
      const financialData = await storage.getFinancialData(report.financialDataId);
      if (!financialData) {
        console.error(`Finansal veri bulunamadı: ID=${report.financialDataId}`);
        return res.status(404).json({ message: "Finansal veri bulunamadı" });
      }
      
      const company = await storage.getCompany(report.companyId);
      if (!company) {
        console.error(`Şirket bulunamadı: ID=${report.companyId}`);
        return res.status(404).json({ message: "Şirket bulunamadı" });
      }
      
      console.log(`Rapor verileri başarıyla alındı: ID=${reportId}`);
      
      // Return all necessary data for report generation
      res.json({
        report,
        company: {
          id: company.id,
          name: company.name,
          code: company.code || company.name.substring(0, 4).toUpperCase(),
          sector: company.sector || "Genel"
        },
        financialData: {
          ...financialData,
          year: financialData.year,
          // Daha yararlı finansal veri analizi için varsayılan değerler ekle
          totalAssets: financialData.totalAssets || 0,
          currentAssets: financialData.totalCurrentAssets || 0,
          fixedAssets: financialData.totalFixedAssets || 0,
          shortTermLiabilities: financialData.totalCurrentLiabilities || 0,
          longTermLiabilities: financialData.totalLongTermLiabilities || 0,
          equity: financialData.totalEquity || 0,
          netSales: financialData.netSales || 0,
          grossProfit: financialData.grossProfit || 0,
          operatingProfit: financialData.operatingProfit || 0,
          netProfit: financialData.netProfit || 0
        }
      });
    } catch (error: any) {
      console.error(`Rapor verileri alınırken hata oluştu: ID=${req.params.id}`, error);
      res.status(500).json({ message: error.message });
    }
  });

  // İletişim formu
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = contactFormSchema.parse(req.body);
      
      // Log the contact form submission
      console.log("İletişim formu gönderildi:", validatedData);
      console.log("Alıcı: drosmankursat@yandex.com");
      
      // Burada bir e-posta gönderme işlevi eklenebilir
      // SendGrid veya başka bir e-posta servisi kullanılabilir
      
      res.status(200).json({ 
        success: true, 
        message: "İletişim formu başarıyla gönderildi." 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Form bilgileri geçerli değil.",
          errors: error.errors 
        });
      }
      
      console.error("İletişim formu hatası:", error);
      res.status(500).json({ 
        success: false, 
        message: "İletişim formu gönderilirken bir hata oluştu." 
      });
    }
  });
  
  // Admin API rotaları
  // Admin yetkisini kontrol eden middleware
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açmanız gerekiyor" });
    }
    
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin yetkiniz bulunmuyor" });
    }
    
    next();
  };
  
  // Tüm kullanıcıları getir (sadece admin)
  app.get("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Kullanıcıları getirme hatası:", error);
      res.status(500).json({ message: "Kullanıcılar yüklenirken hata oluştu" });
    }
  });
  
  // Kullanıcı ara (sadece admin)
  app.get("/api/admin/users/search", isAdmin, async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        const users = await storage.getAllUsers();
        return res.json(users);
      }
      
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      console.error("Kullanıcı arama hatası:", error);
      res.status(500).json({ message: "Kullanıcı araması yapılırken hata oluştu" });
    }
  });
  
  // Kullanıcı rolünü güncelle (sadece admin)
  app.patch("/api/admin/users/:id/role", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!role || !["admin", "user"].includes(role)) {
        return res.status(400).json({ message: "Geçersiz rol" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Rol güncelleme hatası:", error);
      res.status(500).json({ message: "Kullanıcı rolü güncellenirken hata oluştu" });
    }
  });
  
  // Kullanıcı kredilerini güncelle (sadece admin)
  app.patch("/api/admin/users/:id/credits", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { credits } = req.body;
      
      if (typeof credits !== "number" || credits < 0) {
        return res.status(400).json({ message: "Geçersiz kredi miktarı" });
      }
      
      const updatedUser = await storage.updateUserCredits(userId, credits);
      res.json(updatedUser);
    } catch (error) {
      console.error("Kredi güncelleme hatası:", error);
      res.status(500).json({ message: "Kullanıcı kredileri güncellenirken hata oluştu" });
    }
  });
  
  // Tüm raporları getir (sadece admin)
  app.get("/api/admin/reports", isAdmin, async (req: Request, res: Response) => {
    try {
      // Tüm kullanıcıları al
      const users = await storage.getAllUsers();
      
      // Her bir kullanıcının raporlarını al
      const reportsPromises = users.map(user => storage.getReportsForUser(user.id));
      const reportsArrays = await Promise.all(reportsPromises);
      
      // Tüm raporları birleştir
      const allReports = reportsArrays.flat();
      
      // Oluşturulma tarihine göre sırala (en yeni en üstte)
      allReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      res.json(allReports);
    } catch (error) {
      console.error("Rapor getirme hatası:", error);
      res.status(500).json({ message: "Raporlar yüklenirken hata oluştu" });
    }
  });
  
  // Tüm ödemeleri getir (sadece admin)
  app.get("/api/admin/payments", isAdmin, async (req: Request, res: Response) => {
    try {
      // Tüm kullanıcıları al
      const users = await storage.getAllUsers();
      
      // Her bir kullanıcının ödemelerini al
      const paymentsPromises = users.map(user => storage.getPaymentsForUser(user.id));
      const paymentsArrays = await Promise.all(paymentsPromises);
      
      // Tüm ödemeleri birleştir
      const allPayments = paymentsArrays.flat();
      
      // Oluşturulma tarihine göre sırala (en yeni en üstte)
      allPayments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      res.json(allPayments);
    } catch (error) {
      console.error("Ödeme getirme hatası:", error);
      res.status(500).json({ message: "Ödemeler yüklenirken hata oluştu" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
