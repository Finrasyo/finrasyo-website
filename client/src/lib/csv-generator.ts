/**
 * CSV Rapor Oluşturma İşlevleri
 * 
 * Bu modül, finansal verileri işleyerek CSV formatında raporlar oluşturur.
 * Yıllara göre trendleri gösteren bir yapıda veriler sunulur.
 */

import { saveAs } from 'file-saver';
import { ratioCategories } from './financial-ratios';
import { formatFinancialValue, generateRatioAnalysis } from './financial-calculations';

// Trend analizi için örnek yıllar (normal şartlarda veritabanından getirilen veriler kullanılır)
const sampleYears = [2020, 2021, 2022, 2023, 2024];

// Örnek trend verileri oluşturma fonksiyonu
// (gerçek uygulamada bu veritabanından gelecektir)
const generateSampleTrendData = (ratioId: string, baseValue: number): Record<number, number> => {
  const result: Record<number, number> = {};
  
  // Her oranın kendine özgü trendi olsun
  let volatility = 0;
  
  switch (ratioId) {
    case 'currentRatio': 
      volatility = 0.3; 
      break;
    case 'acidTestRatio': 
      volatility = 0.2; 
      break;
    case 'cashRatio': 
      volatility = 0.15; 
      break;
    case 'debtRatio': 
      volatility = 0.05; 
      break;
    case 'debtToEquityRatio': 
      volatility = 0.1; 
      break;
    case 'grossProfitMargin': 
      volatility = 0.08; 
      break;
    case 'netProfitMargin': 
      volatility = 0.12; 
      break;
    default: 
      volatility = 0.1;
  }
  
  // Son 5 yıl için değerler oluştur
  sampleYears.forEach((year, index) => {
    // Yıla göre artış veya azalış ekleme
    const yearChange = (Math.sin(index * 0.8) * volatility);
    result[year] = Number((baseValue + yearChange).toFixed(2));
  });
  
  return result;
};

/**
 * CSV raporu oluşturur - Yeni Format
 * 
 * @param company Şirket bilgileri
 * @param financialData Finansal veriler
 * @param selectedRatios Kullanıcının seçtiği oranların kimlikleri (boş ise tüm oranlar gösterilir)
 * @returns CSV dosyası için Blob
 */
export async function generateCSVReport(
  company: { name: string; code: string | null; sector: string | null; id?: number },
  financialData: any,
  selectedRatios?: string[]
): Promise<Blob> {
  try {
    console.log("CSV raporu oluşturuluyor:", { 
      company: company.name,
      hasData: !!financialData,
      selectedRatios 
    });
    
    // CSV içeriğini tutacak dizi
    let csvContent = `"${company.name} Finansal Analiz Raporu"\n\n`;
    
    // Şirket bilgileri
    csvContent += `"Şirket","${company.name}"\n`;
    csvContent += `"Borsa Kodu","${company.code || 'N/A'}"\n`;
    csvContent += `"Sektör","${company.sector || 'N/A'}"\n`;
    csvContent += `"Rapor Tarihi","${new Date().toLocaleDateString('tr-TR')}"\n\n`;
    
    // Fonksiyon: Seçilen oranları kontrol et
    const isRatioSelected = (ratioId: string): boolean => {
      // Eğer selectedRatios dizisi boşsa veya undefined ise, tüm oranları göster
      if (!selectedRatios || selectedRatios.length === 0) return true;
      // Değilse, sadece seçilen oranları göster
      return selectedRatios.includes(ratioId);
    };
    
    // Mevcut finansal veri için oranları hesapla
    const ratios = generateRatioAnalysis(financialData);
    
    // Trend tablo başlığı
    csvContent += `\n"YILLARA GÖRE ORAN ANALİZİ"\n\n`;
    
    // Tüm seçili oranlar için trend tabloları oluştur
    function addRatioCategoryTrends(categoryName: string, categoryRatios: Array<{id: string, name: string}>) {
      csvContent += `"${categoryName}"\n\n`;
      
      for (const ratio of categoryRatios) {
        if (isRatioSelected(ratio.id)) {
          // Bu oran için başlık
          csvContent += `"${ratio.name}"\n`;
          
          // Yıl ve değer başlıkları
          csvContent += `"Yıl","Değer"\n`;
          
          // Mevcut veri için ratio değerini al
          const currentRatioValue = ratios[ratio.id]?.value || 0;
          
          // Örnek trend verileri oluştur (gerçek uygulamada db'den gelecektir)
          const trendData = generateSampleTrendData(ratio.id, currentRatioValue);
          
          // Her yıl için veri satırı
          sampleYears.forEach(year => {
            csvContent += `"${year}","${trendData[year] || 0}"\n`;
          });
          
          // Ekstra boşluk
          csvContent += `\n`;
        }
      }
    }
    
    // Likidite Oranları
    let hasLiquidityRatios = ratioCategories.liquidity.some(ratio => isRatioSelected(ratio.id));
    if (hasLiquidityRatios) {
      addRatioCategoryTrends('LİKİDİTE ORANLARI', ratioCategories.liquidity);
    }
    
    // Finansal Yapı Oranları
    let hasStructureRatios = ratioCategories.financialStructure.some(ratio => isRatioSelected(ratio.id));
    if (hasStructureRatios) {
      addRatioCategoryTrends('FİNANSAL YAPI ORANLARI', ratioCategories.financialStructure);
    }
    
    // Karlılık Oranları
    let hasProfitabilityRatios = ratioCategories.profitability.some(ratio => isRatioSelected(ratio.id));
    if (hasProfitabilityRatios) {
      addRatioCategoryTrends('KARLILIK ORANLARI', ratioCategories.profitability);
    }
    
    // Yasal uyarı ekle
    csvContent += `\n"Bu rapordaki veriler finansal analiz amaçlıdır ve yatırım tavsiyesi niteliği taşımaz."\n`;
    csvContent += `"© FinRasyo ${new Date().getFullYear()}"\n`;
    
    // CSV dosyasını BOM ile oluştur (Türkçe karakterler için)
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;
    
    // CSV dosyasını blob olarak oluştur
    return new Blob([csvContentWithBOM], { 
      type: 'text/csv;charset=utf-8;' 
    });
  } catch (error) {
    console.error("CSV raporu oluşturma hatası:", error);
    throw new Error(`CSV raporu oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * CSV raporunu indirir
 */
export function downloadCSVReport(blob: Blob, filename: string): void {
  try {
    console.log(`CSV raporu indiriliyor: ${filename}`, {
      blobSize: blob.size,
      blobType: blob.type
    });
    
    saveAs(blob, filename);
    console.log("CSV rapor indirme işlemi başarılı");
  } catch (error) {
    console.error("CSV rapor indirme hatası:", error);
    throw new Error(`CSV raporu indirilemedi: ${error instanceof Error ? error.message : String(error)}`);
  }
}