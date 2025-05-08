import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { bistCompanies } from '../shared-data'; // Paylaşılan veri için bir yol

interface FinancialData {
  stockCode: string;
  companyName: string;
  currentPrice: {
    value: number;
    source: string;
  };
  priceChange: {
    value: string;
    source: string;
  };
  financialData: any;
  keyStatistics: any;
  balanceSheet: any[];
  incomeStatement: any[];
  cashflowStatement: any[];
  metrics: Record<string, string>;
  lastUpdated: string;
  sector: string;
}

// Bu genellikle bir veritabanından gelecektir, ancak demo için test verisi kullanıyoruz
function generateDummyData(companyCode: string): FinancialData {
  // Şirket bilgilerini bul
  const company = bistCompanies.find(c => c.code === companyCode);
  
  if (!company) {
    throw new Error(`Şirket bulunamadı: ${companyCode}`);
  }
  
  // Test verisi
  return {
    stockCode: companyCode,
    companyName: company.name,
    sector: company.sector,
    currentPrice: {
      value: Math.random() * 100 + 10, // 10-110 arasında rastgele fiyat
      source: "Test"
    },
    priceChange: {
      value: `+${(Math.random() * 2).toFixed(2)} (${(Math.random() * 3).toFixed(2)}%)`,
      source: "Test"
    },
    financialData: {
      totalCash: Math.random() * 1000000000 + 500000000,
      totalDebt: Math.random() * 800000000 + 300000000,
      operatingCashflow: Math.random() * 400000000 + 200000000,
      returnOnAssets: Math.random() * 0.15 + 0.05,
      returnOnEquity: Math.random() * 0.25 + 0.10,
      grossMargins: Math.random() * 0.35 + 0.25,
      profitMargins: Math.random() * 0.15 + 0.05
    },
    keyStatistics: {
      enterpriseValue: Math.random() * 10000000000 + 1000000000,
      marketCap: Math.random() * 8000000000 + 500000000,
      pegRatio: Math.random() * 1.5 + 0.5,
      priceToBook: Math.random() * 2.5 + 0.8,
      enterpriseToRevenue: Math.random() * 4 + 1,
      enterpriseToEbitda: Math.random() * 10 + 5,
      forwardPE: Math.random() * 15 + 8,
      trailingPE: Math.random() * 18 + 10
    },
    balanceSheet: [
      {
        endDate: { raw: 1640908800, fmt: "31/12/2021" },
        cash: { raw: Math.random() * 500000000 + 200000000, fmt: "" },
        shortTermInvestments: { raw: Math.random() * 300000000 + 100000000, fmt: "" },
        netReceivables: { raw: Math.random() * 400000000 + 100000000, fmt: "" },
        inventory: { raw: Math.random() * 350000000 + 100000000, fmt: "" },
        totalCurrentAssets: { raw: Math.random() * 1500000000 + 500000000, fmt: "" },
        propertyPlantEquipment: { raw: Math.random() * 3000000000 + 1000000000, fmt: "" },
        totalAssets: { raw: Math.random() * 5000000000 + 2000000000, fmt: "" },
        accountsPayable: { raw: Math.random() * 300000000 + 100000000, fmt: "" },
        shortLongTermDebt: { raw: Math.random() * 200000000 + 50000000, fmt: "" },
        totalCurrentLiabilities: { raw: Math.random() * 800000000 + 200000000, fmt: "" },
        longTermDebt: { raw: Math.random() * 1200000000 + 300000000, fmt: "" },
        totalLiabilities: { raw: Math.random() * 2500000000 + 800000000, fmt: "" },
        totalStockholderEquity: { raw: Math.random() * 3000000000 + 1000000000, fmt: "" }
      },
      {
        endDate: { raw: 1609459200, fmt: "31/12/2020" },
        cash: { raw: Math.random() * 450000000 + 180000000, fmt: "" },
        shortTermInvestments: { raw: Math.random() * 270000000 + 90000000, fmt: "" },
        netReceivables: { raw: Math.random() * 380000000 + 90000000, fmt: "" },
        inventory: { raw: Math.random() * 320000000 + 90000000, fmt: "" },
        totalCurrentAssets: { raw: Math.random() * 1400000000 + 450000000, fmt: "" },
        propertyPlantEquipment: { raw: Math.random() * 2800000000 + 900000000, fmt: "" },
        totalAssets: { raw: Math.random() * 4500000000 + 1800000000, fmt: "" },
        accountsPayable: { raw: Math.random() * 270000000 + 90000000, fmt: "" },
        shortLongTermDebt: { raw: Math.random() * 180000000 + 45000000, fmt: "" },
        totalCurrentLiabilities: { raw: Math.random() * 750000000 + 180000000, fmt: "" },
        longTermDebt: { raw: Math.random() * 1100000000 + 270000000, fmt: "" },
        totalLiabilities: { raw: Math.random() * 2300000000 + 720000000, fmt: "" },
        totalStockholderEquity: { raw: Math.random() * 2700000000 + 900000000, fmt: "" }
      }
    ],
    incomeStatement: [
      {
        endDate: { raw: 1640908800, fmt: "31/12/2021" },
        totalRevenue: { raw: Math.random() * 2500000000 + 800000000, fmt: "" },
        costOfRevenue: { raw: Math.random() * 1500000000 + 500000000, fmt: "" },
        grossProfit: { raw: Math.random() * 1000000000 + 300000000, fmt: "" },
        operatingIncome: { raw: Math.random() * 600000000 + 200000000, fmt: "" },
        interestExpense: { raw: Math.random() * 100000000 + 30000000, fmt: "" },
        incomeBeforeTax: { raw: Math.random() * 500000000 + 170000000, fmt: "" },
        incomeTaxExpense: { raw: Math.random() * 150000000 + 40000000, fmt: "" },
        netIncomeFromContinuingOperations: { raw: Math.random() * 350000000 + 130000000, fmt: "" },
        netIncome: { raw: Math.random() * 350000000 + 130000000, fmt: "" }
      },
      {
        endDate: { raw: 1609459200, fmt: "31/12/2020" },
        totalRevenue: { raw: Math.random() * 2300000000 + 750000000, fmt: "" },
        costOfRevenue: { raw: Math.random() * 1400000000 + 470000000, fmt: "" },
        grossProfit: { raw: Math.random() * 900000000 + 280000000, fmt: "" },
        operatingIncome: { raw: Math.random() * 550000000 + 180000000, fmt: "" },
        interestExpense: { raw: Math.random() * 90000000 + 27000000, fmt: "" },
        incomeBeforeTax: { raw: Math.random() * 460000000 + 153000000, fmt: "" },
        incomeTaxExpense: { raw: Math.random() * 140000000 + 36000000, fmt: "" },
        netIncomeFromContinuingOperations: { raw: Math.random() * 320000000 + 117000000, fmt: "" },
        netIncome: { raw: Math.random() * 320000000 + 117000000, fmt: "" }
      }
    ],
    cashflowStatement: [
      {
        endDate: { raw: 1640908800, fmt: "31/12/2021" },
        netIncome: { raw: Math.random() * 350000000 + 130000000, fmt: "" },
        depreciation: { raw: Math.random() * 200000000 + 70000000, fmt: "" },
        changeToAccountReceivables: { raw: Math.random() * -50000000 - 10000000, fmt: "" },
        changeToInventory: { raw: Math.random() * -40000000 - 5000000, fmt: "" },
        changeToOperatingActivities: { raw: Math.random() * 80000000 + 20000000, fmt: "" },
        totalCashFromOperatingActivities: { raw: Math.random() * 500000000 + 150000000, fmt: "" },
        capitalExpenditures: { raw: Math.random() * -400000000 - 100000000, fmt: "" },
        totalCashFromInvestingActivities: { raw: Math.random() * -450000000 - 100000000, fmt: "" },
        netBorrowings: { raw: Math.random() * 150000000 + 50000000, fmt: "" },
        dividendsPaid: { raw: Math.random() * -120000000 - 30000000, fmt: "" },
        totalCashFromFinancingActivities: { raw: Math.random() * 30000000 + 10000000, fmt: "" },
        changeInCash: { raw: Math.random() * 80000000 + 20000000, fmt: "" }
      },
      {
        endDate: { raw: 1609459200, fmt: "31/12/2020" },
        netIncome: { raw: Math.random() * 320000000 + 117000000, fmt: "" },
        depreciation: { raw: Math.random() * 180000000 + 63000000, fmt: "" },
        changeToAccountReceivables: { raw: Math.random() * -45000000 - 9000000, fmt: "" },
        changeToInventory: { raw: Math.random() * -36000000 - 4500000, fmt: "" },
        changeToOperatingActivities: { raw: Math.random() * 72000000 + 18000000, fmt: "" },
        totalCashFromOperatingActivities: { raw: Math.random() * 450000000 + 135000000, fmt: "" },
        capitalExpenditures: { raw: Math.random() * -360000000 - 90000000, fmt: "" },
        totalCashFromInvestingActivities: { raw: Math.random() * -405000000 - 90000000, fmt: "" },
        netBorrowings: { raw: Math.random() * 135000000 + 45000000, fmt: "" },
        dividendsPaid: { raw: Math.random() * -108000000 - 27000000, fmt: "" },
        totalCashFromFinancingActivities: { raw: Math.random() * 27000000 + 9000000, fmt: "" },
        changeInCash: { raw: Math.random() * 72000000 + 18000000, fmt: "" }
      }
    ],
    metrics: {
      "P/E Ratio": (Math.random() * 15 + 8).toFixed(1),
      "Market Cap": `${(Math.random() * 10 + 1).toFixed(1)}B ₺`,
      "Dividend Yield": `${(Math.random() * 4 + 0.5).toFixed(1)}%`,
      "Beta": (Math.random() * 1.5 + 0.5).toFixed(1),
      "52-Week Range": `${(Math.random() * 30 + 10).toFixed(2)} ₺ - ${(Math.random() * 20 + 40).toFixed(2)} ₺`,
      "Average Volume": `${(Math.random() * 3 + 0.5).toFixed(1)}M`,
      "EPS": `${(Math.random() * 5 + 0.5).toFixed(2)} ₺`
    },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Belirli bir şirketin finansal verilerini döndüren HTTP endpoint'i
 */
export function getCompanyFinancials(req: Request, res: Response) {
  try {
    const companyCode = req.params.companyCode;
    
    if (!companyCode) {
      return res.status(400).json({ error: "Şirket kodu gereklidir" });
    }
    
    // Gerçek bir uygulamada, veritabanından veri alınır veya bir JSON dosyası okunur
    // Burada test için veri oluşturuyoruz
    const financialData = generateDummyData(companyCode);
    
    res.status(200).json(financialData);
  } catch (error: any) {
    console.error("Şirket finansal verileri alınırken hata oluştu:", error);
    res.status(500).json({ error: error.message || "Finansal veriler alınamadı" });
  }
}

/**
 * Tüm şirketlerin özet finansal verilerini döndüren HTTP endpoint'i
 */
export function getAllCompaniesFinancials(req: Request, res: Response) {
  try {
    // Normalde veritabanından veya bir API'den alınır
    // Burada liste olarak şirket kodlarını ve temel verileri döndürüyoruz
    const companies = bistCompanies.map(company => ({
      code: company.code,
      name: company.name,
      sector: company.sector,
      price: Math.random() * 100 + 10, // 10-110 arasında rastgele fiyat
      change: (Math.random() * 4 - 2).toFixed(2), // -2 ile +2 arasında rastgele değişim
      marketCap: `${(Math.random() * 10 + 1).toFixed(1)}B ₺`,
      peRatio: (Math.random() * 15 + 8).toFixed(1)
    }));
    
    res.status(200).json(companies);
  } catch (error: any) {
    console.error("Şirket listesi alınırken hata oluştu:", error);
    res.status(500).json({ error: error.message || "Şirket listesi alınamadı" });
  }
}