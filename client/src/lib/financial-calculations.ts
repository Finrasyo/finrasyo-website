// Calculate current ratio: Current Assets / Current Liabilities
export function calculateCurrentRatio(
  totalCurrentAssets: number,
  totalCurrentLiabilities: number
): number {
  if (totalCurrentLiabilities === 0) return 0;
  return parseFloat((totalCurrentAssets / totalCurrentLiabilities).toFixed(2));
}

// Calculate liquidity ratio: (Current Assets - Inventory) / Current Liabilities
export function calculateLiquidityRatio(
  totalCurrentAssets: number,
  inventory: number,
  totalCurrentLiabilities: number
): number {
  if (totalCurrentLiabilities === 0) return 0;
  return parseFloat(((totalCurrentAssets - inventory) / totalCurrentLiabilities).toFixed(2));
}

// Calculate acid-test ratio: Cash and Cash Equivalents / Current Liabilities
export function calculateAcidTestRatio(
  cashAndEquivalents: number,
  totalCurrentLiabilities: number
): number {
  if (totalCurrentLiabilities === 0) return 0;
  return parseFloat((cashAndEquivalents / totalCurrentLiabilities).toFixed(2));
}

// Generate a comprehensive analysis of the financial ratios
export function generateRatioAnalysis(
  currentRatio: number,
  liquidityRatio: number,
  acidTestRatio: number,
  companyName: string
): string {
  let analysis = `${companyName}'nin likidite durumu `;
  
  // Overall liquidity status
  if (currentRatio >= 2.0 && liquidityRatio >= 1.0 && acidTestRatio >= 0.5) {
    analysis += "genel olarak <strong>iyi</strong> seviyededir. ";
  } else if (currentRatio >= 1.5 && liquidityRatio >= 0.8 && acidTestRatio >= 0.3) {
    analysis += "genel olarak <strong>yeterli</strong> seviyededir. ";
  } else if (currentRatio >= 1.0 && liquidityRatio >= 0.5 && acidTestRatio >= 0.2) {
    analysis += "genel olarak <strong>orta</strong> seviyededir. ";
  } else {
    analysis += "genel olarak <strong>zayıf</strong> seviyededir. ";
  }
  
  // Current ratio analysis
  analysis += `Cari oranın ${currentRatio.toFixed(2)} olması, şirketin kısa vadeli borçlarını ödeyebilme kapasitesinin `;
  if (currentRatio >= 2.0) {
    analysis += "güçlü olduğunu göstermektedir. ";
  } else if (currentRatio >= 1.5) {
    analysis += "yeterli olduğunu göstermektedir. ";
  } else if (currentRatio >= 1.0) {
    analysis += "kabul edilebilir olduğunu göstermektedir. ";
  } else {
    analysis += "yetersiz olduğunu göstermektedir. ";
  }
  
  // Liquidity ratio and acid-test ratio analysis
  analysis += "Likidite oranı ve asit-test oranı ";
  if ((liquidityRatio >= 1.0 && acidTestRatio >= 0.5) || 
      (liquidityRatio >= 0.8 && acidTestRatio >= 0.3)) {
    analysis += "sektör ortalamalarına yakın seviyelerdedir. ";
  } else {
    analysis += "sektör ortalamalarının altında seyretmektedir. ";
  }
  
  // Cash position
  if (acidTestRatio >= 0.5) {
    analysis += "Şirketin nakit pozisyonu güçlüdür.";
  } else if (acidTestRatio >= 0.3) {
    analysis += "Şirketin nakit pozisyonu orta seviyededir.";
  } else {
    analysis += "Şirketin nakit pozisyonunu güçlendirmesi önerilir.";
  }
  
  return analysis;
}
