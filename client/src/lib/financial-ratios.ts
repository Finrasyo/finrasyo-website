// Finansal Oran Kategorileri ve Tanımları
interface FinancialRatio {
  id: string;
  name: string;
  description: string;
  formula: string;
}

interface RatioCategory {
  id: string;
  name: string;
  ratios: FinancialRatio[];
}

// Export interface for other files to use
export type { FinancialRatio, RatioCategory };

// Eski yapıda olduğu gibi ratioCategories olarak da dışa aktar
export const ratioCategories = {
  liquidity: [
    {
      id: "currentRatio",
      name: "Cari Oran",
      description: "Dönen varlıkların kısa vadeli borçları karşılama oranı",
      formula: "Dönen Varlıklar / Kısa Vadeli Yükümlülükler"
    },
    {
      id: "quickRatio",
      name: "Asit-Test Oranı",
      description: "Likiditeyi ölçen, stoklardan arındırılmış oran",
      formula: "(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler"
    },
    {
      id: "cashRatio",
      name: "Nakit Oranı",
      description: "Nakit ve benzeri varlıkların kısa vadeli borçları karşılama oranı",
      formula: "Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler"
    }
  ],
  financialStructure: [
    {
      id: "debtRatio",
      name: "Borç Oranı",
      description: "Toplam borçların toplam varlıklara oranı",
      formula: "Toplam Borçlar / Toplam Varlıklar"
    },
    {
      id: "debtToEquity",
      name: "Borç/Özsermaye Oranı",
      description: "Şirketin borçlarının öz sermayeye oranı",
      formula: "Toplam Borçlar / Özkaynaklar"
    },
    {
      id: "equityMultiplier",
      name: "Özkaynak Çarpanı",
      description: "Varlıkların özkaynaklara oranı",
      formula: "Toplam Varlıklar / Özkaynaklar"
    }
  ],
  profitability: [
    {
      id: "grossProfitMargin",
      name: "Brüt Kar Marjı",
      description: "Brüt karın net satışlara oranı",
      formula: "Brüt Kar / Net Satışlar"
    },
    {
      id: "netProfitMargin",
      name: "Net Kar Marjı",
      description: "Net karın net satışlara oranı",
      formula: "Net Kar / Net Satışlar"
    },
    {
      id: "roe",
      name: "Özsermaye Karlılığı (ROE)",
      description: "Özsermayenin karlılığı",
      formula: "Net Kar / Ortalama Özkaynaklar"
    },
    {
      id: "roa",
      name: "Varlık Karlılığı (ROA)",
      description: "Varlıkların karlılığı",
      formula: "Net Kar / Ortalama Toplam Varlıklar"
    }
  ]
};

export const financialRatioCategories: RatioCategory[] = [
  {
    id: "liquidity",
    name: "Likidite",
    ratios: [
      {
        id: "currentRatio",
        name: "Cari Oran",
        description: "Dönen varlıkların kısa vadeli borçları karşılama oranı",
        formula: "Dönen Varlıklar / Kısa Vadeli Yükümlülükler"
      },
      {
        id: "quickRatio",
        name: "Asit-Test Oranı",
        description: "Likiditeyi ölçen, stoklardan arındırılmış oran",
        formula: "(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler"
      },
      {
        id: "cashRatio",
        name: "Nakit Oranı",
        description: "Nakit ve benzeri varlıkların kısa vadeli borçları karşılama oranı",
        formula: "Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler"
      },
      {
        id: "workingCapital",
        name: "Çalışma Sermayesi",
        description: "İşletmenin günlük faaliyetlerini finanse etmek için kullanılan kaynak",
        formula: "Dönen Varlıklar - Kısa Vadeli Yükümlülükler"
      }
    ]
  },
  {
    id: "leverage",
    name: "Finansal Kaldıraç",
    ratios: [
      {
        id: "debtRatio",
        name: "Borç Oranı",
        description: "Toplam borçların toplam varlıklara oranı",
        formula: "Toplam Borçlar / Toplam Varlıklar"
      },
      {
        id: "debtToEquity",
        name: "Borç/Özsermaye Oranı",
        description: "Şirketin borçlarının öz sermayeye oranı",
        formula: "Toplam Borçlar / Özkaynaklar"
      },
      {
        id: "equityMultiplier",
        name: "Özkaynak Çarpanı",
        description: "Varlıkların özkaynaklara oranı",
        formula: "Toplam Varlıklar / Özkaynaklar"
      }
    ]
  },
  {
    id: "activity",
    name: "Faaliyet",
    ratios: [
      {
        id: "payablesTurnover",
        name: "Borç Devir Hızı",
        description: "Ticari borçların ödenme hızı",
        formula: "Satın Alımlar / Ortalama Ticari Borçlar"
      }
    ]
  },
  {
    id: "profitability",
    name: "Karlılık",
    ratios: [
      {
        id: "grossProfitMargin",
        name: "Brüt Kar Marjı",
        description: "Brüt karın net satışlara oranı",
        formula: "Brüt Kar / Net Satışlar"
      },
      {
        id: "operatingProfitMargin",
        name: "Faaliyet Kar Marjı",
        description: "Faaliyet karının net satışlara oranı",
        formula: "Faaliyet Karı / Net Satışlar"
      },
      {
        id: "netProfitMargin",
        name: "Net Kar Marjı",
        description: "Net karın net satışlara oranı",
        formula: "Net Kar / Net Satışlar"
      },
      {
        id: "roe",
        name: "Özsermaye Karlılığı (ROE)",
        description: "Özsermayenin karlılığı",
        formula: "Net Kar / Ortalama Özkaynaklar"
      },
      {
        id: "roa",
        name: "Varlık Karlılığı (ROA)",
        description: "Varlıkların karlılığı",
        formula: "Net Kar / Ortalama Toplam Varlıklar"
      },
      {
        id: "ebitdaMargin",
        name: "FAVÖK Marjı",
        description: "FAVÖK'ün net satışlara oranı",
        formula: "FAVÖK / Net Satışlar"
      }
    ]
  }
];

