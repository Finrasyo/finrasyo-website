import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FinancialData, Company } from '@shared/schema';
import { formatCurrency, formatNumber, formatDate } from './utils';
import { generateRatioAnalysis } from './financial-calculations';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Add necessary types for jsPDF-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Generate PDF report
export async function generatePdfReport(financialData: FinancialData, company: Company): Promise<Blob> {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(15, 82, 186); // Primary blue
  doc.text('FinRasyo - Finansal Oran Analizi', 105, 20, { align: 'center' });
  
  // Add company information
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${company.name} - Finansal Analiz Raporu`, 105, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Rapor Tarihi: ${formatDate(new Date())}`, 105, 45, { align: 'center' });
  doc.text(`Analiz Dönemi: ${financialData.year}`, 105, 55, { align: 'center' });
  
  // Financial data table
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Finansal Veriler', 14, 70);
  
  doc.autoTable({
    startY: 75,
    head: [['Kalem', 'Değer (TL)']],
    body: [
      ['Nakit ve Nakit Benzerleri', formatNumber(financialData.cashAndEquivalents)],
      ['Ticari Alacaklar', formatNumber(financialData.accountsReceivable)],
      ['Stoklar', formatNumber(financialData.inventory)],
      ['Diğer Dönen Varlıklar', formatNumber(financialData.otherCurrentAssets)],
      ['Toplam Dönen Varlıklar', formatNumber(financialData.totalCurrentAssets)],
      ['Kısa Vadeli Finansal Borçlar', formatNumber(financialData.shortTermDebt)],
      ['Ticari Borçlar', formatNumber(financialData.accountsPayable)],
      ['Diğer Kısa Vadeli Yükümlülükler', formatNumber(financialData.otherCurrentLiabilities)],
      ['Toplam Kısa Vadeli Yükümlülükler', formatNumber(financialData.totalCurrentLiabilities)]
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 82, 186], textColor: [255, 255, 255] }
  });
  
  // Ratio analysis table
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Oran Analizi', 14, doc.autoTable.previous.finalY + 15);
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 20,
    head: [['Oran', 'Değer', 'Formül', 'Değerlendirme']],
    body: [
      [
        'Cari Oran', 
        financialData.currentRatio.toFixed(2), 
        'Dönen Varlıklar / Kısa Vadeli Yükümlülükler',
        financialData.currentRatio >= 2.0 ? 'İyi' : 
        financialData.currentRatio >= 1.5 ? 'Yeterli' : 
        financialData.currentRatio >= 1.0 ? 'Orta' : 'Zayıf'
      ],
      [
        'Likidite Oranı', 
        financialData.liquidityRatio.toFixed(2), 
        '(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler',
        financialData.liquidityRatio >= 1.5 ? 'İyi' : 
        financialData.liquidityRatio >= 1.0 ? 'Yeterli' : 
        financialData.liquidityRatio >= 0.8 ? 'Orta' : 'Zayıf'
      ],
      [
        'Asit-Test Oranı', 
        financialData.acidTestRatio.toFixed(2), 
        'Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler',
        financialData.acidTestRatio >= 0.8 ? 'İyi' : 
        financialData.acidTestRatio >= 0.5 ? 'Yeterli' : 
        financialData.acidTestRatio >= 0.3 ? 'Orta' : 'Zayıf'
      ]
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 82, 186], textColor: [255, 255, 255] }
  });
  
  // Analysis text
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Oran Yorumu ve Özet', 14, doc.autoTable.previous.finalY + 15);
  
  const analysis = generateRatioAnalysis(
    financialData.currentRatio,
    financialData.liquidityRatio,
    financialData.acidTestRatio,
    company.name
  );
  
  // Replace HTML tags with plain text
  const plainAnalysis = analysis.replace(/<[^>]*>/g, '');
  
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  const splitAnalysis = doc.splitTextToSize(plainAnalysis, 180);
  doc.text(splitAnalysis, 14, doc.autoTable.previous.finalY + 25);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `© ${new Date().getFullYear()} FinRasyo. Tüm hakları saklıdır. Sayfa ${i}/${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  return doc.output('blob');
}

// Generate Word document (DOCX)
export async function generateWordDocument(financialData: FinancialData, company: Company): Promise<Blob> {
  // In a real implementation, this would use a library like docx.js
  // For now, we'll generate a basic HTML that could be saved as DOCX
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${company.name} - Finansal Analiz Raporu</title>
      <style>
        body { font-family: Arial, sans-serif; }
        h1, h2 { color: #0F52BA; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #0F52BA; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>FinRasyo - Finansal Oran Analizi</h1>
      <h2>${company.name} - Finansal Analiz Raporu</h2>
      <p>Rapor Tarihi: ${formatDate(new Date())}</p>
      <p>Analiz Dönemi: ${financialData.year}</p>
      
      <h3>Finansal Veriler</h3>
      <table>
        <tr><th>Kalem</th><th>Değer (TL)</th></tr>
        <tr><td>Nakit ve Nakit Benzerleri</td><td>${formatNumber(financialData.cashAndEquivalents)}</td></tr>
        <tr><td>Ticari Alacaklar</td><td>${formatNumber(financialData.accountsReceivable)}</td></tr>
        <tr><td>Stoklar</td><td>${formatNumber(financialData.inventory)}</td></tr>
        <tr><td>Diğer Dönen Varlıklar</td><td>${formatNumber(financialData.otherCurrentAssets)}</td></tr>
        <tr><td>Toplam Dönen Varlıklar</td><td>${formatNumber(financialData.totalCurrentAssets)}</td></tr>
        <tr><td>Kısa Vadeli Finansal Borçlar</td><td>${formatNumber(financialData.shortTermDebt)}</td></tr>
        <tr><td>Ticari Borçlar</td><td>${formatNumber(financialData.accountsPayable)}</td></tr>
        <tr><td>Diğer Kısa Vadeli Yükümlülükler</td><td>${formatNumber(financialData.otherCurrentLiabilities)}</td></tr>
        <tr><td>Toplam Kısa Vadeli Yükümlülükler</td><td>${formatNumber(financialData.totalCurrentLiabilities)}</td></tr>
      </table>
      
      <h3>Oran Analizi</h3>
      <table>
        <tr><th>Oran</th><th>Değer</th><th>Formül</th><th>Değerlendirme</th></tr>
        <tr>
          <td>Cari Oran</td>
          <td>${financialData.currentRatio.toFixed(2)}</td>
          <td>Dönen Varlıklar / Kısa Vadeli Yükümlülükler</td>
          <td>${financialData.currentRatio >= 2.0 ? 'İyi' : 
               financialData.currentRatio >= 1.5 ? 'Yeterli' : 
               financialData.currentRatio >= 1.0 ? 'Orta' : 'Zayıf'}</td>
        </tr>
        <tr>
          <td>Likidite Oranı</td>
          <td>${financialData.liquidityRatio.toFixed(2)}</td>
          <td>(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler</td>
          <td>${financialData.liquidityRatio >= 1.5 ? 'İyi' : 
               financialData.liquidityRatio >= 1.0 ? 'Yeterli' : 
               financialData.liquidityRatio >= 0.8 ? 'Orta' : 'Zayıf'}</td>
        </tr>
        <tr>
          <td>Asit-Test Oranı</td>
          <td>${financialData.acidTestRatio.toFixed(2)}</td>
          <td>Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler</td>
          <td>${financialData.acidTestRatio >= 0.8 ? 'İyi' : 
               financialData.acidTestRatio >= 0.5 ? 'Yeterli' : 
               financialData.acidTestRatio >= 0.3 ? 'Orta' : 'Zayıf'}</td>
        </tr>
      </table>
      
      <h3>Oran Yorumu ve Özet</h3>
      <p>${generateRatioAnalysis(
        financialData.currentRatio,
        financialData.liquidityRatio,
        financialData.acidTestRatio,
        company.name
      )}</p>
      
      <footer>
        <p>© ${new Date().getFullYear()} FinRasyo. Tüm hakları saklıdır.</p>
      </footer>
    </body>
    </html>
  `;
  
  const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  return blob;
}

