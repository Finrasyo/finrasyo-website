/**
 * FinRasyo Finansal Hesaplama ve Analiz İşlevleri
 * 
 * Bu modül, şirketlerin finansal verilerinden oran hesaplaması ve analizleri yapar.
 * Şirket verilerini işleyerek raporlar oluşturmaya yardımcı olur.
 */

import * as financialRatios from "./financial-ratios";

/**
 * Finansal verilere göre 'Cari Oran' hesaplar
 */
export function calculateCurrentRatio(
  currentAssets: number,
  shortTermLiabilities: number
): { value: number; interpretation: string } {
  const value = financialRatios.calculateCurrentRatio(currentAssets, shortTermLiabilities);
  return {
    value,
    interpretation: financialRatios.evaluateRatio("Cari Oran", value),
  };
}

/**
 * Finansal verilere göre 'Asit-Test Oranı' hesaplar
 */
export function calculateAcidTestRatio(
  currentAssets: number,
  inventory: number,
  shortTermLiabilities: number
): { value: number; interpretation: string } {
  const value = financialRatios.calculateAcidTestRatio(currentAssets, inventory, shortTermLiabilities);
  return {
    value,
    interpretation: financialRatios.evaluateRatio("Asit-Test Oranı", value),
  };
}

/**
 * Finansal verilere göre 'Nakit Oran' hesaplar
 */
export function calculateCashRatio(
  cashAndEquivalents: number,
  shortTermLiabilities: number
): { value: number; interpretation: string } {
  const value = financialRatios.calculateCashRatio(cashAndEquivalents, shortTermLiabilities);
  return {
    value,
    interpretation: financialRatios.evaluateRatio("Nakit Oran", value),
  };
}

/**
 * Finansal verilere göre 'Finansal Kaldıraç Oranı' hesaplar
 */
export function calculateFinancialLeverageRatio(
  shortTermLiabilities: number,
  longTermLiabilities: number,
  totalAssets: number
): { value: number; interpretation: string } {
  const value = financialRatios.calculateFinancialLeverageRatio(
    shortTermLiabilities,
    longTermLiabilities,
    totalAssets
  );
  return {
    value,
    interpretation: financialRatios.evaluateRatio("Finansal Kaldıraç Oranı", value),
  };
}

/**
 * Finansal verileri işleyerek tüm oranları hesaplar ve değerlendirir
 */
