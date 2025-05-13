/**
 * Excel Rapor Oluşturma İşlevleri
 * 
 * Bu modül, finansal verileri işleyerek Excel formatında raporlar oluşturur.
 */

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ratioCategories } from './financial-ratios';
import { formatFinancialValue, generateRatioAnalysis } from './financial-calculations';

/**
 * Excel raporu oluşturur
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
    
    // Ana sayfa
    const mainSheet = workbook.addWorksheet(`${company.name} Finansal Analiz Raporu`);
    
    // Başlık stilini ayarla
    mainSheet.mergeCells('A1:F1');
    const titleCell = mainSheet.getCell('A1');
    titleCell.value = `${company.name} Finansal Analiz Raporu`;
    titleCell.font = { 
      size: 16, 
      bold: true,
      color: { argb: '0366d6' }
    };
    titleCell.alignment = { horizontal: 'center' };
    
    // Şirket bilgileri
    mainSheet.getCell('A3').value = 'Şirket:';
    mainSheet.getCell('B3').value = company.name;
    mainSheet.getCell('B3').font = { bold: true };
    
    mainSheet.getCell('A4').value = 'Borsa Kodu:';
    mainSheet.getCell('B4').value = company.code || 'N/A';
    
    mainSheet.getCell('A5').value = 'Sektör:';
    mainSheet.getCell('B5').value = company.sector || 'N/A';
    
    mainSheet.getCell('A6').value = 'Rapor Tarihi:';
    mainSheet.getCell('B6').value = new Date().toLocaleDateString('tr-TR');
    
    // Kolon genişliklerini ayarla
    mainSheet.getColumn('A').width = 20;
    mainSheet.getColumn('B').width = 15;
    mainSheet.getColumn('C').width = 30;
    
    // Finansal oranları hesapla
    const ratios = generateRatioAnalysis(financialData);
    
    // Her bir oran kategorisi için başlık ve veri ekle
    let currentRow = 8;
    
    // Fonksiyon: Seçilen oranları kontrol et
    const isRatioSelected = (ratioId: string): boolean => {
      // Eğer selectedRatios dizisi boşsa veya undefined ise, tüm oranları göster
      if (!selectedRatios || selectedRatios.length === 0) return true;
      // Değilse, sadece seçilen oranları göster
      return selectedRatios.includes(ratioId);
    };
    
    // Oran Analizi başlığı
    mainSheet.getCell(`A${currentRow}`).value = 'ORAN ANALİZİ';
    mainSheet.getCell(`A${currentRow}`).font = { 
      size: 14, 
      bold: true,
      color: { argb: '0366d6' }
    };
    currentRow += 2;
    
    // Tablo başlıkları
    const headers = ['Oran Adı', 'Değer', 'Değerlendirme'];
    for (let i = 0; i < headers.length; i++) {
      const cell = mainSheet.getCell(currentRow, i + 1);
      cell.value = headers[i];
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
    currentRow++;
    
    // Likidite Oranları
    let hasLiquidityRatios = false;
    for (const ratio of ratioCategories.liquidity) {
      if (isRatioSelected(ratio.id)) {
        hasLiquidityRatios = true;
        break;
      }
    }
    
    if (hasLiquidityRatios) {
      mainSheet.getCell(`A${currentRow}`).value = 'LİKİDİTE ORANLARI';
      mainSheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      
      for (const ratio of ratioCategories.liquidity) {
        if (isRatioSelected(ratio.id)) {
          const ratioValue = ratios[ratio.id]?.value;
          mainSheet.getCell(`A${currentRow}`).value = ratio.name;
          mainSheet.getCell(`B${currentRow}`).value = ratioValue !== undefined ? Number(ratioValue) : 0;
          mainSheet.getCell(`B${currentRow}`).numFmt = '0.00';
          mainSheet.getCell(`C${currentRow}`).value = ratios[ratio.id]?.interpretation || 'N/A';
          currentRow++;
        }
      }
    }
    
    // Finansal Yapı Oranları
    let hasStructureRatios = false;
    for (const ratio of ratioCategories.financialStructure) {
      if (isRatioSelected(ratio.id)) {
        hasStructureRatios = true;
        break;
      }
    }
    
    if (hasStructureRatios) {
      currentRow++; // Boşluk ekle
      mainSheet.getCell(`A${currentRow}`).value = 'FİNANSAL YAPI ORANLARI';
      mainSheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      
      for (const ratio of ratioCategories.financialStructure) {
        if (isRatioSelected(ratio.id)) {
          const ratioValue = ratios[ratio.id]?.value;
          mainSheet.getCell(`A${currentRow}`).value = ratio.name;
          mainSheet.getCell(`B${currentRow}`).value = ratioValue !== undefined ? Number(ratioValue) : 0;
          mainSheet.getCell(`B${currentRow}`).numFmt = '0.00';
          mainSheet.getCell(`C${currentRow}`).value = ratios[ratio.id]?.interpretation || 'N/A';
          currentRow++;
        }
      }
    }
    
    // Karlılık Oranları
    let hasProfitabilityRatios = false;
    for (const ratio of ratioCategories.profitability) {
      if (isRatioSelected(ratio.id)) {
        hasProfitabilityRatios = true;
        break;
      }
    }
    
    if (hasProfitabilityRatios) {
      currentRow++; // Boşluk ekle
      mainSheet.getCell(`A${currentRow}`).value = 'KARLILIK ORANLARI';
      mainSheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      
      for (const ratio of ratioCategories.profitability) {
        if (isRatioSelected(ratio.id)) {
          const ratioValue = ratios[ratio.id]?.value;
          mainSheet.getCell(`A${currentRow}`).value = ratio.name;
          mainSheet.getCell(`B${currentRow}`).value = ratioValue !== undefined ? Number(ratioValue) : 0;
          mainSheet.getCell(`B${currentRow}`).numFmt = '0.00';
          mainSheet.getCell(`C${currentRow}`).value = ratios[ratio.id]?.interpretation || 'N/A';
          currentRow++;
        }
      }
    }
    
    // Yasal uyarı ekle
    currentRow += 2;
    mainSheet.getCell(`A${currentRow}`).value = 'Bu rapordaki veriler finansal analiz amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.';
    mainSheet.getCell(`A${currentRow}`).font = { 
      bold: true,
      italic: true,
      color: { argb: '666666' }
    };
    
    // Alt bilgi
    currentRow += 2;
    mainSheet.getCell(`A${currentRow}`).value = '© FinRasyo ' + new Date().getFullYear();
    mainSheet.getCell(`A${currentRow}`).font = { 
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