// Generate Excel spreadsheet (XLSX)
export async function generateExcelSpreadsheet(financialData: FinancialData, company: Company): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FinRasyo';
  workbook.lastModifiedBy = 'FinRasyo';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Finansal Veriler Sheet
  const financialSheet = workbook.addWorksheet('Finansal Veriler');
  
  // Add header with some styling
  financialSheet.mergeCells('A1:C1');
  const titleCell = financialSheet.getCell('A1');
  titleCell.value = `${company.name} - Finansal Analiz Raporu (${financialData.year})`;
  titleCell.font = { size: 14, bold: true, color: { argb: '0F52BA' } };
  titleCell.alignment = { horizontal: 'center' };
  
  // Add date
  financialSheet.mergeCells('A2:C2');
  const dateCell = financialSheet.getCell('A2');
  dateCell.value = `Rapor Tarihi: ${formatDate(new Date())}`;
  dateCell.font = { size: 12, color: { argb: '666666' } };
  dateCell.alignment = { horizontal: 'center' };
  
  // Add financial data
  financialSheet.addRow([]);
  financialSheet.addRow(['Finansal Veriler']);
  financialSheet.getCell('A4').font = { bold: true, size: 12 };
  
  financialSheet.addRow(['Kalem', 'Değer (TL)']);
  financialSheet.addRow(['Nakit ve Nakit Benzerleri', financialData.cashAndEquivalents]);
  financialSheet.addRow(['Ticari Alacaklar', financialData.accountsReceivable]);
  financialSheet.addRow(['Stoklar', financialData.inventory]);
  financialSheet.addRow(['Diğer Dönen Varlıklar', financialData.otherCurrentAssets]);
  financialSheet.addRow(['Toplam Dönen Varlıklar', financialData.totalCurrentAssets]);
  financialSheet.addRow(['Kısa Vadeli Finansal Borçlar', financialData.shortTermDebt]);
  financialSheet.addRow(['Ticari Borçlar', financialData.accountsPayable]);
  financialSheet.addRow(['Diğer Kısa Vadeli Yükümlülükler', financialData.otherCurrentLiabilities]);
  financialSheet.addRow(['Toplam Kısa Vadeli Yükümlülükler', financialData.totalCurrentLiabilities]);
  
  // Style the headers
  const headerRow = financialSheet.getRow(5);
  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0F52BA' },
      bgColor: { argb: '0F52BA' }
    };
    cell.font = { color: { argb: 'FFFFFF' }, bold: true };
  });
  
  // Format numbers with thousands separator
  for (let i = 6; i <= 14; i++) {
    const cell = financialSheet.getCell(`B${i}`);
    cell.numFmt = '#,##0';
  }
  
  // Add ratio analysis
  financialSheet.addRow([]);
  financialSheet.addRow(['Oran Analizi']);
  financialSheet.getCell('A16').font = { bold: true, size: 12 };
  
  financialSheet.addRow(['Oran', 'Değer', 'Formül', 'Değerlendirme']);
  financialSheet.addRow([
    'Cari Oran',
    financialData.currentRatio,
    'Dönen Varlıklar / Kısa Vadeli Yükümlülükler',
    financialData.currentRatio >= 2.0 ? 'İyi' : 
    financialData.currentRatio >= 1.5 ? 'Yeterli' : 
    financialData.currentRatio >= 1.0 ? 'Orta' : 'Zayıf'
  ]);
  
  financialSheet.addRow([
    'Likidite Oranı',
    financialData.liquidityRatio,
    '(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler',
    financialData.liquidityRatio >= 1.5 ? 'İyi' : 
    financialData.liquidityRatio >= 1.0 ? 'Yeterli' : 
    financialData.liquidityRatio >= 0.8 ? 'Orta' : 'Zayıf'
  ]);
  
  financialSheet.addRow([
    'Asit-Test Oranı',
    financialData.acidTestRatio,
    'Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler',
    financialData.acidTestRatio >= 0.8 ? 'İyi' : 
    financialData.acidTestRatio >= 0.5 ? 'Yeterli' : 
    financialData.acidTestRatio >= 0.3 ? 'Orta' : 'Zayıf'
  ]);
  
  // Style the ratio headers
  const ratioHeaderRow = financialSheet.getRow(17);
  ratioHeaderRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0F52BA' },
      bgColor: { argb: '0F52BA' }
    };
    cell.font = { color: { argb: 'FFFFFF' }, bold: true };
  });
  
  // Format ratio values
  for (let i = 18; i <= 20; i++) {
    const cell = financialSheet.getCell(`B${i}`);
    cell.numFmt = '0.00';
  }
  
  // Add analysis text
  financialSheet.addRow([]);
  financialSheet.addRow(['Oran Yorumu ve Özet']);
  financialSheet.getCell('A22').font = { bold: true, size: 12 };
  
  // Replace HTML tags with plain text for Excel
  const analysis = generateRatioAnalysis(
    financialData.currentRatio,
    financialData.liquidityRatio,
    financialData.acidTestRatio,
    company.name
  ).replace(/<[^>]*>/g, '');
  
  financialSheet.addRow([analysis]);
  financialSheet.mergeCells('A23:D23');
  
  // Add footer
  financialSheet.addRow([]);
  financialSheet.addRow([`© ${new Date().getFullYear()} FinRasyo. Tüm hakları saklıdır.`]);
  financialSheet.mergeCells('A25:D25');
  financialSheet.getCell('A25').font = { color: { argb: '999999' }, size: 10 };
  financialSheet.getCell('A25').alignment = { horizontal: 'center' };
  
  // Adjust column widths
  financialSheet.getColumn('A').width = 30;
  financialSheet.getColumn('B').width = 15;
  financialSheet.getColumn('C').width = 50;
  financialSheet.getColumn('D').width = 15;
  
  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Generate CSV file
