/**
 * Finansal Oran Hesaplama Kütüphanesi
 * Bu kütüphane, şirketlerin finansal verilerinden çeşitli finansal oranları hesaplamak için kullanılır.
 */

/**
 * LİKİDİTE ORANLARI
 * Şirketin kısa vadeli borçlarını ödeme gücünü ölçen oranlardır.
 */

// Cari Oran: Dönen Varlıklar / Kısa Vadeli Yükümlülükler
export function calculateCurrentRatio(currentAssets: number, shortTermLiabilities: number): number {
  if (shortTermLiabilities === 0) return 0;
  return parseFloat((currentAssets / shortTermLiabilities).toFixed(2));
}

// Likidite (Nakit) Oranı: (Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler
export function calculateLiquidityRatio(currentAssets: number, inventory: number, shortTermLiabilities: number): number {
  if (shortTermLiabilities === 0) return 0;
  return parseFloat(((currentAssets - inventory) / shortTermLiabilities).toFixed(2));
}

// Asit-Test Oranı: (Nakit ve Nakit Benzerleri + Menkul Kıymetler + Ticari Alacaklar) / Kısa Vadeli Yükümlülükler
export function calculateAcidTestRatio(cash: number, marketableSecurities: number, accountsReceivable: number, shortTermLiabilities: number): number {
  if (shortTermLiabilities === 0) return 0;
  return parseFloat(((cash + marketableSecurities + accountsReceivable) / shortTermLiabilities).toFixed(2));
}

// Nakit Oranı: (Nakit ve Nakit Benzerleri + Menkul Kıymetler) / Kısa Vadeli Yükümlülükler
export function calculateCashRatio(cash: number, marketableSecurities: number, shortTermLiabilities: number): number {
  if (shortTermLiabilities === 0) return 0;
  return parseFloat(((cash + marketableSecurities) / shortTermLiabilities).toFixed(2));
}

/**
 * FİNANSAL YAPI ORANLARI
 * Şirketin varlıklarının finansmanında kullanılan kaynakların dağılımını ve şirketin uzun vadeli borç ödeme gücünü ölçen oranlardır.
 */

// Borç Oranı: Toplam Borçlar / Toplam Varlıklar
export function calculateDebtRatio(totalLiabilities: number, totalAssets: number): number {
  if (totalAssets === 0) return 0;
  return parseFloat((totalLiabilities / totalAssets).toFixed(2));
}

// Özsermaye Oranı: Özsermaye / Toplam Varlıklar
export function calculateEquityRatio(equity: number, totalAssets: number): number {
  if (totalAssets === 0) return 0;
  return parseFloat((equity / totalAssets).toFixed(2));
}

// Borç/Özsermaye Oranı: Toplam Borçlar / Özsermaye
export function calculateDebtToEquityRatio(totalLiabilities: number, equity: number): number {
  if (equity === 0) return 0;
  return parseFloat((totalLiabilities / equity).toFixed(2));
}

// Faiz Karşılama Oranı: FVÖK (Faiz ve Vergi Öncesi Kâr) / Faiz Giderleri
export function calculateInterestCoverageRatio(ebit: number, interestExpense: number): number {
  if (interestExpense === 0) return 0;
  return parseFloat((ebit / interestExpense).toFixed(2));
}

// Uzun Vadeli Borç Oranı: Uzun Vadeli Borçlar / Toplam Varlıklar
export function calculateLongTermDebtRatio(longTermLiabilities: number, totalAssets: number): number {
  if (totalAssets === 0) return 0;
  return parseFloat((longTermLiabilities / totalAssets).toFixed(2));
}

/**
 * DEVIR HIZI (AKTİVİTE) ORANLARI
 * Şirketin varlıklarını ne kadar etkin kullandığını ölçen oranlardır.
 */

// Aktif Devir Hızı: Net Satışlar / Ortalama Toplam Varlıklar
export function calculateAssetTurnoverRatio(netSales: number, averageTotalAssets: number): number {
  if (averageTotalAssets === 0) return 0;
  return parseFloat((netSales / averageTotalAssets).toFixed(2));
}

// Alacak Devir Hızı: Net Satışlar / Ortalama Ticari Alacaklar
export function calculateReceivablesTurnoverRatio(netSales: number, averageAccountsReceivable: number): number {
  if (averageAccountsReceivable === 0) return 0;
  return parseFloat((netSales / averageAccountsReceivable).toFixed(2));
}

// Stok Devir Hızı: Satışların Maliyeti / Ortalama Stoklar
export function calculateInventoryTurnoverRatio(costOfGoodsSold: number, averageInventory: number): number {
  if (averageInventory === 0) return 0;
  return parseFloat((costOfGoodsSold / averageInventory).toFixed(2));
}

