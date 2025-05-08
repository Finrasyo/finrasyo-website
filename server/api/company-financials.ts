import { Request, Response } from "express";

/**
 * Şirket finansal verilerini temsil eden arayüz
 */
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

/**
 * Gerçek veri yoksa örnek veri oluştur 
 */
function generateDummyData(companyCode: string): FinancialData {
  const today = new Date().toLocaleDateString("tr-TR");
  
  // BIST şirketlerinden bazılarının örnek verileri
  const companyData: Record<string, Partial<FinancialData>> = {
    "AKBNK": {
      companyName: "Akbank",
      currentPrice: { value: 34.56, source: "Yahoo Finance" },
      priceChange: { value: "+1.2%", source: "Yahoo Finance" },
      sector: "Mali Kuruluşlar",
      keyStatistics: {
        "Piyasa Değeri": 179800000000,
        "Hisse Başına Kazanç": 12.34,
        "Fiyat/Kazanç Oranı": 7.8,
        "Özsermaye Kârlılığı": 0.22,
        "Temettü Verimi": 0.035
      },
      metrics: {
        "Cari Oran": "1.2",
        "Likidite Oranı": "0.9",
        "Borç/Özsermaye": "6.5",
        "Aktif Kârlılığı": "1.8%",
        "Net Kâr Marjı": "22.4%"
      },
      incomeStatement: [
        {
          "Dönem": "2023/12",
          "Net Satışlar": 185000000000,
          "Faaliyet Kârı": 54500000000,
          "Net Kâr": 41800000000,
        },
        {
          "Dönem": "2022/12",
          "Net Satışlar": 155000000000,
          "Faaliyet Kârı": 44200000000,
          "Net Kâr": 32700000000,
        }
      ]
    },
    "ARCLK": {
      companyName: "Arçelik",
      currentPrice: { value: 120.9, source: "Yahoo Finance" },
      priceChange: { value: "-0.8%", source: "Yahoo Finance" },
      sector: "Metal Eşya, Makine ve Gereç Yapım",
      keyStatistics: {
        "Piyasa Değeri": 81700000000,
        "Hisse Başına Kazanç": 5.62,
        "Fiyat/Kazanç Oranı": 21.5,
        "Özsermaye Kârlılığı": 0.13,
        "Temettü Verimi": 0.018
      },
      metrics: {
        "Cari Oran": "1.7",
        "Likidite Oranı": "1.1",
        "Borç/Özsermaye": "1.2",
        "Aktif Kârlılığı": "5.7%",
        "Net Kâr Marjı": "4.1%"
      },
      incomeStatement: [
        {
          "Dönem": "2023/12",
          "Net Satışlar": 196700000000,
          "Faaliyet Kârı": 12400000000,
          "Net Kâr": 8100000000,
        },
        {
          "Dönem": "2022/12",
          "Net Satışlar": 166200000000,
          "Faaliyet Kârı": 10800000000,
          "Net Kâr": 6800000000,
        }
      ]
    },
    "ASELS": {
      companyName: "Aselsan",
      currentPrice: { value: 59.8, source: "Yahoo Finance" },
      priceChange: { value: "+3.5%", source: "Yahoo Finance" },
      sector: "Savunma",
      keyStatistics: {
        "Piyasa Değeri": 89700000000,
        "Hisse Başına Kazanç": 4.53,
        "Fiyat/Kazanç Oranı": 13.2,
        "Özsermaye Kârlılığı": 0.16,
        "Temettü Verimi": 0.022
      },
      metrics: {
        "Cari Oran": "3.2",
        "Likidite Oranı": "2.4",
        "Borç/Özsermaye": "0.38",
        "Aktif Kârlılığı": "12.3%",
        "Net Kâr Marjı": "18.9%"
      },
      incomeStatement: [
        {
          "Dönem": "2023/12",
          "Net Satışlar": 52300000000,
          "Faaliyet Kârı": 14200000000,
          "Net Kâr": 9900000000,
        },
        {
          "Dönem": "2022/12",
          "Net Satışlar": 40600000000,
          "Faaliyet Kârı": 10700000000,
          "Net Kâr": 7800000000,
        }
      ]
    },
    // Buraya diğer şirketler için de benzer veriler eklenebilir
  };

  // Eğer şirket için spesifik veri varsa onu döndür, yoksa varsayılan örnek veri oluştur
  const specificData = companyData[companyCode];
  
  if (specificData) {
    return {
      stockCode: companyCode,
      lastUpdated: today,
      ...specificData,
    } as FinancialData;
  }
  
  // Varsayılan örnek veri
  return {
    stockCode: companyCode,
    companyName: `${companyCode} Şirketi`,
    currentPrice: { value: Math.random() * 100 + 10, source: "Örnek Veri" },
    priceChange: { 
      value: Math.random() > 0.5 ? `+${(Math.random() * 5).toFixed(2)}%` : `-${(Math.random() * 5).toFixed(2)}%`, 
      source: "Örnek Veri" 
    },
    financialData: {
      revenue: Math.random() * 1000000000 + 100000000,
      operatingIncome: Math.random() * 100000000 + 10000000,
      netIncome: Math.random() * 50000000 + 5000000,
    },
    keyStatistics: {
      "Piyasa Değeri": Math.random() * 10000000000 + 1000000000,
      "Hisse Başına Kazanç": Math.random() * 10 + 1,
      "Fiyat/Kazanç Oranı": Math.random() * 20 + 5,
      "Özsermaye Kârlılığı": Math.random() * 0.3 + 0.05,
      "Temettü Verimi": Math.random() * 0.05,
    },
    balanceSheet: [
      {
        "Dönem": "2023/12",
        "Toplam Varlıklar": Math.random() * 1000000000 + 100000000,
        "Toplam Yükümlülükler": Math.random() * 500000000 + 50000000,
        "Özkaynaklar": Math.random() * 500000000 + 50000000,
      }
    ],
    incomeStatement: [
      {
        "Dönem": "2023/12",
        "Net Satışlar": Math.random() * 1000000000 + 100000000,
        "Faaliyet Kârı": Math.random() * 100000000 + 10000000,
        "Net Kâr": Math.random() * 50000000 + 5000000,
      }
    ],
    cashflowStatement: [
      {
        "Dönem": "2023/12",
        "İşletme Faaliyetlerinden Nakit Akışları": Math.random() * 100000000 + 10000000,
        "Yatırım Faaliyetlerinden Nakit Akışları": -1 * (Math.random() * 50000000 + 5000000),
        "Finansman Faaliyetlerinden Nakit Akışları": -1 * (Math.random() * 20000000 + 2000000),
      }
    ],
    metrics: {
      "Cari Oran": (Math.random() * 3 + 0.5).toFixed(2),
      "Likidite Oranı": (Math.random() * 2 + 0.3).toFixed(2),
      "Borç/Özsermaye": (Math.random() * 2 + 0.2).toFixed(2),
      "Aktif Kârlılığı": `${(Math.random() * 15 + 1).toFixed(1)}%`,
      "Net Kâr Marjı": `${(Math.random() * 20 + 2).toFixed(1)}%`,
    },
    lastUpdated: today,
    sector: "Sektör Bilgisi Mevcut Değil",
  };
}

