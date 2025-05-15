/**
 * PDF Rapor İndirme Modülü
 * 
 * Bu modül PDF rapor oluşturma ve indirme işlemleri için özel fonksiyonlar sağlar
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { ratioCategories } from '../../lib/financial-ratios';
import { formatFinancialValue, generateRatioAnalysis, compareFinancialPeriods } from '../../lib/financial-calculations';

// Türkçe dil desteği
function addTurkishSupport(doc: jsPDF) {
  try {
    if (typeof doc.setLanguage === 'function') {
      doc.setLanguage("tr");
    }
  } catch (e) {
    console.warn("PDF Türkçe dil desteği eklenirken hata:", e);
  }
}

// AutoTable fonksiyonu için güvenli çağrı yöntemi
function createTable(doc: jsPDF, options: any) {
  try {
    if (typeof (doc as any).autoTable === 'function') {
      (doc as any).autoTable(options);
      return (doc as any).lastAutoTable.finalY + 15;
    } else {
      console.error("autoTable fonksiyonu bulunamadı");
      return options.startY + 50; // Tahmini bir değer
    }
  } catch (error) {
    console.error("PDF tablo oluşturma hatası:", error);
    return options.startY + 50; // Hata durumunda
  }
}

/**
 * PDF raporu oluşturur
 */
