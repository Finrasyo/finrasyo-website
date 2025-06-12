import { Request, Response } from "express";
import { storage } from "../storage";
import { Company, InsertReport } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { ratioCategories } from "client/src/lib/financial-ratios";

// Rapor oluşturma API endpoint'i
export async function generateReport(req: Request, res: Response) {
  try {
    const { companyId, financialDataId, format, options, metadata, selectedRatios: requestSelectedRatios } = req.body;
    
    console.log("Rapor oluşturma isteği:", {
      companyId,
      financialDataId,
      format,
      requestSelectedRatios,
      metadata
    });
    
    // Oran ID'lerini standardize etme fonksiyonu
    const normalizeRatioId = (ratioId: string): string => {
      // ID eşleştirmeleri
      const idMappings: Record<string, string> = {
        'acidTestRatio': 'quickRatio',
        'quickRatio': 'quickRatio'
      };
      
      return idMappings[ratioId] || ratioId;
    };
    
    // Seçilen oranları al ve standardize et
    let selectedRatios: string[] = [];
    
    // Önce doğrudan selectedRatios parametresini kontrol et
    if (requestSelectedRatios && Array.isArray(requestSelectedRatios)) {
      selectedRatios = requestSelectedRatios.map(id => normalizeRatioId(id));
      console.log("Doğrudan seçilen oranlar:", requestSelectedRatios);
      console.log("Standardize edilmiş oranlar:", selectedRatios);
    }
    // Sonra metadata'dan al
    else if (metadata) {
      try {
        const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        // Orijinal seçilen oranlar
        const originalRatios = metadataObj.ratio_ids || [];
        
        // Her bir ID'yi standardize et
        selectedRatios = originalRatios.map((id: string) => normalizeRatioId(id));
        
        console.log("Metadata'dan alınan oranlar:", originalRatios);
        console.log("Standardize edilmiş oranlar:", selectedRatios);
      } catch (e) {
        console.error("Metadata parse hatası:", e);
      }
    }
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Yetkilendirme hatası" });
    }
    
    // Şirket ve finansal veri bilgilerini al
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ error: "Şirket bulunamadı" });
    }
    
    // Kullanıcının şirkete erişim iznini kontrol et (admin veya şirket sahibi)
    if (company.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Bu şirket için rapor oluşturma izniniz yok" });
    }
    
    // Finansal veriyi al
    const financialData = await storage.getFinancialData(financialDataId);
    
    if (!financialData) {
      return res.status(404).json({ error: "Finansal veri bulunamadı" });
    }
    
    // Şirket finansal verilerini gerçek API'den al
    const companyFinancialResponse = await fetch(`http://localhost:5000/api/company-financials/${company.code}`);
    let realFinancialData = {};
    
    if (companyFinancialResponse.ok) {
      const companyData = await companyFinancialResponse.json();
      realFinancialData = companyData.financialData || {};
      console.log("Gerçek finansal veriler alındı:", realFinancialData);
    }
    
    // Finansal veri objesine seçilen oranları ve gerçek verileri ekle
    const financialDataWithOptions = {
      ...financialData,
      ...realFinancialData,
      selectedRatios 
    };
    
    let reportPath = '';
    
    // Format'a göre rapor oluştur
    switch (format.toLowerCase()) {
      case 'pdf':
        reportPath = await generatePdfReport(company, financialDataWithOptions);
        break;
      case 'excel':
        reportPath = await generateExcelReport(company, financialDataWithOptions);
        break;
      case 'csv':
        reportPath = await generateCsvReport(company, financialDataWithOptions);
        break;
      case 'word':
        reportPath = await generateWordReport(company, financialDataWithOptions);
        break;
      default:
        return res.status(400).json({ error: "Geçersiz rapor formatı" });
    }
    
    // Rapor bilgilerini kaydet
    const report = await storage.createReport({
      userId: req.user.id,
      companyId: company.id,
      financialDataId: financialData.id,
      format: format.toLowerCase(),
      url: reportPath,
      name: `${company.name} Finansal Rapor`,
      type: "financial",
      status: "completed"
    });
    
    // Kullanıcı admin değilse kredi düşür
    if (req.user.role !== "admin" && options?.price) {
      await storage.updateUserCredits(req.user.id, (req.user.credits || 0) - options.price);
    }
    
    res.status(200).json({
      id: report.id,
      url: reportPath,
      format: format.toLowerCase()
    });
  } catch (error) {
    console.error("Rapor oluşturma hatası:", error);
    res.status(500).json({ error: "Rapor oluşturulurken bir hata oluştu" });
  }
}

