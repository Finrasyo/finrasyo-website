import { 
  users, User, InsertUser, 
  companies, Company, InsertCompany,
  financialData, FinancialData, InsertFinancialData,
  reports, Report, InsertReport,
  payments, Payment, InsertPayment
} from "@shared/schema";
import session from "express-session";
import { Store as SessionStore } from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session store
  sessionStore: SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: number, credits: number): Promise<User>;
  updateUserStripeCustomerId(userId: number, customerId: string): Promise<User>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<User>;
  searchUsers(query: string): Promise<User[]>;

  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  getCompanies(userId: number): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<Company>): Promise<Company>;
  deleteCompany(id: number): Promise<boolean>;

  // Financial data methods
  getFinancialData(id: number): Promise<FinancialData | undefined>;
  getFinancialDataForCompany(companyId: number): Promise<FinancialData[]>;
  getFinancialDataByYear(companyId: number, year: number): Promise<FinancialData | undefined>;
  createFinancialData(data: InsertFinancialData & { 
    currentRatio: number;
    liquidityRatio: number;
    acidTestRatio: number;
  }): Promise<FinancialData>;

  // Report methods
  getReport(id: number): Promise<Report | undefined>;
  getReportsForUser(userId: number): Promise<Report[]>;
  getReportsForCompany(companyId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;

  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsForUser(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private financialData: Map<number, FinancialData>;
  private reports: Map<number, Report>;
  private payments: Map<number, Payment>;
  
  sessionStore: SessionStore;
  
  currentUserId: number;
  currentCompanyId: number;
  currentFinancialDataId: number;
  currentReportId: number;
  currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.financialData = new Map();
    this.reports = new Map();
    this.payments = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentFinancialDataId = 1;
    this.currentReportId = 1;
    this.currentPaymentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // İlk kullanıcı admin olsun, diğerleri normal kullanıcı
    const role = this.users.size === 0 ? "admin" : "user";
    const user: User = { ...insertUser, id, role, credits: 5, stripeCustomerId: null };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserCredits(userId: number, credits: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, credits };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => a.id - b.id); // Sort by user ID ascending
  }
  
  async updateUserRole(userId: number, role: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, role };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async searchUsers(query: string): Promise<User[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.users.values())
      .filter(user => 
        user.username.toLowerCase().includes(lowercaseQuery) || 
        user.email.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => a.id - b.id); // Sort by user ID ascending
  }
  
  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async getCompanies(userId: number): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(
      (company) => company.userId === userId
    );
  }
  
  async createCompany(company: InsertCompany): Promise<Company> {
    const id = this.currentCompanyId++;
    const newCompany: Company = { 
      ...company, 
      id, 
      code: company.code || null,
      lastUpdated: new Date() 
    };
    this.companies.set(id, newCompany);
    return newCompany;
  }
  
  async updateCompany(id: number, companyUpdate: Partial<Company>): Promise<Company> {
    const company = await this.getCompany(id);
    if (!company) throw new Error('Company not found');
    
    const updatedCompany = { ...company, ...companyUpdate, lastUpdated: new Date() };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }
  
  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }
  
  // Financial data methods
  async getFinancialData(id: number): Promise<FinancialData | undefined> {
    return this.financialData.get(id);
  }
  
  async getFinancialDataForCompany(companyId: number): Promise<FinancialData[]> {
    return Array.from(this.financialData.values())
      .filter(data => data.companyId === companyId)
      .sort((a, b) => b.year - a.year); // Sort by year descending
  }
  
  async getFinancialDataByYear(companyId: number, year: number): Promise<FinancialData | undefined> {
    return Array.from(this.financialData.values()).find(
      data => data.companyId === companyId && data.year === year
    );
  }
  
  async createFinancialData(data: InsertFinancialData & { 
    currentRatio: number;
    liquidityRatio: number;
    acidTestRatio: number;
  }): Promise<FinancialData> {
    const id = this.currentFinancialDataId++;
    const newData: FinancialData = {
      ...data,
      id,
      createdAt: new Date()
    };
    this.financialData.set(id, newData);
    return newData;
  }
  
  // Report methods
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }
  
  async getReportsForUser(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async getReportsForCompany(companyId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const newReport: Report = {
      ...report,
      id,
      format: report.format || 'pdf',
      createdAt: new Date()
    };
    this.reports.set(id, newReport);
    return newReport;
  }
  
  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsForUser(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const newPayment: Payment = {
      ...payment,
      id,
      stripePaymentId: payment.stripePaymentId || null,
      createdAt: new Date()
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const payment = await this.getPayment(id);
    if (!payment) throw new Error('Payment not found');
    
    const updatedPayment = { ...payment, status };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();