// Tüm oranları düz bir liste olarak al
export const getAllRatios = (): FinancialRatio[] => {
  const allRatios: FinancialRatio[] = [];
  financialRatioCategories.forEach(category => {
    category.ratios.forEach(ratio => {
      allRatios.push(ratio);
    });
  });
  return allRatios;
};

// ID'ye göre oran bilgilerini bul
export const getRatioById = (id: string): FinancialRatio | undefined => {
  for (const category of financialRatioCategories) {
    const ratio = category.ratios.find(r => r.id === id);
    if (ratio) return ratio;
  }
  return undefined;
};

// Kategori ID'sine göre oranları al
export const getRatiosByCategory = (categoryId: string): FinancialRatio[] => {
  const category = financialRatioCategories.find(c => c.id === categoryId);
  return category ? category.ratios : [];
};

// ----- Finansal Oran Hesaplama Fonksiyonları -----

// 1. Likidite Oranları
export function calculateCurrentRatio(currentAssets: number, shortTermLiabilities: number): number {
  if (shortTermLiabilities === 0) return 0; // Sıfıra bölmeyi engelle
  return currentAssets / shortTermLiabilities;
}

export function calculateAcidTestRatio(
  currentAssets: number, 
  inventory: number, 
  shortTermLiabilities: number
): number {
  if (shortTermLiabilities === 0) return 0;
  return (currentAssets - inventory) / shortTermLiabilities;
}

export function calculateCashRatio(
  cashAndEquivalents: number, 
  shortTermLiabilities: number
): number {
  if (shortTermLiabilities === 0) return 0;
  return cashAndEquivalents / shortTermLiabilities;
}

export function calculateWorkingCapital(
  currentAssets: number, 
  shortTermLiabilities: number
): number {
  return currentAssets - shortTermLiabilities;
}

// 2. Finansal Yapı Oranları
export function calculateFinancialLeverageRatio(
  shortTermLiabilities: number,
  longTermLiabilities: number,
  totalAssets: number
): number {
  if (totalAssets === 0) return 0;
  return (shortTermLiabilities + longTermLiabilities) / totalAssets;
}

export function calculateEquityToAssetsRatio(
  equity: number,
  totalAssets: number
): number {
  if (totalAssets === 0) return 0;
  return equity / totalAssets;
}

export function calculateEquityToDebtRatio(
  equity: number,
  shortTermLiabilities: number,
  longTermLiabilities: number
): number {
  const totalLiabilities = shortTermLiabilities + longTermLiabilities;
  if (totalLiabilities === 0) return 0;
  return equity / totalLiabilities;
}

export function calculateShortTermLiabilitiesToTotalLiabilitiesRatio(
  shortTermLiabilities: number,
  totalLiabilities: number
): number {
  if (totalLiabilities === 0) return 0;
  return shortTermLiabilities / totalLiabilities;
}

export function calculateLongTermLiabilitiesToTotalLiabilitiesRatio(
  longTermLiabilities: number,
  totalLiabilities: number
): number {
  if (totalLiabilities === 0) return 0;
  return longTermLiabilities / totalLiabilities;
}

export function calculateFixedAssetsToEquityRatio(
  fixedAssets: number,
  equity: number
): number {
  if (equity === 0) return 0;
  return fixedAssets / equity;
}

export function calculateFixedAssetsToPermanentCapitalRatio(
  fixedAssets: number,
  longTermLiabilities: number,
  equity: number
): number {
  const permanentCapital = longTermLiabilities + equity;
  if (permanentCapital === 0) return 0;
  return fixedAssets / permanentCapital;
}