/**
 * Belirli bir şirketin finansal verilerini döndüren HTTP endpoint'i
 */
export function getCompanyFinancials(req: Request, res: Response) {
  const { stockCode } = req.params;
  
  if (!stockCode) {
    return res.status(400).json({ error: "Hisse kodu belirtilmedi" });
  }
  
  // Gerçek bir API veya veritabanından veri alınabilir
  // Şimdilik örnek veri döndürelim
  const financialData = generateDummyData(stockCode);
  
  res.json(financialData);
}

/**
 * Tüm şirketlerin özet finansal verilerini döndüren HTTP endpoint'i
 */
export function getAllCompaniesFinancials(req: Request, res: Response) {
  // Örnek birkaç şirket kodu
  const stockCodes = ["AKBNK", "ASELS", "ARCLK", "THYAO", "EREGL"];
  
  // Her şirket için özet veri oluştur
  const companies = stockCodes.map(code => {
    const data = generateDummyData(code);
    return {
      stockCode: data.stockCode,
      companyName: data.companyName,
      currentPrice: data.currentPrice,
      priceChange: data.priceChange,
      sector: data.sector,
      // Sadece özet finansal verileri döndür
      keyMetrics: {
        "Fiyat/Kazanç": data.keyStatistics?.["Fiyat/Kazanç Oranı"],
        "Temettü Verimi": data.keyStatistics?.["Temettü Verimi"],
        "Cari Oran": data.metrics?.["Cari Oran"],
      },
      lastUpdated: data.lastUpdated,
    };
  });
  
  res.json(companies);
}