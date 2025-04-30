import type { Express } from "express";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

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

  // Credit purchase
  app.post("/api/credits/purchase", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount, credits } = req.body;
      
      // Create payment record
      const payment = await storage.createPayment({
        userId: req.user.id,
        amount,
        credits,
        stripePaymentId: "dummy-payment-id", // In a real implementation, this would be from Stripe
        status: "completed"
      });
      
      // Add credits to user
      const updatedUser = await storage.updateUserCredits(
        req.user.id, 
        req.user.credits + credits
      );
      
      res.status(201).json({ payment, user: updatedUser });
    } catch (error: any) {
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

  const httpServer = createServer(app);

  return httpServer;
}
