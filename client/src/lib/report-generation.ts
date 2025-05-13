/**
 * FinRasyo Rapor Oluşturma İşlevleri
 * 
 * Bu modül, finansal verileri işleyerek farklı formatlarda (PDF, Excel, Word, CSV) raporlar oluşturur.
 */

import { generateRatioAnalysis, compareFinancialPeriods, formatFinancialValue } from './financial-calculations';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { ratioCategories } from './financial-ratios';

// PDF dosyasına Türkçe karakter desteği ekleyen fonksiyon
function addTurkishSupport(doc: jsPDF) {
  doc.setLanguage("tr");
}

/**
 * Finansal verileri kullanarak PDF raporu oluşturur
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
  // PDF oluştur
  const doc = new jsPDF();
  addTurkishSupport(doc);
  
  const {
    includeRatios = true,
    includeTrend = true,
    includeSectorComparison = false,
    previousPeriodData = null,
    title = "Finansal Analiz Raporu"
  } = options;
  
  // Logo ekle
  const logoPath = '/assets/images/finrasyo-logo.jpg';
  doc.addImage(logoPath, 'JPEG', 65, 5, 80, 20);
  
  // Başlık ekle
  doc.setFontSize(20);
  doc.text(title, 105, 35, { align: 'center' });
  
  // Şirket bilgileri
  doc.setFontSize(12);
  doc.text(`Şirket: ${company.name} (${company.code})`, 14, 50);
  doc.text(`Sektör: ${company.sector}`, 14, 58);
  doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 66);
  
  let yPosition = 60;
  
  // Finansal özet tablosu
  if (financialData) {
    doc.setFontSize(14);
    doc.text("Finansal Özet", 14, yPosition);
    yPosition += 10;
    
    const summaryData = [
      ['Metrik', 'Değer'],
      ['Toplam Varlıklar', formatFinancialValue(financialData.totalAssets || 0)],
      ['Toplam Yükümlülükler', formatFinancialValue((financialData.shortTermLiabilities || 0) + (financialData.longTermLiabilities || 0))],
      ['Özkaynaklar', formatFinancialValue(financialData.equity || 0)],
      ['Net Satışlar', formatFinancialValue(financialData.netSales || 0)],
      ['Faaliyet Kârı', formatFinancialValue(financialData.operatingProfit || 0)],
      ['Net Kâr', formatFinancialValue(financialData.netProfit || 0)]
    ];
    
    (doc as any).autoTable({
      head: [summaryData[0]],
      body: summaryData.slice(1),
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Finansal oranlar
  if (includeRatios && financialData) {
    doc.setFontSize(14);
    doc.text("Finansal Oranlar", 14, yPosition);
    yPosition += 10;
    
    const ratios = generateRatioAnalysis(financialData);
    
    // Likidite oranları
    const liquidityRatios = [
      ['Likidite Oranları', 'Değer', 'Değerlendirme'],
      ...ratioCategories.liquidity.map(ratio => [
        ratio, 
        ratios[ratio]?.value.toFixed(2) || 'N/A', 
        ratios[ratio]?.interpretation || 'N/A'
      ])
    ];
    
    (doc as any).autoTable({
      head: [liquidityRatios[0]],
      body: liquidityRatios.slice(1),
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    
    // Finansal yapı oranları
    const structureRatios = [
      ['Finansal Yapı Oranları', 'Değer', 'Değerlendirme'],
      ...ratioCategories.financialStructure.map(ratio => [
        ratio, 
        ratios[ratio]?.value.toFixed(2) || 'N/A', 
        ratios[ratio]?.interpretation || 'N/A'
      ])
    ];
    
    (doc as any).autoTable({
      head: [structureRatios[0]],
      body: structureRatios.slice(1),
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    
    // Karlılık oranları
    const profitabilityRatios = [
      ['Karlılık Oranları', 'Değer', 'Değerlendirme'],
      ...ratioCategories.profitability.map(ratio => [
        ratio, 
        ratios[ratio]?.value.toFixed(2) || 'N/A', 
        ratios[ratio]?.interpretation || 'N/A'
      ])
    ];
    
    (doc as any).autoTable({
      head: [profitabilityRatios[0]],
      body: profitabilityRatios.slice(1),
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Trend analizi
  if (includeTrend && financialData && previousPeriodData) {
    doc.setFontSize(14);
    doc.text("Trend Analizi", 14, yPosition);
    yPosition += 10;
    
    const comparisonData = compareFinancialPeriods(financialData, previousPeriodData);
    
    const trendData = [
      ['Metrik', 'Önceki Dönem', 'Cari Dönem', 'Değişim', 'Değişim %'],
      ['Toplam Varlıklar', 
        formatFinancialValue(comparisonData.totalAssets?.previous || 0),
        formatFinancialValue(comparisonData.totalAssets?.current || 0),
        formatFinancialValue(comparisonData.totalAssets?.change || 0),
        comparisonData.totalAssets?.changePercent || 'N/A'
      ],
      ['Net Satışlar',
        formatFinancialValue(comparisonData.netSales?.previous || 0),
        formatFinancialValue(comparisonData.netSales?.current || 0),
        formatFinancialValue(comparisonData.netSales?.change || 0),
        comparisonData.netSales?.changePercent || 'N/A'
      ],
      ['Faaliyet Kârı',
        formatFinancialValue(comparisonData.operatingProfit?.previous || 0),
        formatFinancialValue(comparisonData.operatingProfit?.current || 0),
        formatFinancialValue(comparisonData.operatingProfit?.change || 0),
        comparisonData.operatingProfit?.changePercent || 'N/A'
      ],
      ['Net Kâr',
        formatFinancialValue(comparisonData.netProfit?.previous || 0),
        formatFinancialValue(comparisonData.netProfit?.current || 0),
        formatFinancialValue(comparisonData.netProfit?.change || 0),
        comparisonData.netProfit?.changePercent || 'N/A'
      ]
    ];
    
    (doc as any).autoTable({
      head: [trendData[0]],
      body: trendData.slice(1),
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Sektör karşılaştırması
  if (includeSectorComparison && financialData) {
    doc.setFontSize(14);
    doc.text("Sektör Karşılaştırması", 14, yPosition);
    yPosition += 10;
    
    // Not: Gerçek bir uygulamada burada sektör verileri eklenecektir
    const sectorComparisonData = [
      ['Oran', 'Şirket', 'Sektör Ortalaması', 'Fark'],
      ['Cari Oran', '1.50', '1.65', '-0.15'],
      ['Net Kar Marjı', '12.4%', '8.7%', '+3.7%'],
      ['Finansal Kaldıraç', '0.45', '0.52', '-0.07']
    ];
    
    (doc as any).autoTable({
      head: [sectorComparisonData[0]],
      body: sectorComparisonData.slice(1),
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Sayfa altbilgisi
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`FinRasyo Finansal Veri Sunum Platformu | Sayfa ${i}/${pageCount}`, 105, 287, { align: 'center' });
  }
  
  // PDF'i Blob olarak döndür
  return doc.output('blob');
}

/**
 * Finansal verileri kullanarak Excel raporu oluşturur
 */