export async function generateCsvFile(financialData: FinancialData, company: Company): Promise<Blob> {
  // Build CSV content
  let csvContent = `"FinRasyo - Finansal Oran Analizi"\n`;
  csvContent += `"${company.name} - Finansal Analiz Raporu"\n`;
  csvContent += `"Rapor Tarihi","${formatDate(new Date())}"\n`;
  csvContent += `"Analiz Dönemi","${financialData.year}"\n\n`;
  
  // Financial data
  csvContent += `"Finansal Veriler"\n`;
  csvContent += `"Kalem","Değer (TL)"\n`;
  csvContent += `"Nakit ve Nakit Benzerleri","${formatNumber(financialData.cashAndEquivalents)}"\n`;
  csvContent += `"Ticari Alacaklar","${formatNumber(financialData.accountsReceivable)}"\n`;
  csvContent += `"Stoklar","${formatNumber(financialData.inventory)}"\n`;
  csvContent += `"Diğer Dönen Varlıklar","${formatNumber(financialData.otherCurrentAssets)}"\n`;
  csvContent += `"Toplam Dönen Varlıklar","${formatNumber(financialData.totalCurrentAssets)}"\n`;
  csvContent += `"Kısa Vadeli Finansal Borçlar","${formatNumber(financialData.shortTermDebt)}"\n`;
  csvContent += `"Ticari Borçlar","${formatNumber(financialData.accountsPayable)}"\n`;
  csvContent += `"Diğer Kısa Vadeli Yükümlülükler","${formatNumber(financialData.otherCurrentLiabilities)}"\n`;
  csvContent += `"Toplam Kısa Vadeli Yükümlülükler","${formatNumber(financialData.totalCurrentLiabilities)}"\n\n`;
  
  // Ratio analysis
  csvContent += `"Oran Analizi"\n`;
  csvContent += `"Oran","Değer","Formül","Değerlendirme"\n`;
  csvContent += `"Cari Oran","${financialData.currentRatio.toFixed(2)}","Dönen Varlıklar / Kısa Vadeli Yükümlülükler","${
    financialData.currentRatio >= 2.0 ? 'İyi' : 
    financialData.currentRatio >= 1.5 ? 'Yeterli' : 
    financialData.currentRatio >= 1.0 ? 'Orta' : 'Zayıf'
  }"\n`;
  csvContent += `"Likidite Oranı","${financialData.liquidityRatio.toFixed(2)}","(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler","${
    financialData.liquidityRatio >= 1.5 ? 'İyi' : 
    financialData.liquidityRatio >= 1.0 ? 'Yeterli' : 
    financialData.liquidityRatio >= 0.8 ? 'Orta' : 'Zayıf'
  }"\n`;
  csvContent += `"Asit-Test Oranı","${financialData.acidTestRatio.toFixed(2)}","Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler","${
    financialData.acidTestRatio >= 0.8 ? 'İyi' : 
    financialData.acidTestRatio >= 0.5 ? 'Yeterli' : 
    financialData.acidTestRatio >= 0.3 ? 'Orta' : 'Zayıf'
  }"\n\n`;
  
  // Analysis text
  csvContent += `"Oran Yorumu ve Özet"\n`;
  // Replace HTML tags with plain text for CSV
  const plainAnalysis = generateRatioAnalysis(
    financialData.currentRatio,
    financialData.liquidityRatio,
    financialData.acidTestRatio,
    company.name
  ).replace(/<[^>]*>/g, '');
  csvContent += `"${plainAnalysis}"\n\n`;
  
  // Footer
  csvContent += `"© ${new Date().getFullYear()} FinRasyo. Tüm hakları saklıdır."\n`;
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
}

// Main function to generate report in selected format
export async function generateReport(
  financialData: FinancialData, 
  company: Company, 
  format: string
): Promise<{ blob: Blob, filename: string }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const baseFilename = `${company.name.replace(/\s+/g, '_')}_Finansal_Analiz_${dateStr}`;
  
  let blob: Blob;
  let filename: string;
  
  switch (format.toLowerCase()) {
    case 'pdf':
      blob = await generatePdfReport(financialData, company);
      filename = `${baseFilename}.pdf`;
      break;
    case 'docx':
    case 'word':
      blob = await generateWordDocument(financialData, company);
      filename = `${baseFilename}.docx`;
      break;
    case 'xlsx':
    case 'excel':
      blob = await generateExcelSpreadsheet(financialData, company);
      filename = `${baseFilename}.xlsx`;
      break;
    case 'csv':
      blob = await generateCsvFile(financialData, company);
      filename = `${baseFilename}.csv`;
      break;
    default:
      throw new Error(`Desteklenmeyen format: ${format}`);
  }
  
  return { blob, filename };
}

// Download report
export function downloadReport(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}
