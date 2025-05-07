import { pgTable, text, serial, integer, boolean, real, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  credits: integer("credits").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Company schema
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  code: text("code"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  userId: true,
  name: true,
  code: true,
});

// Financial data schema
export const financialData = pgTable("financial_data", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  year: integer("year").notNull(),
  // Current assets
  cashAndEquivalents: real("cash_and_equivalents").notNull(),
  accountsReceivable: real("accounts_receivable").notNull(),
  inventory: real("inventory").notNull(),
  otherCurrentAssets: real("other_current_assets").notNull(),
  totalCurrentAssets: real("total_current_assets").notNull(),
  // Current liabilities
  shortTermDebt: real("short_term_debt").notNull(),
  accountsPayable: real("accounts_payable").notNull(),
  otherCurrentLiabilities: real("other_current_liabilities").notNull(),
  totalCurrentLiabilities: real("total_current_liabilities").notNull(),
  // Calculated ratios
  currentRatio: real("current_ratio").notNull(),
  liquidityRatio: real("liquidity_ratio").notNull(),
  acidTestRatio: real("acid_test_ratio").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFinancialDataSchema = createInsertSchema(financialData).pick({
  companyId: true,
  year: true,
  cashAndEquivalents: true,
  accountsReceivable: true,
  inventory: true,
  otherCurrentAssets: true,
  totalCurrentAssets: true,
  shortTermDebt: true,
  accountsPayable: true,
  otherCurrentLiabilities: true,
  totalCurrentLiabilities: true,
});

// Report schema
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  format: text("format").notNull().default("pdf"), // 'pdf', 'word', 'excel', 'csv'
  companyName: text("company_name").notNull(),
  userId: integer("user_id").notNull(),
  companyId: integer("company_id").notNull(),
  financialDataId: integer("financial_data_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  name: true,
  type: true,
  format: true,
  companyName: true,
  userId: true,
  companyId: true,
  financialDataId: true,
});

// Payment records
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  credits: integer("credits").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  amount: true,
  credits: true,
  stripePaymentId: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type FinancialData = typeof financialData.$inferSelect;
export type InsertFinancialData = z.infer<typeof insertFinancialDataSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