export async function generateExcelReport(
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
  const {
    includeRatios = true,
    includeTrend = true,
    includeSectorComparison = false,
    previousPeriodData = null,
    title = "Finansal Analiz Raporu"
  } = options;
  
  // Excel çalışma kitabı oluştur
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FinRasyo';
  workbook.lastModifiedBy = 'FinRasyo';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Ana bilgiler sayfası
  const infoSheet = workbook.addWorksheet('Şirket Bilgileri');
  
  // Logo için boşluk bırak
  infoSheet.addRow(["FinRasyo"]);
  infoSheet.addRow(["Finansal Veri Sunum Platformu"]);
  infoSheet.addRow([]);
  
  // Logo metnini biçimlendir
  infoSheet.getCell('A1').font = { size: 24, bold: true, color: { argb: '0091E5FF' } };
  infoSheet.getCell('A2').font = { size: 16, color: { argb: '00000000' } };
  
  infoSheet.addRow([title]);
  infoSheet.addRow([]);
  infoSheet.addRow(['Şirket:', `${company.name} (${company.code})`]);
  infoSheet.addRow(['Sektör:', company.sector]);
  infoSheet.addRow(['Rapor Tarihi:', new Date().toLocaleDateString('tr-TR')]);
  
  // Başlık biçimlendirmesi
  infoSheet.getCell('A4').font = { size: 16, bold: true };
  infoSheet.getColumn('A').width = 20;
  infoSheet.getColumn('B').width = 40;
  
  // Finansal Veriler sayfası
  const financialSheet = workbook.addWorksheet('Finansal Veriler');
  financialSheet.addRow(['Metrik', 'Değer']);
  
  if (financialData) {
    financialSheet.addRow(['Toplam Varlıklar', financialData.totalAssets || 0]);
    financialSheet.addRow(['Dönen Varlıklar', financialData.currentAssets || 0]);
    financialSheet.addRow(['Duran Varlıklar', financialData.fixedAssets || 0]);
    financialSheet.addRow(['Kısa Vadeli Yükümlülükler', financialData.shortTermLiabilities || 0]);
    financialSheet.addRow(['Uzun Vadeli Yükümlülükler', financialData.longTermLiabilities || 0]);
    financialSheet.addRow(['Özkaynaklar', financialData.equity || 0]);
    financialSheet.addRow(['Net Satışlar', financialData.netSales || 0]);
    financialSheet.addRow(['Brüt Kâr', financialData.grossProfit || 0]);
    financialSheet.addRow(['Faaliyet Kârı', financialData.operatingProfit || 0]);
    financialSheet.addRow(['Net Kâr', financialData.netProfit || 0]);
  }
  
  // Başlığı biçimlendir ve sayıları Türk Lirası olarak formatla
  financialSheet.getRow(1).font = { bold: true };
  financialSheet.getColumn('A').width = 30;
  financialSheet.getColumn('B').width = 20;
  financialSheet.getColumn('B').numFmt = '#,##0.00 ₺';
  
  // Oranlar sayfası
  if (includeRatios && financialData) {
    const ratiosSheet = workbook.addWorksheet('Finansal Oranlar');
    const ratios = generateRatioAnalysis(financialData);
    
    // Likidite oranları
    ratiosSheet.addRow(['Likidite Oranları', 'Değer', 'Değerlendirme']);
    ratioCategories.liquidity.forEach(ratio => {
      ratiosSheet.addRow([
        ratio, 
        ratios[ratio]?.value || 'N/A', 
        ratios[ratio]?.interpretation || 'N/A'
      ]);
    });
    
    ratiosSheet.addRow([]);
    
    // Finansal yapı oranları
    ratiosSheet.addRow(['Finansal Yapı Oranları', 'Değer', 'Değerlendirme']);
    ratioCategories.financialStructure.forEach(ratio => {
      ratiosSheet.addRow([
        ratio, 
        ratios[ratio]?.value || 'N/A', 
        ratios[ratio]?.interpretation || 'N/A'
      ]);
    });
    
    ratiosSheet.addRow([]);
    
    // Karlılık oranları
    ratiosSheet.addRow(['Karlılık Oranları', 'Değer', 'Değerlendirme']);
    ratioCategories.profitability.forEach(ratio => {
      ratiosSheet.addRow([
        ratio, 
        ratios[ratio]?.value || 'N/A', 
        ratios[ratio]?.interpretation || 'N/A'
      ]);
    });
    
    // Formatlamalar
    ratiosSheet.getRow(1).font = { bold: true };
    ratiosSheet.getRow(ratioCategories.liquidity.length + 3).font = { bold: true };
    ratiosSheet.getRow(ratioCategories.liquidity.length + ratioCategories.financialStructure.length + 5).font = { bold: true };
    ratiosSheet.getColumn('A').width = 40;
    ratiosSheet.getColumn('B').width = 15;
    ratiosSheet.getColumn('C').width = 30;
    ratiosSheet.getColumn('B').numFmt = '0.00';
  }
  
  // Trend analizi sayfası
  if (includeTrend && financialData && previousPeriodData) {
    const trendSheet = workbook.addWorksheet('Trend Analizi');
    const comparisonData = compareFinancialPeriods(financialData, previousPeriodData);
    
    trendSheet.addRow(['Metrik', 'Önceki Dönem', 'Cari Dönem', 'Değişim', 'Değişim %']);
    
    const metricsToShow = [
      { key: 'totalAssets', label: 'Toplam Varlıklar' },
      { key: 'currentAssets', label: 'Dönen Varlıklar' },
      { key: 'shortTermLiabilities', label: 'Kısa Vadeli Yükümlülükler' },
      { key: 'longTermLiabilities', label: 'Uzun Vadeli Yükümlülükler' },
      { key: 'equity', label: 'Özkaynaklar' },
      { key: 'netSales', label: 'Net Satışlar' },
      { key: 'grossProfit', label: 'Brüt Kâr' },
      { key: 'operatingProfit', label: 'Faaliyet Kârı' },
      { key: 'netProfit', label: 'Net Kâr' }
    ];
    
    metricsToShow.forEach(metric => {
      if (comparisonData[metric.key]) {
        trendSheet.addRow([
          metric.label,
          comparisonData[metric.key].previous,
          comparisonData[metric.key].current,
          comparisonData[metric.key].change,
          comparisonData[metric.key].changePercent
        ]);
      }
    });
    
    // Oranlar için trend ekle
    trendSheet.addRow([]);
    trendSheet.addRow(['Oran Değişimleri', 'Önceki Dönem', 'Cari Dönem', 'Değişim', 'Değişim %']);
    
    const ratioKeys = [
      ...ratioCategories.liquidity,
      ...ratioCategories.financialStructure,
      ...ratioCategories.profitability
    ];
    
    ratioKeys.forEach(ratio => {
      const ratioKey = `ratio_${ratio}`;
      if (comparisonData[ratioKey]) {
        trendSheet.addRow([
          ratio,
          comparisonData[ratioKey].previous,
          comparisonData[ratioKey].current,
          comparisonData[ratioKey].change,
          comparisonData[ratioKey].changePercent
        ]);
      }
    });
    
    // Formatlamalar
    trendSheet.getRow(1).font = { bold: true };
    trendSheet.getRow(metricsToShow.length + 3).font = { bold: true };
    trendSheet.getColumn('A').width = 40;
    trendSheet.getColumn('B').width = 15;
    trendSheet.getColumn('C').width = 15;
    trendSheet.getColumn('D').width = 15;
    trendSheet.getColumn('E').width = 15;
    trendSheet.getColumn('B').numFmt = '#,##0.00 ₺';
    trendSheet.getColumn('C').numFmt = '#,##0.00 ₺';
    trendSheet.getColumn('D').numFmt = '#,##0.00 ₺';
  }
  
  // İş kitabını Blob olarak döndür
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * CSV formatında bir rapor oluşturur
 */
export function generateCSVReport(
  company: { name: string; code: string | null; sector: string | null },
  financialData: any
): Blob {
  let csvContent = `FinRasyo\nFinansal Veri Sunum Platformu\n\nŞirket Adı,${company.name}\nŞirket Kodu,${company.code}\nSektör,${company.sector}\nRapor Tarihi,${new Date().toLocaleDateString('tr-TR')}\n\n`;
  
  // Finansal veriler
  csvContent += "Finansal Veriler\n";
  csvContent += "Metrik,Değer\n";
  
  if (financialData) {
    csvContent += `Toplam Varlıklar,${financialData.totalAssets || 0}\n`;
    csvContent += `Dönen Varlıklar,${financialData.currentAssets || 0}\n`;
    csvContent += `Duran Varlıklar,${financialData.fixedAssets || 0}\n`;
    csvContent += `Kısa Vadeli Yükümlülükler,${financialData.shortTermLiabilities || 0}\n`;
    csvContent += `Uzun Vadeli Yükümlülükler,${financialData.longTermLiabilities || 0}\n`;
    csvContent += `Özkaynaklar,${financialData.equity || 0}\n`;
    csvContent += `Net Satışlar,${financialData.netSales || 0}\n`;
    csvContent += `Brüt Kâr,${financialData.grossProfit || 0}\n`;
    csvContent += `Faaliyet Kârı,${financialData.operatingProfit || 0}\n`;
    csvContent += `Net Kâr,${financialData.netProfit || 0}\n\n`;
  }
  
  // Oranlar
  if (financialData) {
    const ratios = generateRatioAnalysis(financialData);
    
    csvContent += "Finansal Oranlar\n";
    csvContent += "Oran,Değer,Değerlendirme\n";
    
    Object.keys(ratios).forEach(ratio => {
      csvContent += `${ratio},${ratios[ratio].value},${ratios[ratio].interpretation}\n`;
    });
  }
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
}

// Bu fonksiyon yerine generateReport ve downloadReport kullanılacak
export function downloadReport(blob: Blob, filename: string): void {
  try {
    saveAs(blob, filename);
  } catch (error) {
    console.error("Dosya indirme hatası:", error);
    throw new Error("Dosya indirme başarısız oldu: " + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Belirtilen formatta rapor oluşturur ve geri döndürür
 * 
 * @returns {{blob: Blob, filename: string}} - Oluşturulan raporun blobu ve dosya adı
 */
export async function generateReport(
  financialData: any,
  company: { name: string; code: string | null; sector: string | null },
  format: string = 'pdf',
  options?: {
    includeRatios?: boolean;
    includeTrend?: boolean;
    includeSectorComparison?: boolean;
    previousPeriodData?: any;
    title?: string;
  }
): Promise<{blob: Blob, filename: string}> {
  let blob: Blob;
  let filename: string;
  
  const today = new Date().toISOString().split('T')[0];
  const cleanCompanyCode = company.code?.replace(/\s+/g, '_') || 'Rapor';
  
  switch (format) {
    case 'pdf':
      blob = await generatePDFReport(company, financialData, options);
      filename = `${cleanCompanyCode}_${today}_Rapor.pdf`;
      break;
      
    case 'excel':
    case 'xlsx':
      blob = await generateExcelReport(company, financialData, options);
      filename = `${cleanCompanyCode}_${today}_Rapor.xlsx`;
      break;
      
    case 'word':
    case 'docx':
      // Burada Word raporu oluşturma fonksiyonu eklenecek
      // Şimdilik PDF olarak döndürelim
      blob = await generatePDFReport(company, financialData, options);
      filename = `${cleanCompanyCode}_${today}_Rapor.docx`;
      break;
      
    case 'csv':
      blob = generateCSVReport(company, financialData);
      filename = `${cleanCompanyCode}_${today}_Rapor.csv`;
      break;
      
    default:
      blob = await generatePDFReport(company, financialData, options);
      filename = `${cleanCompanyCode}_${today}_Rapor.pdf`;
  }
  
  return { blob, filename };
}

// Eski kod tarafından kullanılan fonksiyonlar için uyumluluk
// Bu fonksiyon var olan çağırıları bozmadan yeni sistem ile çalışabilmesini sağlar
export async function legacyExportReport(
  format: 'pdf' | 'excel' | 'csv',
  company: any,
  financialData: any,
  options?: any
): Promise<void> {
  const result = await generateReport(financialData, company, format, options);
  downloadReport(result.blob, result.filename);
}