// Kullanıcının tüm raporlarını listele
export async function getUserReports(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Yetkilendirme hatası" });
    }
    
    const reports = await storage.getReportsForUser(req.user.id);
    
    // Şirket isimlerini ekle
    const reportsWithCompanyNames = await Promise.all(
      reports.map(async (report) => {
        const company = await storage.getCompany(report.companyId);
        return {
          ...report,
          companyName: company?.name || "Bilinmeyen Şirket"
        };
      })
    );
    
    res.status(200).json(reportsWithCompanyNames);
  } catch (error) {
    console.error("Rapor listeleme hatası:", error);
    res.status(500).json({ error: "Raporlar listelenirken bir hata oluştu" });
  }
}

// Belirli bir raporu getir
export async function getReport(req: Request, res: Response) {
  try {
    const reportId = parseInt(req.params.id);
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Yetkilendirme hatası" });
    }
    
    const report = await storage.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({ error: "Rapor bulunamadı" });
    }
    
    // Kullanıcının rapora erişim iznini kontrol et (admin veya rapor sahibi)
    if (report.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Bu raporu görüntüleme izniniz yok" });
    }
    
    const company = await storage.getCompany(report.companyId);
    
    res.status(200).json({
      ...report,
      companyName: company?.name || "Bilinmeyen Şirket"
    });
  } catch (error) {
    console.error("Rapor getirme hatası:", error);
    res.status(500).json({ error: "Rapor getirilirken bir hata oluştu" });
  }
}