// Ticari Borç Devir Hızı: Satışların Maliyeti / Ortalama Ticari Borçlar
export function calculatePayablesTurnoverRatio(costOfGoodsSold: number, averageAccountsPayable: number): number {
  if (averageAccountsPayable === 0) return 0;
  return parseFloat((costOfGoodsSold / averageAccountsPayable).toFixed(2));
}

// Dönen Varlık Devir Hızı: Net Satışlar / Ortalama Dönen Varlıklar
export function calculateCurrentAssetsTurnoverRatio(netSales: number, averageCurrentAssets: number): number {
  if (averageCurrentAssets === 0) return 0;
  return parseFloat((netSales / averageCurrentAssets).toFixed(2));
}

// Duran Varlık Devir Hızı: Net Satışlar / Ortalama Duran Varlıklar
export function calculateFixedAssetsTurnoverRatio(netSales: number, averageFixedAssets: number): number {
  if (averageFixedAssets === 0) return 0;
  return parseFloat((netSales / averageFixedAssets).toFixed(2));
}

/**
 * KARLILIK ORANLARI
 * Şirketin kâr elde etme gücünü ölçen oranlardır.
 */

// Brüt Kâr Marjı: Brüt Kâr / Net Satışlar
export function calculateGrossProfitMargin(grossProfit: number, netSales: number): number {
  if (netSales === 0) return 0;
  return parseFloat((grossProfit / netSales).toFixed(2));
}

// Faaliyet Kâr Marjı: Faaliyet Kârı / Net Satışlar
export function calculateOperatingProfitMargin(operatingProfit: number, netSales: number): number {
  if (netSales === 0) return 0;
  return parseFloat((operatingProfit / netSales).toFixed(2));
}

// Net Kâr Marjı: Net Kâr / Net Satışlar
export function calculateNetProfitMargin(netProfit: number, netSales: number): number {
  if (netSales === 0) return 0;
  return parseFloat((netProfit / netSales).toFixed(2));
}

// Özkaynak Kârlılığı (ROE): Net Kâr / Ortalama Özsermaye
export function calculateReturnOnEquity(netProfit: number, averageEquity: number): number {
  if (averageEquity === 0) return 0;
  return parseFloat((netProfit / averageEquity).toFixed(2));
}

// Varlık Kârlılığı (ROA): Net Kâr / Ortalama Toplam Varlıklar
export function calculateReturnOnAssets(netProfit: number, averageTotalAssets: number): number {
  if (averageTotalAssets === 0) return 0;
  return parseFloat((netProfit / averageTotalAssets).toFixed(2));
}

// Yatırılan Sermaye Kârlılığı (ROCE): FVÖK / (Toplam Varlıklar - Kısa Vadeli Yükümlülükler)
export function calculateReturnOnCapitalEmployed(ebit: number, totalAssets: number, shortTermLiabilities: number): number {
  const capitalEmployed = totalAssets - shortTermLiabilities;
  if (capitalEmployed === 0) return 0;
  return parseFloat((ebit / capitalEmployed).toFixed(2));
}

/**
 * BÜYÜME ORANLARI
 * Şirketin zaman içindeki büyümesini ölçen oranlardır.
 */

// Satış Büyüme Oranı: (Cari Dönem Satışları - Önceki Dönem Satışları) / Önceki Dönem Satışları
export function calculateSalesGrowthRate(currentSales: number, previousSales: number): number {
  if (previousSales === 0) return 0;
  return parseFloat(((currentSales - previousSales) / previousSales).toFixed(2));
}

// Net Kâr Büyüme Oranı: (Cari Dönem Net Kârı - Önceki Dönem Net Kârı) / Önceki Dönem Net Kârı
export function calculateNetProfitGrowthRate(currentNetProfit: number, previousNetProfit: number): number {
  if (previousNetProfit === 0) return 0;
  return parseFloat(((currentNetProfit - previousNetProfit) / previousNetProfit).toFixed(2));
}

// Varlık Büyüme Oranı: (Cari Dönem Toplam Varlıkları - Önceki Dönem Toplam Varlıkları) / Önceki Dönem Toplam Varlıkları
export function calculateAssetGrowthRate(currentTotalAssets: number, previousTotalAssets: number): number {
  if (previousTotalAssets === 0) return 0;
  return parseFloat(((currentTotalAssets - previousTotalAssets) / previousTotalAssets).toFixed(2));
}

