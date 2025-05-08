/**
 * FinRasyo Finansal Oran Hesaplamaları
 * 
 * Bu modül, şirketlerin finansal tablolarından hesaplanan finansal oranları içerir.
 * Hesaplamalar Türkiye Muhasebe Standartlarına uygun olarak yapılmıştır.
 */

// 1. LİKİDİTE ORANLARI

/**
 * Cari Oran = Dönen Varlıklar / Kısa Vadeli Yabancı Kaynaklar
 * 
 * Şirketin kısa vadeli borçlarını ödeme yeteneğini gösterir.
 * İdeal değer: 1.5-2 arasında
 */
export function calculateCurrentRatio(currentAssets: number, shortTermLiabilities: number): number {
  if (shortTermLiabilities === 0) return 0;
  return currentAssets / shortTermLiabilities;
}

/**
 * Asit-Test Oranı = (Dönen Varlıklar - Stoklar) / Kısa Vadeli Yabancı Kaynaklar
 * 
 * Şirketin stokları olmadan kısa vadeli borçlarını ödeme yeteneğini gösterir.
 * İdeal değer: 1 civarında
 */
export function calculateAcidTestRatio(currentAssets: number, inventory: number, shortTermLiabilities: number): number {
  if (shortTermLiabilities === 0) return 0;
  return (currentAssets - inventory) / shortTermLiabilities;
}

/**
 * Nakit Oran = Nakit ve Nakit Benzerleri / Kısa Vadeli Yabancı Kaynaklar
 * 
 * Şirketin sadece nakit ve benzerlerini kullanarak kısa vadeli borçlarını ödeme yeteneğini gösterir.
 * İdeal değer: 0.2 civarında
 */
export function calculateCashRatio(cashAndEquivalents: number, shortTermLiabilities: number): number {
  if (shortTermLiabilities === 0) return 0;
  return cashAndEquivalents / shortTermLiabilities;
}

// 2. FİNANSAL YAPI ORANLARI

/**
 * Finansal Kaldıraç Oranı = (Kısa Vadeli Yabancı Kaynaklar + Uzun Vadeli Yabancı Kaynaklar) / Aktif Toplam
 * 
 * Şirketin varlıklarının ne kadarının yabancı kaynaklarla finanse edildiğini gösterir.
 * İdeal değer: 0.5 civarında
 */
export function calculateFinancialLeverageRatio(shortTermLiabilities: number, longTermLiabilities: number, totalAssets: number): number {
  if (totalAssets === 0) return 0;
  return (shortTermLiabilities + longTermLiabilities) / totalAssets;
}

/**
 * Özkaynak-Aktif Toplam Oranı = Özkaynaklar / Aktif Toplam
 * 
 * Şirketin varlıklarının ne kadarının özkaynaklarla finanse edildiğini gösterir.
 * İdeal değer: 0.5 civarında
 */
export function calculateEquityToAssetsRatio(equity: number, totalAssets: number): number {
  if (totalAssets === 0) return 0;
  return equity / totalAssets;
}

/**
 * Özkaynak-Toplam Yabancı Kaynak Oranı = Özkaynaklar / (Kısa Vadeli Yabancı Kaynak + Uzun Vadeli Yabancı Kaynak)
 * 
 * Şirketin borçlarına karşılık özkaynaklarının yeterliliğini gösterir.
 * İdeal değer: 1 veya üzeri
 */
export function calculateEquityToDebtRatio(equity: number, shortTermLiabilities: number, longTermLiabilities: number): number {
  const totalLiabilities = shortTermLiabilities + longTermLiabilities;
  if (totalLiabilities === 0) return 0;
  return equity / totalLiabilities;
}

/**
 * Kısa Vadeli Yabancı Kaynak Oranı = Kısa Vadeli Yabancı Kaynak / Pasif Toplam
 * 
 * Şirketin toplam kaynaklarının ne kadarının kısa vadeli yabancı kaynaklardan oluştuğunu gösterir.
 */
export function calculateShortTermLiabilitiesToTotalLiabilitiesRatio(shortTermLiabilities: number, totalLiabilities: number): number {
  if (totalLiabilities === 0) return 0;
  return shortTermLiabilities / totalLiabilities;
}

/**
 * Uzun Vadeli Yabancı Kaynak Oranı = Uzun Vadeli Yabancı Kaynak / Pasif Toplam
 * 
 * Şirketin toplam kaynaklarının ne kadarının uzun vadeli yabancı kaynaklardan oluştuğunu gösterir.
 */
export function calculateLongTermLiabilitiesToTotalLiabilitiesRatio(longTermLiabilities: number, totalLiabilities: number): number {
  if (totalLiabilities === 0) return 0;
  return longTermLiabilities / totalLiabilities;
}

/**
 * Duran Varlıkların Özkaynaklara Oranı = Duran Varlıklar / Özkaynaklar
 * 
 * Duran varlıkların ne kadarının özkaynaklarla finanse edildiğini gösterir.
 * İdeal değer: 1 civarında
 */
export function calculateFixedAssetsToEquityRatio(fixedAssets: number, equity: number): number {
  if (equity === 0) return 0;
  return fixedAssets / equity;
}

/**
 * Duran Varlıkların Devamlı Sermayeye Oranı = Duran Varlıklar / (Uzun Vadeli Yabancı Kaynaklar + Özkaynaklar)
 * 
 * Duran varlıkların ne kadarının uzun vadeli kaynaklarla finanse edildiğini gösterir.
 * İdeal değer: 1 civarında
 */