// PDF rapor oluştur
async function generatePdfReport(company: Company, financialData: any): Promise<string> {
  // PDF için geçici dosya yolu oluştur
  const fileName = `report_${company.id}_${Date.now()}.pdf`;
  const reportDir = path.join(process.cwd(), 'public', 'reports');
  const filePath = path.join(reportDir, fileName);
  
  // Klasör yoksa oluştur
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Yeni PDF oluştur (A4 formatında)
  const doc = new jsPDF();
  
  // Başlık ekle
  doc.setFontSize(20);
  doc.text('FinRasyo - Finansal Analiz Raporu', 105, 15, { align: 'center' });
  
  // Şirket bilgileri
  doc.setFontSize(14);
  doc.text(`Şirket: ${company.name} (${company.code})`, 14, 30);
  doc.text(`Sektör: ${company.sector || 'Belirtilmemiş'}`, 14, 38);
  doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 46);
  
  // Likidite oranları tablosu
  doc.setFontSize(12);
  doc.text('Finansal Oranlar', 14, 60);
  
  // Seçilen oranları belirle
  const selectedRatioIds = financialData.selectedRatios || [];
  
  // Tablo içeriğini oluştur
  const tableBody = [];
  
  // Sadece seçilen oranları ekle
  if (selectedRatioIds.includes('currentRatio') && financialData.currentRatio !== undefined) {
    tableBody.push(['Cari Oran', financialData.currentRatio.toFixed(2), getRatioEvaluation('currentRatio', financialData.currentRatio)]);
  }
  
  if (selectedRatioIds.includes('quickRatio') && financialData.acidTestRatio !== undefined) {
    tableBody.push(['Asit-Test Oranı', financialData.acidTestRatio.toFixed(2), getRatioEvaluation('quickRatio', financialData.acidTestRatio)]);
  }
  
  if (selectedRatioIds.includes('cashRatio') && financialData.cashRatio !== undefined) {
    tableBody.push(['Nakit Oranı', financialData.cashRatio.toFixed(2), getRatioEvaluation('cashRatio', financialData.cashRatio)]);
  }
  
  // Eğer hiç oran seçilmemişse veya hesaplanamıyorsa bilgi mesajı ekle
  if (tableBody.length === 0) {
    tableBody.push(['Seçili oran bulunamadı', 'N/A', 'Lütfen analiz için en az bir oran seçin']);
  }
  
  // AutoTable kullanarak tablo oluştur
  autoTable(doc, {
    startY: 65,
    head: [['Oran Adı', 'Değer', 'Değerlendirme']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  // Son sayfaya logo ekle
  // FinRasyo logosu
  doc.setPage(doc.getNumberOfPages());
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('FinRasyo - Finansal Veri Sunum Platformu', 105, 280, { align: 'center' });
  doc.text('Serra Yazılım © 2023', 105, 285, { align: 'center' });
  
  // PDF'i dosyaya kaydet
  doc.save(filePath);
  
  // URL'i döndür
  return `/reports/${fileName}`;
}

// Excel rapor oluştur
async function generateExcelReport(company: Company, financialData: any): Promise<string> {
  try {
    // Excel için geçici dosya yolu oluştur
    const fileName = `report_${company.id}_${Date.now()}.xlsx`;
    const reportDir = path.join(process.cwd(), 'public', 'reports');
    const filePath = path.join(reportDir, fileName);
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Yeni Excel çalışma kitabı oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FinRasyo';
    workbook.lastModifiedBy = 'FinRasyo';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Genel bilgiler sayfası
    const infoSheet = workbook.addWorksheet('Genel Bilgiler', {
      properties: { tabColor: { argb: '9CC3E6' } }
    });
    infoSheet.columns = [
      { header: 'Bilgi', key: 'info', width: 30 },
      { header: 'Değer', key: 'value', width: 50 }
    ];
    
    // Şirket bilgilerini ekle
    infoSheet.addRow({ info: 'Şirket Adı', value: company.name });
    infoSheet.addRow({ info: 'Şirket Kodu', value: company.code });
    infoSheet.addRow({ info: 'Sektör', value: company.sector || 'Belirtilmemiş' });
    infoSheet.addRow({ info: 'Rapor Tarihi', value: new Date().toLocaleDateString('tr-TR') });
    
    // Başlık stilini ayarla
    infoSheet.getRow(1).font = { bold: true, size: 12 };
    infoSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E2EFDA' }
    };
    
    // Finansal oranlar sayfası
    const ratiosSheet = workbook.addWorksheet('Finansal Oranlar', {
      properties: { tabColor: { argb: 'A9D08E' } }
    });
    ratiosSheet.columns = [
      { header: 'Oran Kategorisi', key: 'category', width: 20 },
      { header: 'Oran Adı', key: 'name', width: 30 },
      { header: 'Değer', key: 'value', width: 15 },
      { header: 'Değerlendirme', key: 'evaluation', width: 40 }
    ];
    
    // Başlık stilini ayarla
    ratiosSheet.getRow(1).font = { bold: true, size: 12 };
    ratiosSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E2EFDA' }
    };
    
    // Seçilen oranları belirle
    const selectedRatioIds = financialData.selectedRatios || [];
    console.log('Excel raporu için seçilen oranlar:', selectedRatioIds);
    
    // Likidite oranları - Sadece seçilen oranları ekle
    if (selectedRatioIds.includes('currentRatio') && financialData.currentRatio !== undefined) {
      ratiosSheet.addRow({ 
        category: 'Likidite', 
        name: 'Cari Oran', 
        value: financialData.currentRatio.toFixed(2), 
        evaluation: getRatioEvaluation('currentRatio', financialData.currentRatio) 
      });
    }
    
    if (selectedRatioIds.includes('quickRatio') && financialData.acidTestRatio !== undefined) {
      ratiosSheet.addRow({ 
        category: 'Likidite', 
        name: 'Asit-Test Oranı', 
        value: financialData.acidTestRatio.toFixed(2), 
        evaluation: getRatioEvaluation('quickRatio', financialData.acidTestRatio) 
      });
    }
    
    if (selectedRatioIds.includes('cashRatio') && financialData.cashRatio !== undefined) {
      ratiosSheet.addRow({ 
        category: 'Likidite', 
        name: 'Nakit Oranı', 
        value: financialData.cashRatio.toFixed(2), 
        evaluation: getRatioEvaluation('cashRatio', financialData.cashRatio) 
      });
    }
    
    // Diğer oranları da benzer şekilde ekle (seçiliyse)
    if (selectedRatioIds.includes('debtRatio') && financialData.debtRatio !== undefined) {
      ratiosSheet.addRow({ 
        category: 'Finansal Yapı', 
        name: 'Borç Oranı', 
        value: financialData.debtRatio.toFixed(2), 
        evaluation: getRatioEvaluation('debtRatio', financialData.debtRatio) 
      });
    }
    
    // Hiç satır eklenemediyse bilgi satırı ekle
    if (ratiosSheet.rowCount <= 1) {
      ratiosSheet.addRow({
        category: 'Bilgi',
        name: 'Seçili oran bulunamadı',
        value: 'N/A',
        evaluation: 'Lütfen analiz için en az bir oran seçin'
      });
    }
    
    // Tüm hücrelere kenarlık ekle
    for (let row = 1; row <= ratiosSheet.rowCount; row++) {
      for (let col = 1; col <= ratiosSheet.columnCount; col++) {
        const cell = ratiosSheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }
    
    // Excel dosyasını kaydet
    await workbook.xlsx.writeFile(filePath);
    
    // URL'i döndür
    return `/reports/${fileName}`;
  } catch (error: any) {
    console.error('Excel raporu oluşturma hatası:', error);
    throw new Error(`Excel raporu oluşturulamadı: ${error.message}`);
  }
}
// CSV rapor oluştur
async function generateCsvReport(company: Company, financialData: any): Promise<string> {
  // CSV için geçici dosya yolu oluştur
  const fileName = `report_${company.id}_${Date.now()}.csv`;
  const reportDir = path.join(process.cwd(), 'public', 'reports');
  const filePath = path.join(reportDir, fileName);
  
  // Klasör yoksa oluştur
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Seçilen oranları belirle
  const selectedRatioIds = financialData.selectedRatios || [];
  
  // CSV başlık ve temel bilgiler
  const csvRows = [
    ['Rapor Tipi', 'FinRasyo Finansal Analiz Raporu'],
    ['Şirket', company.name],
    ['Kod', company.code],
    ['Sektör', company.sector || 'Belirtilmemiş'],
    ['Rapor Tarihi', new Date().toLocaleDateString('tr-TR')],
    [''],
    ['Oran Kategorisi', 'Oran Adı', 'Değer', 'Değerlendirme']
  ];
  
  // Likidite oranları - Sadece seçilen oranları ekle
  let ratioAdded = false;
  
  if (selectedRatioIds.includes('currentRatio') && financialData.currentRatio !== undefined) {
    csvRows.push(['Likidite', 'Cari Oran', financialData.currentRatio.toFixed(2), getRatioEvaluation('currentRatio', financialData.currentRatio)]);
    ratioAdded = true;
  }
  
  if (selectedRatioIds.includes('quickRatio') && financialData.acidTestRatio !== undefined) {
    csvRows.push(['Likidite', 'Asit-Test Oranı', financialData.acidTestRatio.toFixed(2), getRatioEvaluation('quickRatio', financialData.acidTestRatio)]);
    ratioAdded = true;
  }
  
  if (selectedRatioIds.includes('cashRatio') && financialData.cashRatio !== undefined) {
    csvRows.push(['Likidite', 'Nakit Oranı', financialData.cashRatio.toFixed(2), getRatioEvaluation('cashRatio', financialData.cashRatio)]);
    ratioAdded = true;
  }
  
  // Hiç oran eklenmediyse bilgi satırı ekle
  if (!ratioAdded) {
    csvRows.push(['Bilgi', 'Seçili oran bulunamadı', 'N/A', 'Lütfen analiz için en az bir oran seçin']);
  }
  
  // CSV formatına dönüştür
  const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  // Dosyaya yaz
  fs.writeFileSync(filePath, csvContent);
  
  // URL'i döndür
  return `/reports/${fileName}`;
}

// Word rapor oluştur
async function generateWordReport(company: Company, financialData: any): Promise<string> {
  try {
    // Word için geçici dosya yolu oluştur - HTML olarak kaydediyoruz (Word'de açılabilir)
    // Burada önemli nokta: .docx yerine .html uzantısı kullanılmalı, client tarafında indirirken .docx olarak değişecek
    const fileName = `report_${company.id}_${Date.now()}.html`;
    const reportDir = path.join(process.cwd(), 'public', 'reports');
    const filePath = path.join(reportDir, fileName);
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Seçilen oranları belirle
    const selectedRatioIds = financialData.selectedRatios || [];
    console.log('Word raporu için seçilen oranlar:', selectedRatioIds);
    
    // Tablo satırlarını hazırla
    let tableRows = '';
    let ratioAdded = false;
    
    if (selectedRatioIds.includes('currentRatio') && financialData.currentRatio !== undefined) {
      tableRows += `
        <tr>
          <td>Cari Oran</td>
          <td>${financialData.currentRatio.toFixed(2)}</td>
          <td>${getRatioEvaluation('currentRatio', financialData.currentRatio)}</td>
        </tr>
      `;
      ratioAdded = true;
    }
    
    if (selectedRatioIds.includes('quickRatio') && financialData.acidTestRatio !== undefined) {
      tableRows += `
        <tr>
          <td>Asit-Test Oranı</td>
          <td>${financialData.acidTestRatio.toFixed(2)}</td>
          <td>${getRatioEvaluation('quickRatio', financialData.acidTestRatio)}</td>
        </tr>
      `;
      ratioAdded = true;
    }
    
    if (selectedRatioIds.includes('cashRatio') && financialData.cashRatio !== undefined) {
      tableRows += `
        <tr>
          <td>Nakit Oranı</td>
          <td>${financialData.cashRatio.toFixed(2)}</td>
          <td>${getRatioEvaluation('cashRatio', financialData.cashRatio)}</td>
        </tr>
      `;
      ratioAdded = true;
    }
    
    // Diğer oranları da kontrol et
    if (selectedRatioIds.includes('debtRatio') && financialData.debtRatio !== undefined) {
      tableRows += `
        <tr>
          <td>Borç Oranı</td>
          <td>${financialData.debtRatio.toFixed(2)}</td>
          <td>${getRatioEvaluation('debtRatio', financialData.debtRatio)}</td>
        </tr>
      `;
      ratioAdded = true;
    }
    
    // Eğer hiç oran seçilmemişse bilgi satırı ekle
    if (!ratioAdded) {
      tableRows = `
        <tr>
          <td>Seçili oran bulunamadı</td>
          <td>N/A</td>
          <td>Lütfen analiz için en az bir oran seçin</td>
        </tr>
      `;
    }
    
    // MS Word açılabilir HTML oluştur
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>FinRasyo - Finansal Analiz Raporu</title>
        <style>
          body { font-family: 'Calibri', sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd; }
          th { background-color: #4285f4; color: white; text-align: left; padding: 10px; }
          td { border: 1px solid #ddd; padding: 10px; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { text-align: center; color: #666; margin-top: 50px; border-top: 1px solid #ddd; padding-top: 10px; }
          h1 { color: #1a73e8; }
          h2 { color: #174ea6; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FinRasyo - Finansal Analiz Raporu</h1>
        </div>
        
        <div class="company-info">
          <h2>Şirket Bilgileri</h2>
          <p><strong>Şirket:</strong> ${company.name} (${company.code})</p>
          <p><strong>Sektör:</strong> ${company.sector || 'Belirtilmemiş'}</p>
          <p><strong>Rapor Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
        
        <h2>Finansal Oranlar</h2>
        <table>
          <tr>
            <th>Oran Adı</th>
            <th>Değer</th>
            <th>Değerlendirme</th>
          </tr>
          ${tableRows}
        </table>
        
        <div class="footer">
          <p>FinRasyo - Finansal Veri Sunum Platformu</p>
          <p>Serra Yazılım © ${new Date().getFullYear()}</p>
        </div>
      </body>
      </html>
    `;
    
    // Dosyaya yaz
    fs.writeFileSync(filePath, htmlContent);
    
    // URL'i döndür
    return `/reports/${fileName}`;
  } catch (error: any) {
    console.error('Word raporu oluşturma hatası:', error);
    throw new Error(`Word raporu oluşturulamadı: ${error.message}`);
  }
}
// Oran değerlendirmesi yap
function getRatioEvaluation(ratioId: string, value: number): string {
  if (value === undefined || value === null) {
    return "Değerlendirme yapılamıyor";
  }
  
  switch (ratioId) {
    case 'currentRatio':
      if (value < 1) return "Yetersiz likidite, kısa vadeli borç ödeme gücü düşük";
      if (value >= 1 && value < 1.5) return "Kabul edilebilir likidite";
      if (value >= 1.5 && value < 2) return "İyi likidite";
      return "Çok iyi likidite, ancak varlık fazlalığı olabilir";
      
    case 'quickRatio':
      if (value < 0.8) return "Yetersiz likidite, acil ödeme gücü düşük";
      if (value >= 0.8 && value < 1) return "Kabul edilebilir likidite";
      if (value >= 1 && value < 1.5) return "İyi likidite";
      return "Çok iyi likidite, stoklar dışında varlık fazlalığı olabilir";
      
    case 'cashRatio':
      if (value < 0.2) return "Nakit sıkıntısı yaşanabilir";
      if (value >= 0.2 && value < 0.5) return "Kabul edilebilir nakit oranı";
      if (value >= 0.5 && value < 1) return "İyi nakit oranı";
      return "Çok iyi nakit oranı, atıl nakit sorunu olabilir";
      
    case 'debtRatio':
      if (value < 0.3) return "Düşük kaldıraç, düşük risk";
      if (value >= 0.3 && value < 0.5) return "Orta seviye kaldıraç";
      if (value >= 0.5 && value < 0.7) return "Yüksek kaldıraç, dikkatli olunmalı";
      return "Çok yüksek kaldıraç, yüksek finansal risk";
      
    case 'netProfitMargin':
      if (value < 0.05) return "Düşük karlılık";
      if (value >= 0.05 && value < 0.1) return "Orta seviye karlılık";
      if (value >= 0.1 && value < 0.2) return "İyi karlılık";
      return "Çok iyi karlılık";
      
    default:
      return "Değerlendirme bilgisi bulunmuyor";
  }
}