/**
 * PIYASA DEĞERI ORANLARI
 * Şirketin hisse senedi performansını değerlendiren oranlardır.
 */

// Fiyat/Kazanç Oranı (F/K, P/E): Hisse Senedi Fiyatı / Hisse Başına Kazanç
export function calculatePriceEarningsRatio(stockPrice: number, earningsPerShare: number): number {
  if (earningsPerShare === 0) return 0;
  return parseFloat((stockPrice / earningsPerShare).toFixed(2));
}

// Fiyat/Satış Oranı (F/S, P/S): Piyasa Değeri / Yıllık Net Satışlar
export function calculatePriceSalesRatio(marketCapitalization: number, annualNetSales: number): number {
  if (annualNetSales === 0) return 0;
  return parseFloat((marketCapitalization / annualNetSales).toFixed(2));
}

// Fiyat/Defter Değeri Oranı (F/DD, P/B): Hisse Senedi Fiyatı / Hisse Başına Defter Değeri
export function calculatePriceToBookRatio(stockPrice: number, bookValuePerShare: number): number {
  if (bookValuePerShare === 0) return 0;
  return parseFloat((stockPrice / bookValuePerShare).toFixed(2));
}

// Temettü Verimi: Yıllık Temettü / Hisse Senedi Fiyatı
export function calculateDividendYield(annualDividend: number, stockPrice: number): number {
  if (stockPrice === 0) return 0;
  return parseFloat((annualDividend / stockPrice).toFixed(2));
}

// Temettü Ödeme Oranı: Ödenen Temettü / Net Kâr
export function calculateDividendPayoutRatio(dividendPaid: number, netProfit: number): number {
  if (netProfit === 0) return 0;
  return parseFloat((dividendPaid / netProfit).toFixed(2));
}

/**
 * Oranların değerlendirmesini yapan yardımcı fonksiyonlar
 */

// Cari Oran Değerlendirmesi
export function evaluateCurrentRatio(ratio: number): string {
  if (ratio < 1) return "Zayıf: Şirketin kısa vadeli borçlarını ödeme gücü düşük olabilir.";
  if (ratio >= 1 && ratio < 1.5) return "Yeterli: Şirket kısa vadeli borçlarını ödeyebilir durumda.";
  if (ratio >= 1.5 && ratio < 2) return "İyi: Şirket kısa vadeli borçlarını rahatlıkla ödeyebilir.";
  return "Çok İyi: Şirket güçlü bir likiditeye sahip.";
}

// Asit-Test Oranı Değerlendirmesi
export function evaluateAcidTestRatio(ratio: number): string {
  if (ratio < 0.7) return "Zayıf: Şirketin acil ödeme gücü düşük olabilir.";
  if (ratio >= 0.7 && ratio < 1) return "Yeterli: Şirket acil ödemelerini karşılayabilir durumda.";
  if (ratio >= 1 && ratio < 1.5) return "İyi: Şirket acil borçlarını rahatlıkla ödeyebilir.";
  return "Çok İyi: Şirket çok güçlü bir acil ödeme gücüne sahip.";
}

// Borç/Özsermaye Oranı Değerlendirmesi
export function evaluateDebtToEquityRatio(ratio: number): string {
  if (ratio > 2) return "Riskli: Şirketin finansal kaldıraç oranı çok yüksek.";
  if (ratio > 1 && ratio <= 2) return "Dikkat: Şirketin borçları özkaynağından fazla.";
  if (ratio > 0.5 && ratio <= 1) return "Normal: Şirketin borç-özkaynak dengesi kabul edilebilir seviyede.";
  return "Güvenli: Şirket düşük finansal riske sahip.";
}

// Net Kâr Marjı Değerlendirmesi
export function evaluateNetProfitMargin(ratio: number): string {
  if (ratio < 0.05) return "Düşük: Şirketin net kâr marjı düşük.";
  if (ratio >= 0.05 && ratio < 0.1) return "Orta: Şirketin net kâr marjı orta seviyede.";
  if (ratio >= 0.1 && ratio < 0.2) return "İyi: Şirketin net kâr marjı iyi seviyede.";
  return "Mükemmel: Şirketin net kâr marjı çok yüksek.";
}

// ROE Değerlendirmesi
export function evaluateReturnOnEquity(ratio: number): string {
  if (ratio < 0.1) return "Düşük: Şirketin özkaynak kârlılığı düşük.";
  if (ratio >= 0.1 && ratio < 0.15) return "Orta: Şirketin özkaynak kârlılığı orta seviyede.";
  if (ratio >= 0.15 && ratio < 0.2) return "İyi: Şirketin özkaynak kârlılığı iyi seviyede.";
  return "Mükemmel: Şirketin özkaynak kârlılığı çok yüksek.";
}