export function calculateFixedAssetsToPermanentCapitalRatio(fixedAssets: number, longTermLiabilities: number, equity: number): number {
  const permanentCapital = longTermLiabilities + equity;
  if (permanentCapital === 0) return 0;
  return fixedAssets / permanentCapital;
}

/**
 * Maddi Duran Varlıkların Özkaynaklara Oranı = Maddi Duran Varlıklar / Özkaynaklar
 * 
 * Maddi duran varlıkların ne kadarının özkaynaklarla finanse edildiğini gösterir.
 */
export function calculateTangibleFixedAssetsToEquityRatio(tangibleFixedAssets: number, equity: number): number {
  if (equity === 0) return 0;
  return tangibleFixedAssets / equity;
}

// 3. KARLILIK ORANLARI

/**
 * Brüt Satış Kârlılığı Oranı = Brüt Satış Karı / Net Satışlar
 * 
 * Şirketin satışlarından elde ettiği brüt kar marjını gösterir.
 */
export function calculateGrossProfitMarginRatio(grossProfit: number, netSales: number): number {
  if (netSales === 0) return 0;
  return grossProfit / netSales;
}

/**
 * Faaliyet Kârlılığı Oranı = Faaliyet Karı / Net Satışlar
 * 
 * Şirketin ana faaliyetlerinden elde ettiği kar marjını gösterir.
 */
export function calculateOperatingProfitMarginRatio(operatingProfit: number, netSales: number): number {
  if (netSales === 0) return 0;
  return operatingProfit / netSales;
}

/**
 * Net Karlılık Oranı = Net Kar / Net Satışlar
 * 
 * Şirketin satışlarından elde ettiği net kar marjını gösterir.
 */
export function calculateNetProfitMarginRatio(netProfit: number, netSales: number): number {
  if (netSales === 0) return 0;
  return netProfit / netSales;
}

/**
 * Özkaynak Karlılığı Oranı = Net Kar / Özkaynaklar
 * 
 * Şirketin özkaynaklarının ne kadar etkin kullanıldığını gösterir.
 */
export function calculateReturnOnEquityRatio(netProfit: number, equity: number): number {
  if (equity === 0) return 0;
  return netProfit / equity;
}

/**
 * Aktif Karlılık Oranı = Net Kar / Aktif Toplam
 * 
 * Şirketin varlıklarının ne kadar etkin kullanıldığını gösterir.
 */
export function calculateReturnOnAssetsRatio(netProfit: number, totalAssets: number): number {
  if (totalAssets === 0) return 0;
  return netProfit / totalAssets;
}

/**
 * Finansal oran değerlerine göre yorum yapar
 */
export function evaluateRatio(ratioName: string, value: number): string {
  // Varsayılan değerlendirme
  let evaluation = "Bilgi yok";
  
  switch(ratioName) {
    case "Cari Oran":
      if (value > 2) evaluation = "Çok iyi";
      else if (value >= 1.5) evaluation = "İyi";
      else if (value >= 1) evaluation = "Orta";
      else evaluation = "Dikkat edilmeli";
      break;
      
    case "Asit-Test Oranı":
      if (value > 1.5) evaluation = "Çok iyi";
      else if (value >= 1) evaluation = "İyi";
      else if (value >= 0.8) evaluation = "Orta";
      else evaluation = "Dikkat edilmeli";
      break;
      
    case "Nakit Oran":
      if (value > 0.3) evaluation = "Çok iyi";
      else if (value >= 0.2) evaluation = "İyi";
      else if (value >= 0.1) evaluation = "Orta";
      else evaluation = "Dikkat edilmeli";
      break;
      
    case "Finansal Kaldıraç Oranı":
      if (value < 0.4) evaluation = "Çok iyi";
      else if (value <= 0.5) evaluation = "İyi";
      else if (value <= 0.6) evaluation = "Orta";
      else evaluation = "Dikkat edilmeli";
      break;
      
    case "Özkaynak Karlılığı":
      if (value > 0.2) evaluation = "Çok iyi";
      else if (value >= 0.15) evaluation = "İyi";
      else if (value >= 0.1) evaluation = "Orta";
      else evaluation = "Dikkat edilmeli";
      break;
      
    case "Net Kar Marjı":
      if (value > 0.15) evaluation = "Çok iyi";
      else if (value >= 0.1) evaluation = "İyi";
      else if (value >= 0.05) evaluation = "Orta";
      else evaluation = "Dikkat edilmeli";
      break;
      
    default:
      evaluation = "Değerlendirme yok";
  }
  
  return evaluation;
}

// Finansal oran kategorileri
export const ratioCategories = {
  liquidity: ["Cari Oran", "Asit-Test Oranı", "Nakit Oran"],
  financialStructure: [
    "Finansal Kaldıraç Oranı", 
    "Özkaynak-Aktif Toplam Oranı", 
    "Özkaynak-Toplam Yabancı Kaynak Oranı",
    "Kısa Vadeli Yabancı Kaynak Oranı",
    "Uzun Vadeli Yabancı Kaynak Oranı",
    "Duran Varlıkların Özkaynaklara Oranı",
    "Duran Varlıkların Devamlı Sermayeye Oranı",
    "Maddi Duran Varlıkların Özkaynaklara Oranı"
  ],
  profitability: [
    "Brüt Satış Kârlılığı Oranı",
    "Faaliyet Kârlılığı Oranı",
    "Net Karlılık Oranı",
    "Özkaynak Karlılığı Oranı",
    "Aktif Karlılık Oranı"
  ]
};