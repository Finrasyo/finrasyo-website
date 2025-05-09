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
        id: "interestCoverage",
        name: "Faiz Karşılama Oranı",
        description: "Faiz ödemelerini karşılama gücü",
        formula: "FVÖK / Faiz Giderleri"
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
        id: "assetTurnover",
        name: "Varlık Devir Hızı",
        description: "Varlıkların ne kadar etkin kullanıldığını gösteren oran",
        formula: "Net Satışlar / Ortalama Toplam Varlıklar"
      },
      {
        id: "receivablesTurnover",
        name: "Alacak Devir Hızı",
        description: "Şirketin alacaklarını tahsil etme oranı",
        formula: "Net Satışlar / Ortalama Ticari Alacaklar"
      },
      {
        id: "inventoryTurnover",
        name: "Stok Devir Hızı",
        description: "Stokların ne kadar hızlı satıldığını gösteren oran",
        formula: "Satılan Malın Maliyeti / Ortalama Stoklar"
      },
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