export function generateRatioAnalysis(financialData: any): Record<string, { value: number; interpretation: string }> {
  // Eksik finansal veriler için varsayılan değerler
  const data = {
    currentAssets: financialData.currentAssets || 0,
    inventory: financialData.inventory || 0,
    cashAndEquivalents: financialData.cashAndEquivalents || 0,
    shortTermLiabilities: financialData.shortTermLiabilities || 0,
    longTermLiabilities: financialData.longTermLiabilities || 0,
    totalAssets: financialData.totalAssets || 0,
    equity: financialData.equity || 0, 
    fixedAssets: financialData.fixedAssets || 0,
    tangibleFixedAssets: financialData.tangibleFixedAssets || 0,
    totalLiabilities: financialData.totalLiabilities || 
      (financialData.shortTermLiabilities || 0) + (financialData.longTermLiabilities || 0),
    grossProfit: financialData.grossProfit || 0,
    operatingProfit: financialData.operatingProfit || 0,
    netProfit: financialData.netProfit || 0,
    netSales: financialData.netSales || 0
  };

  // Tüm oranları hesapla
  const ratios: Record<string, { value: number; interpretation: string }> = {};

  // 1. Likidite Oranları
  ratios["Cari Oran"] = {
    value: financialRatios.calculateCurrentRatio(
      data.currentAssets,
      data.shortTermLiabilities
    ),
    interpretation: financialRatios.evaluateRatio("Cari Oran", 
      financialRatios.calculateCurrentRatio(data.currentAssets, data.shortTermLiabilities)
    )
  };

  ratios["Asit-Test Oranı"] = {
    value: financialRatios.calculateAcidTestRatio(
      data.currentAssets,
      data.inventory,
      data.shortTermLiabilities
    ),
    interpretation: financialRatios.evaluateRatio("Asit-Test Oranı", 
      financialRatios.calculateAcidTestRatio(data.currentAssets, data.inventory, data.shortTermLiabilities)
    )
  };

  ratios["Nakit Oran"] = {
    value: financialRatios.calculateCashRatio(
      data.cashAndEquivalents,
      data.shortTermLiabilities
    ),
    interpretation: financialRatios.evaluateRatio("Nakit Oran", 
      financialRatios.calculateCashRatio(data.cashAndEquivalents, data.shortTermLiabilities)
    )
  };

  // 2. Finansal Yapı Oranları
  ratios["Finansal Kaldıraç Oranı"] = {
    value: financialRatios.calculateFinancialLeverageRatio(
      data.shortTermLiabilities,
      data.longTermLiabilities,
      data.totalAssets
    ),
    interpretation: financialRatios.evaluateRatio("Finansal Kaldıraç Oranı", 
      financialRatios.calculateFinancialLeverageRatio(
        data.shortTermLiabilities,
        data.longTermLiabilities,
        data.totalAssets
      )
    )
  };

  ratios["Özkaynak-Aktif Toplam Oranı"] = {
    value: financialRatios.calculateEquityToAssetsRatio(
      data.equity,
      data.totalAssets
    ),
    interpretation: financialRatios.evaluateRatio("Borç Oranı", 
      financialRatios.calculateEquityToAssetsRatio(data.equity, data.totalAssets)
    )
  };

  ratios["Özkaynak-Toplam Yabancı Kaynak Oranı"] = {
    value: financialRatios.calculateEquityToDebtRatio(
      data.equity,
      data.shortTermLiabilities,
      data.longTermLiabilities
    ),
    interpretation: financialRatios.evaluateRatio("Borç/Özsermaye Oranı", 
      financialRatios.calculateEquityToDebtRatio(
        data.equity, 
        data.shortTermLiabilities, 
        data.longTermLiabilities
      )
    )
  };

  ratios["Kısa Vadeli Yabancı Kaynak Oranı"] = {
    value: financialRatios.calculateShortTermLiabilitiesToTotalLiabilitiesRatio(
      data.shortTermLiabilities,
      data.totalLiabilities
    ),
    interpretation: "Bu oran, toplam yabancı kaynaklar içinde kısa vadeli borçların oranını gösterir"
  };

  ratios["Uzun Vadeli Yabancı Kaynak Oranı"] = {
    value: financialRatios.calculateLongTermLiabilitiesToTotalLiabilitiesRatio(
      data.longTermLiabilities,
      data.totalLiabilities
    ),
    interpretation: "Bu oran, toplam yabancı kaynaklar içinde uzun vadeli borçların oranını gösterir"
  };

  ratios["Duran Varlıkların Özkaynaklara Oranı"] = {
    value: financialRatios.calculateFixedAssetsToEquityRatio(
      data.fixedAssets,
      data.equity
    ),
    interpretation: "Bu oran, duran varlıkların ne kadarlık kısmının özkaynaklarla finanse edildiğini gösterir"
  };

  ratios["Duran Varlıkların Devamlı Sermayeye Oranı"] = {
    value: financialRatios.calculateFixedAssetsToPermanentCapitalRatio(
      data.fixedAssets,
      data.longTermLiabilities,
      data.equity
    ),
    interpretation: "Bu oran, duran varlıkların ne kadarlık kısmının uzun vadeli kaynaklarla finanse edildiğini gösterir"
  };

  ratios["Maddi Duran Varlıkların Özkaynaklara Oranı"] = {
    value: financialRatios.calculateTangibleFixedAssetsToEquityRatio(
      data.tangibleFixedAssets,
      data.equity
    ),
    interpretation: "Bu oran, maddi duran varlıkların ne kadarlık kısmının özkaynaklarla finanse edildiğini gösterir"
  };

  // 3. Karlılık Oranları
  ratios["Brüt Satış Kârlılığı Oranı"] = {
    value: financialRatios.calculateGrossProfitMarginRatio(
      data.grossProfit,
      data.netSales
    ),
    interpretation: financialRatios.evaluateRatio("Brüt Kar Marjı", 
      financialRatios.calculateGrossProfitMarginRatio(data.grossProfit, data.netSales)
    )
  };

  ratios["Faaliyet Kârlılığı Oranı"] = {
    value: financialRatios.calculateOperatingProfitMarginRatio(
      data.operatingProfit,
      data.netSales
    ),
    interpretation: "Bu oran, şirketin ana faaliyetlerinden ne kadar kâr elde ettiğini gösterir"
  };

  ratios["Net Karlılık Oranı"] = {
    value: financialRatios.calculateNetProfitMarginRatio(
      data.netProfit,
      data.netSales
    ),
    interpretation: financialRatios.evaluateRatio("Net Kar Marjı", 
      financialRatios.calculateNetProfitMarginRatio(data.netProfit, data.netSales)
    )
  };

  ratios["Özkaynak Karlılığı Oranı"] = {
    value: financialRatios.calculateReturnOnEquityRatio(
      data.netProfit,
      data.equity
    ),
    interpretation: financialRatios.evaluateRatio("Özkaynak Karlılığı", 
      financialRatios.calculateReturnOnEquityRatio(data.netProfit, data.equity)
    )
  };

  ratios["Aktif Karlılık Oranı"] = {
    value: financialRatios.calculateReturnOnAssetsRatio(
      data.netProfit,
      data.totalAssets
    ),
    interpretation: financialRatios.evaluateRatio("Varlık Karlılığı", 
      financialRatios.calculateReturnOnAssetsRatio(data.netProfit, data.totalAssets)
    )
  };

  return ratios;
}