// Tüm finansal oran kategorileri ve içerdiği oranlar
export const ratioCategories = {
  liquidity: {
    name: "Likidite Oranları",
    description: "Şirketin kısa vadeli borçlarını ödeme gücünü ölçer",
    ratios: [
      {
        id: "currentRatio",
        name: "Cari Oran",
        formula: "Dönen Varlıklar / Kısa Vadeli Yükümlülükler",
        description: "Şirketin kısa vadeli borçlarını ödeme yeteneğini gösterir"
      },
      {
        id: "liquidityRatio",
        name: "Likidite Oranı",
        formula: "(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler",
        description: "Şirketin stoklarını satmadan kısa vadeli borçlarını ödeme yeteneğini gösterir"
      },
      {
        id: "acidTestRatio",
        name: "Asit-Test Oranı",
        formula: "(Nakit + Menkul Kıymetler + Ticari Alacaklar) / Kısa Vadeli Yükümlülükler",
        description: "Şirketin en likit varlıklarıyla kısa vadeli borçlarını ödeme yeteneğini gösterir"
      },
      {
        id: "cashRatio",
        name: "Nakit Oranı",
        formula: "(Nakit + Menkul Kıymetler) / Kısa Vadeli Yükümlülükler",
        description: "Şirketin sadece nakit ve nakit benzerlerini kullanarak kısa vadeli borçlarını ödeme yeteneğini gösterir"
      }
    ]
  },
  financialStructure: {
    name: "Finansal Yapı Oranları",
    description: "Şirketin sermaye yapısını ve uzun vadeli ödeme gücünü ölçer",
    ratios: [
      {
        id: "debtRatio",
        name: "Borç Oranı",
        formula: "Toplam Borçlar / Toplam Varlıklar",
        description: "Şirketin varlıklarının ne kadarının borçla finanse edildiğini gösterir"
      },
      {
        id: "equityRatio",
        name: "Özsermaye Oranı",
        formula: "Özsermaye / Toplam Varlıklar",
        description: "Şirketin varlıklarının ne kadarının özsermaye ile finanse edildiğini gösterir"
      },
      {
        id: "debtToEquityRatio",
        name: "Borç/Özsermaye Oranı",
        formula: "Toplam Borçlar / Özsermaye",
        description: "Şirketin borçlarının özsermayeye oranını gösterir"
      },
      {
        id: "interestCoverageRatio",
        name: "Faiz Karşılama Oranı",
        formula: "FVÖK / Faiz Giderleri",
        description: "Şirketin faiz ödemelerini karşılayabilme gücünü gösterir"
      },
      {
        id: "longTermDebtRatio",
        name: "Uzun Vadeli Borç Oranı",
        formula: "Uzun Vadeli Borçlar / Toplam Varlıklar",
        description: "Uzun vadeli borçların toplam varlıklara oranını gösterir"
      }
    ]
  },
  activity: {
    name: "Faaliyet (Devir Hızı) Oranları",
    description: "Şirketin varlıklarını ne kadar etkin kullandığını ölçer",
    ratios: [
      {
        id: "assetTurnoverRatio",
        name: "Aktif Devir Hızı",
        formula: "Net Satışlar / Ortalama Toplam Varlıklar",
        description: "Şirketin varlıklarını satışa dönüştürme etkinliğini gösterir"
      },
      {
        id: "receivablesTurnoverRatio",
        name: "Alacak Devir Hızı",
        formula: "Net Satışlar / Ortalama Ticari Alacaklar",
        description: "Şirketin alacaklarını tahsil etme hızını gösterir"
      },
      {
        id: "inventoryTurnoverRatio",
        name: "Stok Devir Hızı",
        formula: "Satışların Maliyeti / Ortalama Stoklar",
        description: "Şirketin stoklarını satma hızını gösterir"
      },
      {
        id: "payablesTurnoverRatio",
        name: "Ticari Borç Devir Hızı",
        formula: "Satışların Maliyeti / Ortalama Ticari Borçlar",
        description: "Şirketin ticari borçlarını ödeme hızını gösterir"
      },
      {
        id: "currentAssetsTurnoverRatio",
        name: "Dönen Varlık Devir Hızı",
        formula: "Net Satışlar / Ortalama Dönen Varlıklar",
        description: "Dönen varlıkların etkinliğini gösterir"
      },
      {
        id: "fixedAssetsTurnoverRatio",
        name: "Duran Varlık Devir Hızı",
        formula: "Net Satışlar / Ortalama Duran Varlıklar",
        description: "Duran varlıkların etkinliğini gösterir"
      }
    ]
  },
  profitability: {
    name: "Kârlılık Oranları",
    description: "Şirketin kâr elde etme yeteneğini ölçer",
    ratios: [
      {
        id: "grossProfitMargin",
        name: "Brüt Kâr Marjı",
        formula: "Brüt Kâr / Net Satışlar",
        description: "Şirketin satışlarından ne kadar brüt kâr elde ettiğini gösterir"
      },
      {
        id: "operatingProfitMargin",
        name: "Faaliyet Kâr Marjı",
        formula: "Faaliyet Kârı / Net Satışlar",
        description: "Şirketin esas faaliyetlerinden ne kadar kâr elde ettiğini gösterir"
      },
      {
        id: "netProfitMargin",
        name: "Net Kâr Marjı",
        formula: "Net Kâr / Net Satışlar",
        description: "Şirketin satışlarından ne kadar net kâr elde ettiğini gösterir"
      },
      {
        id: "returnOnEquity",
        name: "Özkaynak Kârlılığı (ROE)",
        formula: "Net Kâr / Ortalama Özsermaye",
        description: "Özkaynakların ne kadar etkin kullanıldığını gösterir"
      },
      {
        id: "returnOnAssets",
        name: "Varlık Kârlılığı (ROA)",
        formula: "Net Kâr / Ortalama Toplam Varlıklar",
        description: "Varlıkların ne kadar etkin kullanıldığını gösterir"
      },
      {
        id: "returnOnCapitalEmployed",
        name: "Yatırılan Sermaye Kârlılığı (ROCE)",
        formula: "FVÖK / (Toplam Varlıklar - Kısa Vadeli Yükümlülükler)",
        description: "Şirketin uzun vadeli sermaye kullanımındaki verimliliğini gösterir"
      }
    ]
  },
  growth: {
    name: "Büyüme Oranları",
    description: "Şirketin zaman içindeki büyümesini ölçer",
    ratios: [
      {
        id: "salesGrowthRate",
        name: "Satış Büyüme Oranı",
        formula: "(Cari Dönem Satışları - Önceki Dönem Satışları) / Önceki Dönem Satışları",
        description: "Şirketin satışlarının bir önceki döneme göre büyüme oranını gösterir"
      },
      {
        id: "netProfitGrowthRate",
        name: "Net Kâr Büyüme Oranı",
        formula: "(Cari Dönem Net Kârı - Önceki Dönem Net Kârı) / Önceki Dönem Net Kârı",
        description: "Şirketin net kârının bir önceki döneme göre büyüme oranını gösterir"
      },
      {
        id: "assetGrowthRate",
        name: "Varlık Büyüme Oranı",
        formula: "(Cari Dönem Toplam Varlıkları - Önceki Dönem Toplam Varlıkları) / Önceki Dönem Toplam Varlıkları",
        description: "Şirketin toplam varlıklarının bir önceki döneme göre büyüme oranını gösterir"
      }
    ]
  },
  market: {
    name: "Piyasa Değeri Oranları",
    description: "Şirketin hisse senedi performansını değerlendirir",
    ratios: [
      {
        id: "priceEarningsRatio",
        name: "Fiyat/Kazanç Oranı (F/K)",
        formula: "Hisse Senedi Fiyatı / Hisse Başına Kazanç",
        description: "Şirketin hisse senedi fiyatının, hisse başına düşen kâra oranını gösterir"
      },
      {
        id: "priceSalesRatio",
        name: "Fiyat/Satış Oranı (F/S)",
        formula: "Piyasa Değeri / Yıllık Net Satışlar",
        description: "Şirketin piyasa değerinin, yıllık net satışlara oranını gösterir"
      },
      {
        id: "priceToBookRatio",
        name: "Fiyat/Defter Değeri Oranı (F/DD)",
        formula: "Hisse Senedi Fiyatı / Hisse Başına Defter Değeri",
        description: "Hisse fiyatının, hisse başına düşen defter değerine oranını gösterir"
      },
      {
        id: "dividendYield",
        name: "Temettü Verimi",
        formula: "Yıllık Temettü / Hisse Senedi Fiyatı",
        description: "Hisse senedi fiyatına göre temettü verimini gösterir"
      },
      {
        id: "dividendPayoutRatio",
        name: "Temettü Ödeme Oranı",
        formula: "Ödenen Temettü / Net Kâr",
        description: "Şirketin net kârının ne kadarını temettü olarak dağıttığını gösterir"
      }
    ]
  }
};