export function calculateTangibleFixedAssetsToEquityRatio(
  tangibleFixedAssets: number,
  equity: number
): number {
  if (equity === 0) return 0;
  return tangibleFixedAssets / equity;
}

// 3. Karlılık Oranları
export function calculateGrossProfitMarginRatio(
  grossProfit: number,
  netSales: number
): number {
  if (netSales === 0) return 0;
  return grossProfit / netSales;
}

export function calculateOperatingProfitMarginRatio(
  operatingProfit: number,
  netSales: number
): number {
  if (netSales === 0) return 0;
  return operatingProfit / netSales;
}

export function calculateNetProfitMarginRatio(
  netProfit: number,
  netSales: number
): number {
  if (netSales === 0) return 0;
  return netProfit / netSales;
}

export function calculateReturnOnEquityRatio(
  netProfit: number,
  equity: number
): number {
  if (equity === 0) return 0;
  return netProfit / equity;
}

export function calculateReturnOnAssetsRatio(
  netProfit: number,
  totalAssets: number
): number {
  if (totalAssets === 0) return 0;
  return netProfit / totalAssets;
}

// ----- Oran Değerlendirme Fonksiyonu -----
export function evaluateRatio(ratioName: string, value: number): string {
  // Değerlendirme yok ise varsayılan mesaj
  if (isNaN(value) || value === null) {
    return "Değerlendirme yapılamıyor";
  }
  
  // Oran türüne göre değerlendirme
  switch (ratioName) {
    case "Cari Oran":
      if (value < 1) return "Yetersiz likidite, kısa vadeli borç ödeme gücü düşük";
      if (value >= 1 && value < 1.5) return "Kabul edilebilir likidite";
      if (value >= 1.5 && value < 2) return "İyi likidite";
      return "Çok iyi likidite, ancak varlık fazlalığı olabilir";
      
    case "Asit-Test Oranı":
      if (value < 0.8) return "Yetersiz likidite, acil ödeme gücü düşük";
      if (value >= 0.8 && value < 1) return "Kabul edilebilir likidite";
      if (value >= 1 && value < 1.5) return "İyi likidite";
      return "Çok iyi likidite, stoklar dışında varlık fazlalığı olabilir";
      
    case "Nakit Oran":
      if (value < 0.2) return "Nakit sıkıntısı yaşanabilir";
      if (value >= 0.2 && value < 0.5) return "Kabul edilebilir nakit oranı";
      if (value >= 0.5 && value < 1) return "İyi nakit oranı";
      return "Çok iyi nakit oranı, atıl nakit sorunu olabilir";
      
    case "Finansal Kaldıraç Oranı":
      if (value < 0.3) return "Düşük kaldıraç, düşük risk";
      if (value >= 0.3 && value < 0.5) return "Orta seviye kaldıraç";
      if (value >= 0.5 && value < 0.7) return "Yüksek kaldıraç, dikkatli olunmalı";
      return "Çok yüksek kaldıraç, yüksek finansal risk";
      
    case "Net Kar Marjı":
      if (value < 0.05) return "Düşük karlılık";
      if (value >= 0.05 && value < 0.1) return "Orta seviye karlılık";
      if (value >= 0.1 && value < 0.2) return "İyi karlılık";
      return "Çok iyi karlılık";
      
    case "Özkaynak Karlılığı":
      if (value < 0.1) return "Düşük özkaynak getirisi";
      if (value >= 0.1 && value < 0.15) return "Orta seviye özkaynak getirisi";
      if (value >= 0.15 && value < 0.25) return "İyi özkaynak getirisi";
      return "Çok iyi özkaynak getirisi";
      
    case "Varlık Karlılığı":
      if (value < 0.05) return "Düşük varlık getirisi";
      if (value >= 0.05 && value < 0.1) return "Orta seviye varlık getirisi";
      if (value >= 0.1 && value < 0.15) return "İyi varlık getirisi";
      return "Çok iyi varlık getirisi";
      
    case "Borç Oranı":
      if (value < 0.3) return "Düşük borçluluk seviyesi";
      if (value >= 0.3 && value < 0.5) return "Orta seviye borçluluk";
      if (value >= 0.5 && value < 0.7) return "Yüksek borçluluk, dikkatli olunmalı";
      return "Çok yüksek borçluluk, finansal risk yüksek";
      
    case "Borç/Özsermaye Oranı":
      if (value < 0.5) return "Düşük borç yükü";
      if (value >= 0.5 && value < 1) return "Orta seviye borç yükü";
      if (value >= 1 && value < 2) return "Yüksek borç yükü, dikkatli olunmalı";
      return "Çok yüksek borç yükü, finansal risk yüksek";

    // Diğer oranlar için de benzer değerlendirmeler eklenebilir
    default:
      return `${value.toFixed(2)} (Detaylı değerlendirme mevcut değil)`;
  }
}