/**
 * Farklı finansal tablo dönemleri arasında karşılaştırma yapar
 */
export function compareFinancialPeriods(
  currentPeriod: any,
  previousPeriod: any
): Record<string, { current: number; previous: number; change: number; changePercent: string }> {
  const metrics: Record<string, { current: number; previous: number; change: number; changePercent: string }> = {};
  
  // Karşılaştırma yapılacak ana metrikler
  const keysToCompare = [
    "currentAssets",
    "totalAssets",
    "shortTermLiabilities",
    "longTermLiabilities",
    "equity",
    "netSales",
    "grossProfit",
    "operatingProfit",
    "netProfit"
  ];
  
  // Her metrik için değişim hesapla
  keysToCompare.forEach(key => {
    const current = currentPeriod[key] || 0;
    const previous = previousPeriod[key] || 0;
    const change = current - previous;
    const changePercent = previous !== 0 
      ? `${((change / previous) * 100).toFixed(2)}%` 
      : "N/A";
    
    metrics[key] = {
      current,
      previous,
      change,
      changePercent
    };
  });
  
  // Mevcut ve önceki dönemin finansal oranlarını hesapla
  const currentRatios = generateRatioAnalysis(currentPeriod);
  const previousRatios = generateRatioAnalysis(previousPeriod);
  
  // Oranları da karşılaştırmaya ekle
  Object.keys(currentRatios).forEach(ratioKey => {
    const current = currentRatios[ratioKey].value;
    const previous = previousRatios[ratioKey]?.value || 0;
    const change = current - previous;
    const changePercent = previous !== 0 
      ? `${((change / previous) * 100).toFixed(2)}%` 
      : "N/A";
    
    metrics[`ratio_${ratioKey}`] = {
      current,
      previous,
      change,
      changePercent
    };
  });
  
  return metrics;
}

/**
 * Finansal verileri formatlar (birim, binlik ayırma, vb.)
 */
export function formatFinancialValue(value: number, options?: { 
  currency?: string; 
  decimals?: number; 
  compact?: boolean;
}): string {
  const { currency = "₺", decimals = 2, compact = true } = options || {};
  
  // Finansal değeri formatlama
  if (compact) {
    if (Math.abs(value) >= 1000000000) {
      return `${currency}${(value / 1000000000).toFixed(decimals)}B`;
    } else if (Math.abs(value) >= 1000000) {
      return `${currency}${(value / 1000000).toFixed(decimals)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${currency}${(value / 1000).toFixed(decimals)}K`;
    }
  }
  
  // Sayıyı binlik ayırarak formatlama (1,234,567.89 gibi)
  const formatter = new Intl.NumberFormat('tr-TR', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return `${currency}${formatter.format(value)}`;
}