export async function generatePDFReport(
  company: { name: string; code: string | null; sector: string | null },
  financialData: any,
  options: {
    includeRatios?: boolean;
    includeTrend?: boolean;
    includeSectorComparison?: boolean;
    previousPeriodData?: any;
    title?: string;
  } = {}
): Promise<Blob> {
  console.log("PDF raporu oluşturuluyor:", { company, financialData });
  
  const { 
    includeRatios = true, 
    includeTrend = false, 
    includeSectorComparison = false,
    previousPeriodData = null,
    title = `${company.name || "Şirket"} Finansal Analiz Raporu`
  } = options;

  try {
    // PDF dokümanı oluştur
    const doc = new jsPDF();
    
    // Türkçe dil desteği ekle
    addTurkishSupport(doc);
    
    // PDF başlık bilgileri
    doc.setFontSize(20);
    doc.text(title, 105, 20, { align: 'center' });
    
    // Şirket bilgileri
    doc.setFontSize(12);
    doc.text(`Şirket: ${company.name}`, 20, 40);
    doc.text(`Kod: ${company.code || 'N/A'}`, 20, 50);
    doc.text(`Sektör: ${company.sector || 'N/A'}`, 20, 60);
    
    // Tarih
    const today = new Date();
    doc.text(`Oluşturulma Tarihi: ${today.toLocaleDateString('tr-TR')}`, 20, 70);
    
    let yPosition = 90;
    
    // Finansal veriler
    if (financialData) {
      doc.setFontSize(16);
      doc.text("Finansal Veriler Özeti", 105, yPosition, { align: 'center' });
      yPosition += 10;
      
      const summaryData = [
        ['Gösterge', 'Değer'],
        ['Dönem', financialData.period || 'N/A'],
        ['Dönem Sonu Tarihi', financialData.year ? `${financialData.year}` : 'N/A'],
        ['Toplam Varlıklar', formatFinancialValue(financialData.totalAssets || 0)],
        ['Toplam Borçlar', formatFinancialValue(financialData.totalLiabilities || 0)],
        ['Öz Sermaye', formatFinancialValue(financialData.equity || 0)],
        ['Satış Gelirleri', formatFinancialValue(financialData.revenue || 0)],
        ['Faaliyet Kârı', formatFinancialValue(financialData.operatingProfit || 0)],
        ['Net Kâr', formatFinancialValue(financialData.netProfit || 0)]
      ];
      
      // Tablo oluştur
      yPosition = createTable(doc, {
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    // Finansal oranlar
    if (includeRatios && financialData) {
      doc.setFontSize(16);
      doc.text("Finansal Oran Analizi", 105, yPosition, { align: 'center' });
      yPosition += 10;
      
      // Oran analizini hesapla
      const ratios = generateRatioAnalysis(financialData);
      
      // Likidite oranları
      doc.setFontSize(14);
      doc.text("Likidite Oranları", 20, yPosition);
      yPosition += 10;
      
      const liquidityRatios = [
        ['Oran', 'Değer', 'Değerlendirme'],
        ...ratioCategories.liquidity.map(ratio => [
          ratio.name,
          formatFinancialValue(ratios[ratio.id]?.value || 0),
          ratios[ratio.id]?.interpretation || 'N/A'
        ])
      ];
      
      // Tablo oluştur
      yPosition = createTable(doc, {
        head: [liquidityRatios[0]],
        body: liquidityRatios.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Finansal yapı oranları
      doc.setFontSize(14);
      doc.text("Finansal Yapı Oranları", 20, yPosition);
      yPosition += 10;
      
      const structureRatios = [
        ['Oran', 'Değer', 'Değerlendirme'],
        ...ratioCategories.financialStructure.map(ratio => [
          ratio.name,
          formatFinancialValue(ratios[ratio.id]?.value || 0),
          ratios[ratio.id]?.interpretation || 'N/A'
        ])
      ];
      
      // Tablo oluştur
      yPosition = createTable(doc, {
        head: [structureRatios[0]],
        body: structureRatios.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Kârlılık oranları
      doc.setFontSize(14);
      doc.text("Kârlılık Oranları", 20, yPosition);
      yPosition += 10;
      
      const profitabilityRatios = [
        ['Oran', 'Değer', 'Değerlendirme'],
        ...ratioCategories.profitability.map(ratio => [
          ratio.name,
          formatFinancialValue(ratios[ratio.id]?.value || 0),
          ratios[ratio.id]?.interpretation || 'N/A'
        ])
      ];
      
      // Tablo oluştur
      yPosition = createTable(doc, {
        head: [profitabilityRatios[0]],
        body: profitabilityRatios.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    // PDF'i oluştur ve dönüştür
    console.log("PDF oluşturuldu");
    return doc.output('blob');
  } catch (error) {
    console.error("PDF raporu oluşturma hatası:", error);
    throw new Error(`PDF raporu oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Excel raporu oluşturur
 */
export async function generateExcelReport(
  company: { name: string; code: string | null; sector: string | null },
  financialData: any,
  options: {
    includeRatios?: boolean;
    includeTrend?: boolean;
    includeSectorComparison?: boolean;
    previousPeriodData?: any;
  } = {}
): Promise<Blob> {
  console.log("Excel raporu oluşturuluyor:", { company, financialData });
  
  const { 
    includeRatios = true, 
    includeTrend = false, 
    includeSectorComparison = false,
    previousPeriodData = null
  } = options;
  
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FinRasyo';
    workbook.created = new Date();
    
    // Özet sayfası
    const summarySheet = workbook.addWorksheet('Özet');
    
    // Başlık
    summarySheet.mergeCells('A1:D1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = `${company.name} Finansal Analiz Raporu`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };
    
    // Şirket bilgileri
    summarySheet.getCell('A3').value = 'Şirket:';
    summarySheet.getCell('B3').value = company.name;
    
    summarySheet.getCell('A4').value = 'Borsa Kodu:';
    summarySheet.getCell('B4').value = company.code || 'N/A';
    
    summarySheet.getCell('A5').value = 'Sektör:';
    summarySheet.getCell('B5').value = company.sector || 'N/A';
    
    summarySheet.getCell('A6').value = 'Rapor Tarihi:';
    summarySheet.getCell('B6').value = new Date().toLocaleDateString('tr-TR');
    
    // Finansal veri özeti
    if (financialData) {
      summarySheet.getCell('A8').value = 'Finansal Gösterge';
      summarySheet.getCell('B8').value = 'Değer';
      
      summarySheet.getCell('A9').value = 'Dönem';
      summarySheet.getCell('B9').value = financialData.period || 'N/A';
      
      summarySheet.getCell('A10').value = 'Dönem Sonu';
      summarySheet.getCell('B10').value = financialData.year ? `${financialData.year}` : 'N/A';
      
      summarySheet.getCell('A11').value = 'Toplam Varlıklar';
      summarySheet.getCell('B11').value = financialData.totalAssets || 0;
      
      summarySheet.getCell('A12').value = 'Toplam Borçlar';
      summarySheet.getCell('B12').value = financialData.totalLiabilities || 0;
      
      summarySheet.getCell('A13').value = 'Öz Sermaye';
      summarySheet.getCell('B13').value = financialData.equity || 0;
      
      summarySheet.getCell('A14').value = 'Satış Gelirleri';
      summarySheet.getCell('B14').value = financialData.revenue || 0;
      
      summarySheet.getCell('A15').value = 'Faaliyet Kârı';
      summarySheet.getCell('B15').value = financialData.operatingProfit || 0;
      
      summarySheet.getCell('A16').value = 'Net Kâr';
      summarySheet.getCell('B16').value = financialData.netProfit || 0;
    }
    
    // Oran analizi sayfası
    if (includeRatios && financialData) {
      const ratioSheet = workbook.addWorksheet('Oran Analizi');
      
      ratioSheet.getCell('A1').value = 'Oran Adı';
      ratioSheet.getCell('B1').value = 'Değer';
      ratioSheet.getCell('C1').value = 'Değerlendirme';
      
      const ratios = generateRatioAnalysis(financialData);
      let rowIndex = 2;
      
      // Likidite oranları
      ratioSheet.getCell(`A${rowIndex}`).value = 'LİKİDİTE ORANLARI';
      ratioSheet.getCell(`A${rowIndex}`).font = { bold: true };
      rowIndex++;
      
      ratioCategories.liquidity.forEach(ratio => {
        ratioSheet.getCell(`A${rowIndex}`).value = ratio.name;
        ratioSheet.getCell(`B${rowIndex}`).value = ratios[ratio.id]?.value || 0;
        ratioSheet.getCell(`C${rowIndex}`).value = ratios[ratio.id]?.interpretation || 'N/A';
        rowIndex++;
      });
      
      // Finansal yapı oranları
      rowIndex++;
      ratioSheet.getCell(`A${rowIndex}`).value = 'FİNANSAL YAPI ORANLARI';
      ratioSheet.getCell(`A${rowIndex}`).font = { bold: true };
      rowIndex++;
      
      ratioCategories.financialStructure.forEach(ratio => {
        ratioSheet.getCell(`A${rowIndex}`).value = ratio.name;
        ratioSheet.getCell(`B${rowIndex}`).value = ratios[ratio.id]?.value || 0;
        ratioSheet.getCell(`C${rowIndex}`).value = ratios[ratio.id]?.interpretation || 'N/A';
        rowIndex++;
      });
      
      // Karlılık oranları
      rowIndex++;
      ratioSheet.getCell(`A${rowIndex}`).value = 'KARLILIK ORANLARI';
      ratioSheet.getCell(`A${rowIndex}`).font = { bold: true };
      rowIndex++;
      
      ratioCategories.profitability.forEach(ratio => {
        ratioSheet.getCell(`A${rowIndex}`).value = ratio.name;
        ratioSheet.getCell(`B${rowIndex}`).value = ratios[ratio.id]?.value || 0;
        ratioSheet.getCell(`C${rowIndex}`).value = ratios[ratio.id]?.interpretation || 'N/A';
        rowIndex++;
      });
      
      // Format the values in column B as numbers
      for (let i = 3; i < rowIndex; i++) {
        const cell = ratioSheet.getCell(`B${i}`);
        if (typeof cell.value === 'number') {
          cell.numFmt = '0.00';
        }
      }
    }
    
    // Excel dosyasını oluştur
    console.log("Excel raporu oluşturuldu, blob'a dönüştürülüyor");
    return await workbook.xlsx.writeBuffer().then(buffer => {
      return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    });
  } catch (error) {
    console.error("Excel raporu oluşturma hatası:", error);
    throw new Error(`Excel raporu oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * CSV raporu oluşturur
 */
export function generateCSVReport(
  company: { name: string; code: string | null; sector: string | null },
  financialData: any,
  options: {
    includeRatios?: boolean;
  } = {}
): Blob {
  console.log("CSV raporu oluşturuluyor:", { company, financialData });
  
  const { includeRatios = true } = options;
  
  try {
    let csvContent = `"${company.name} Finansal Analiz Raporu"\n\n`;
    
    // Şirket bilgileri
    csvContent += `"Şirket","${company.name}"\n`;
    csvContent += `"Borsa Kodu","${company.code || 'N/A'}"\n`;
    csvContent += `"Sektör","${company.sector || 'N/A'}"\n`;
    csvContent += `"Rapor Tarihi","${new Date().toLocaleDateString('tr-TR')}"\n\n`;
    
    // Finansal veriler
    if (financialData) {
      csvContent += `"Finansal Gösterge","Değer"\n`;
      csvContent += `"Dönem","${financialData.period || 'N/A'}"\n`;
      csvContent += `"Dönem Sonu","${financialData.year || 'N/A'}"\n`;
      csvContent += `"Toplam Varlıklar","${financialData.totalAssets || 0}"\n`;
      csvContent += `"Toplam Borçlar","${financialData.totalLiabilities || 0}"\n`;
      csvContent += `"Öz Sermaye","${financialData.equity || 0}"\n`;
      csvContent += `"Satış Gelirleri","${financialData.revenue || 0}"\n`;
      csvContent += `"Faaliyet Kârı","${financialData.operatingProfit || 0}"\n`;
      csvContent += `"Net Kâr","${financialData.netProfit || 0}"\n\n`;
    }
    
    // Finansal oranlar
    if (includeRatios && financialData) {
      const ratios = generateRatioAnalysis(financialData);
      
      csvContent += `"ORAN ANALİZİ"\n`;
      csvContent += `"Oran Adı","Değer","Değerlendirme"\n`;
      
      // Likidite oranları
      csvContent += `"LİKİDİTE ORANLARI"\n`;
      ratioCategories.liquidity.forEach(ratio => {
        csvContent += `"${ratio.name}","${ratios[ratio.id]?.value || 0}","${ratios[ratio.id]?.interpretation || 'N/A'}"\n`;
      });
      
      // Finansal yapı oranları
      csvContent += `"FİNANSAL YAPI ORANLARI"\n`;
      ratioCategories.financialStructure.forEach(ratio => {
        csvContent += `"${ratio.name}","${ratios[ratio.id]?.value || 0}","${ratios[ratio.id]?.interpretation || 'N/A'}"\n`;
      });
      
      // Karlılık oranları
      csvContent += `"KARLILIK ORANLARI"\n`;
      ratioCategories.profitability.forEach(ratio => {
        csvContent += `"${ratio.name}","${ratios[ratio.id]?.value || 0}","${ratios[ratio.id]?.interpretation || 'N/A'}"\n`;
      });
    }
    
    // CSV dosyasını oluştur
    console.log("CSV raporu oluşturuldu");
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  } catch (error) {
    console.error("CSV raporu oluşturma hatası:", error);
    throw new Error(`CSV raporu oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Belirtilen formatta rapor oluşturur
 */
export async function generateReport(
  financialData: any,
  company: { name: string; code: string | null; sector: string | null; id: number },
  format: string = 'pdf',
  options: {
    includeRatios?: boolean;
    includeTrend?: boolean;
    includeSectorComparison?: boolean;
    previousPeriodData?: any;
  } = {}
): Promise<{blob: Blob, filename: string}> {
  console.log(`${format.toUpperCase()} raporu oluşturuluyor:`, { 
    company, 
    format, 
    financialDataKeys: Object.keys(financialData || {}) 
  });
  
  try {
    let blob: Blob;
    const dateStr = new Date().toISOString().split('T')[0];
    const sanitizedCompanyName = company.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    switch (format.toLowerCase()) {
      case 'pdf':
        blob = await generatePDFReport(company, financialData, options);
        return {
          blob,
          filename: `${sanitizedCompanyName}_rapor_${dateStr}.pdf`
        };
        
      case 'excel':
      case 'xlsx':
        blob = await generateExcelReport(company, financialData, options);
        return {
          blob,
          filename: `${sanitizedCompanyName}_rapor_${dateStr}.xlsx`
        };
        
      case 'csv':
        blob = generateCSVReport(company, financialData, options);
        return {
          blob,
          filename: `${sanitizedCompanyName}_rapor_${dateStr}.csv`
        };
        
      case 'word':
      case 'docx':
        // Bu durumda backend API'sinden gelen HTML içeriğini kullanıyoruz
        // URL'den al ve blob haline getir
        const response = await fetch(`/api/reports/generate?companyId=${company.id}&type=word&format=word&financialDataId=${financialData.id || 0}`);
        if (!response.ok) {
          throw new Error(`Word raporu oluşturulamadı: ${response.statusText}`);
        }
        const htmlContent = await response.text();
        blob = new Blob([htmlContent], { type: 'application/msword' });
        return {
          blob,
          filename: `${sanitizedCompanyName}_rapor_${dateStr}.docx`
        };
        
      default:
        throw new Error(`Desteklenmeyen rapor formatı: ${format}`);
    }
  } catch (error) {
    console.error("Rapor oluşturma hatası:", error);
    throw new Error(`Rapor oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Raporu indirir
 */
export function downloadReport(blob: Blob, filename: string): void {
  try {
    console.log(`Rapor indiriliyor: ${filename}`, {
      blobSize: blob.size,
      blobType: blob.type
    });
    
    saveAs(blob, filename);
    console.log("Rapor indirme işlemi başarılı");
  } catch (error) {
    console.error("Rapor indirme hatası:", error);
    throw new Error(`Rapor indirilemedi: ${error instanceof Error ? error.message : String(error)}`);
  }
}