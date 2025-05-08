import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertCompanySchema, 
  insertFinancialDataSchema,
  insertReportSchema,
  insertPaymentSchema
} from "@shared/schema";
import { getCompanyFinancials, getAllCompaniesFinancials } from "./api/company-financials";
import Stripe from 'stripe';

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

  app.post("/api/financial-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = req.body;
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
      const { companyId, financialDataId, type } = req.body;
      
      // Check if user has enough credits
      if (req.user.credits < 1) {
        return res.status(402).json({ message: "Yeterli krediniz yok. Lütfen kredi satın alın." });
      }
      
      // Validate company ownership
      const company = await storage.getCompany(companyId);
      if (!company || company.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu şirket için rapor oluşturma izniniz yok" });
      }
      
      // Validate financial data
      const financialData = await storage.getFinancialData(financialDataId);
      if (!financialData || financialData.companyId !== companyId) {
        return res.status(404).json({ message: "Finansal veri bulunamadı" });
      }
      
      const validatedData = insertReportSchema.parse({
        userId: req.user.id,
        companyId,
        financialDataId,
        type
      });
      
      // Create report
      const report = await storage.createReport(validatedData);
      
      // Deduct credit
      await storage.updateUserCredits(req.user.id, req.user.credits - 1);
      
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
  
  // Get downloadable report
  app.get("/api/reports/:id/:format", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const reportId = parseInt(req.params.id);
      const format = req.params.format;
      
      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Rapor bulunamadı" });
      }
      
      if (report.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu rapora erişim izniniz yok" });
      }
      
      const financialData = await storage.getFinancialData(report.financialDataId);
      if (!financialData) {
        return res.status(404).json({ message: "Rapor verileri bulunamadı" });
      }
      
      const company = await storage.getCompany(report.companyId);
      if (!company) {
        return res.status(404).json({ message: "Şirket bulunamadı" });
      }
      
      // Instead of generating actual files, we'll return the data that would be in the reports
      // In a real implementation, this would generate and return files
      res.json({
        report,
        company,
        financialData,
        format
      });
    } catch (error: any) {
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
