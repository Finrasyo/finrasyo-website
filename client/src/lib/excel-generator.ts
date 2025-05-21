/**
 * Excel Rapor Oluşturma İşlevleri
 * 
 * Bu modül, finansal verileri işleyerek Excel formatında raporlar oluşturur.
 * Yıllara göre trendleri gösteren tablolar oluşturulur.
 */

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ratioCategories } from './financial-ratios';
import { formatFinancialValue, generateRatioAnalysis } from './financial-calculations';

// Trend analizi için örnek yıllar (normal şartlarda veritabanından getirilen veriler kullanılır)
const sampleYears = [2020, 2021, 2022, 2023, 2024];

// Bu function, örnek trend verileri oluşturur (gerçek uygulamada bu veritabanından gelecektir)
// Oran ID'lerini standardize etme fonksiyonu
function normalizeRatioId(ratioId: string): string {
  // ID eşleştirmeleri
  const idMappings: Record<string, string> = {
    'acidTestRatio': 'quickRatio',
    'quickRatio': 'quickRatio'
  };
  
  return idMappings[ratioId] || ratioId;
}

function generateSampleTrendData(ratioId: string, baseValue: number): Record<number, number> {
  const result: Record<number, number> = {};
  
  // Her oranın kendine özgü trendi olsun
  let volatility = 0;
  
  // ID'yi standardize et
  const normalizedId = normalizeRatioId(ratioId);
  
  switch (normalizedId) {
    case 'currentRatio': 
      volatility = 0.3; 
      break;
    case 'quickRatio': 
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
}

/**
 * Excel raporu oluşturur - Yeni Format
 * 
 * @param company Şirket bilgileri
 * @param financialData Finansal veriler
 * @param selectedRatios Kullanıcının seçtiği oranların kimlikleri (boş ise tüm oranlar gösterilir)
 * @returns Excel dosyası için Blob
 */
export async function generateExcelReport(
  company: { name: string; code: string | null; sector: string | null; id?: number },
  financialData: any,
  selectedRatios?: string[]
): Promise<Blob> {
  try {
    console.log("Excel raporu oluşturuluyor:", { 
      company: company.name,
      hasData: !!financialData,
      selectedRatios 
    });
    
    // ExcelJS Workbook oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FinRasyo';
    workbook.created = new Date();
    workbook.lastModifiedBy = 'FinRasyo';
    workbook.modified = new Date();
    
    // Güvenli bir şekilde çalışma sayfası adı oluştur
    const sheetName = company.code ? company.code.replace(/[\[\]\*\?:\/\\]/g, "_") : "Şirket";
    
    // İlk sayfaya şirket kodunu yaz - güvenli isimle
    const overviewSheet = workbook.addWorksheet(sheetName);
    
    // Hücre A1'e şirket kodunu yaz
    overviewSheet.getCell('A1').value = company.code;
    overviewSheet.getCell('A1').font = { bold: true };
    
    // Fonksiyon: Seçilen oranları kontrol et
    const isRatioSelected = (ratioId: string): boolean => {
      // Eğer selectedRatios dizisi boşsa veya undefined ise, hiçbir oranı gösterme
      if (!selectedRatios || selectedRatios.length === 0) return false;
      // Sadece seçilen oranları göster
      return selectedRatios.includes(ratioId);
    };
    
    // Mevcut finansal veri için oranları hesapla
    const ratios = generateRatioAnalysis(financialData);
    
    // Oran sayfaları oluştur
    // Çalışma sayfası adını temizleyen fonksiyon
    const sanitizeSheetName = (name: string): string => {
      // Excel'de çalışma sayfası adında yasaklanan karakterler: [ ] * ? / \ :
      // ve maksimum 31 karakter olabilir
      return name.replace(/[\[\]\*\?\/\\:]/g, '_').substring(0, 31);
    };
    
    const createRatioSheet = (ratioId: string, ratioName: string) => {
      // Bu oranı içeren yeni bir sayfa oluştur - güvenli isimle
      const safeSheetName = sanitizeSheetName(ratioName);
      const sheet = workbook.addWorksheet(safeSheetName);
      
      // Başlık hücrelerini oluştur
      sheet.getCell('A1').value = company.code;
      sheet.getCell('B1').value = ratioName;
      sheet.getCell('A1').font = { bold: true };
      sheet.getCell('B1').font = { bold: true };
      
      // Trend tablosunu hazırla
      let currentYear = new Date().getFullYear();
      
      // Baslık satırı
      sheet.getCell('A2').value = company.code;
      sheet.getCell('B2').value = ratioName;
      sheet.getCell('A2').font = { bold: true };
      sheet.getCell('B2').font = { bold: true };
      
      // Mevcut finansal veriden ratio değerini al
      const currentRatioValue = ratios[ratioId]?.value || 0;
      
      // Örnek trend verileri oluştur (gerçek uygulamada veritabanından gelecektir)
      const trendData = generateSampleTrendData(ratioId, currentRatioValue);
      
      // Yıl satırları
      let row = 3;
      sampleYears.forEach(year => {
        sheet.getCell(`A${row}`).value = year;
        sheet.getCell(`B${row}`).value = trendData[year] || 0;
        sheet.getCell(`B${row}`).numFmt = '0.00';
        row++;
      });
      
      // Kolon genişliklerini ayarla
      sheet.getColumn('A').width = 12;
      sheet.getColumn('B').width = 15;
      
      // Kenarlıkları ayarla
      for (let r = 2; r <= row - 1; r++) {
        for (let c = 1; c <= 2; c++) {
          const cell = sheet.getCell(r, c);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      }
      
      // Başlık satırı için dolgu rengi
      sheet.getCell('A2').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E0E0E0' }
      };
      
      sheet.getCell('B2').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E0E0E0' }
      };
    };
    
    // Seçilen oranlar için sayfalar oluştur
    // Likidite Oranları
    ratioCategories.liquidity.forEach(ratio => {
      if (isRatioSelected(ratio.id)) {
        createRatioSheet(ratio.id, ratio.name);
      }
    });
    
    // Finansal Yapı Oranları
    ratioCategories.financialStructure.forEach(ratio => {
      if (isRatioSelected(ratio.id)) {
        createRatioSheet(ratio.id, ratio.name);
      }
    });
    
    // Karlılık Oranları
    ratioCategories.profitability.forEach(ratio => {
      if (isRatioSelected(ratio.id)) {
        createRatioSheet(ratio.id, ratio.name);
      }
    });
    
    // Oran Analizi sayfası ekle - güvenli isimle
    const ratioAnalysisSheet = workbook.addWorksheet(sanitizeSheetName('Oran Analizi'));
    ratioAnalysisSheet.getCell('A1').value = 'Oran Adı';
    ratioAnalysisSheet.getCell('B1').value = 'Değer';
    ratioAnalysisSheet.getCell('C1').value = 'Değerlendirme';
    
    // Başlık satırı stili
    ['A1', 'B1', 'C1'].forEach(cell => {
      ratioAnalysisSheet.getCell(cell).font = { bold: true };
      ratioAnalysisSheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E0E0E0' }
      };
      ratioAnalysisSheet.getCell(cell).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Tüm seçilen oranları tek sayfada göster
    let row = 2;
    
    // Fonksiyon: Oran kategorisini ekleme
    const addRatioCategory = (categoryName: string, categoryRatios: Array<{id: string, name: string}>) => {
      // Kategori başlığı
      ratioAnalysisSheet.getCell(`A${row}`).value = categoryName;
      ratioAnalysisSheet.getCell(`A${row}`).font = { bold: true };
      ratioAnalysisSheet.mergeCells(`A${row}:C${row}`);
      row++;
      
      // Kategorideki oranlar
      for (const ratio of categoryRatios) {
        if (isRatioSelected(ratio.id)) {
          ratioAnalysisSheet.getCell(`A${row}`).value = ratio.name;
          ratioAnalysisSheet.getCell(`B${row}`).value = ratios[ratio.id]?.value || 0;
          ratioAnalysisSheet.getCell(`B${row}`).numFmt = '0.00';
          ratioAnalysisSheet.getCell(`C${row}`).value = ratios[ratio.id]?.interpretation || 'N/A';
          
          // Hücre kenarlıkları
          ['A', 'B', 'C'].forEach(col => {
            const cell = ratioAnalysisSheet.getCell(`${col}${row}`);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
          
          row++;
        }
      }
    };
    
    // Likidite Oranları
    let hasLiquidityRatios = ratioCategories.liquidity.some(ratio => isRatioSelected(ratio.id));
    if (hasLiquidityRatios) {
      addRatioCategory('LİKİDİTE ORANLARI', ratioCategories.liquidity);
    }
    
    // Finansal Yapı Oranları
    let hasStructureRatios = ratioCategories.financialStructure.some(ratio => isRatioSelected(ratio.id));
    if (hasStructureRatios) {
      addRatioCategory('FİNANSAL YAPI ORANLARI', ratioCategories.financialStructure);
    }
    
    // Karlılık Oranları
    let hasProfitabilityRatios = ratioCategories.profitability.some(ratio => isRatioSelected(ratio.id));
    if (hasProfitabilityRatios) {
      addRatioCategory('KARLILIK ORANLARI', ratioCategories.profitability);
    }
    
    // Kolon genişliklerini ayarla
    ratioAnalysisSheet.getColumn('A').width = 25;
    ratioAnalysisSheet.getColumn('B').width = 12;
    ratioAnalysisSheet.getColumn('C').width = 40;
    
    // Yasal uyarı ekle
    row += 2;
    ratioAnalysisSheet.getCell(`A${row}`).value = 'Bu rapordaki veriler finansal analiz amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.';
    ratioAnalysisSheet.getCell(`A${row}`).font = { 
      bold: true,
      italic: true,
      color: { argb: '666666' }
    };
    ratioAnalysisSheet.mergeCells(`A${row}:C${row}`);
    
    // Alt bilgi
    row += 2;
    ratioAnalysisSheet.getCell(`A${row}`).value = '© FinRasyo ' + new Date().getFullYear();
    ratioAnalysisSheet.getCell(`A${row}`).font = { 
      size: 8,
      color: { argb: '999999' }
    };
    
    // Excel dosyasını buffer olarak oluştur
    console.log("Excel raporu oluşturuldu, blob'a dönüştürülüyor");
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Buffer'ı Blob'a dönüştür
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  } catch (error) {
    console.error("Excel raporu oluşturma hatası:", error);
    throw new Error(`Excel raporu oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Excel raporunu indirir
 */
export function downloadExcelReport(blob: Blob, filename: string): void {
  try {
    console.log(`Excel raporu indiriliyor: ${filename}`, {
      blobSize: blob.size,
      blobType: blob.type
    });
    
    saveAs(blob, filename);
    console.log("Excel rapor indirme işlemi başarılı");
  } catch (error) {
    console.error("Excel rapor indirme hatası:", error);
    throw new Error(`Excel raporu indirilemedi: ${error instanceof Error ? error.message : String(error)}`);
  }
}