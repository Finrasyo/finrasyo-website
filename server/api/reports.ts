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
    const { companyId, financialDataId, format, options } = req.body;
    
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
    
    let reportPath = '';
    
    // Format'a göre rapor oluştur
    switch (format.toLowerCase()) {
      case 'pdf':
        reportPath = await generatePdfReport(company, financialData);
        break;
      case 'excel':
        reportPath = await generateExcelReport(company, financialData);
        break;
      case 'csv':
        reportPath = await generateCsvReport(company, financialData);
        break;
      case 'word':
        reportPath = await generateWordReport(company, financialData);
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
  doc.text('Likidite Oranları', 14, 60);
  
  // AutoTable kullanarak tablo oluştur
  autoTable(doc, {
    startY: 65,
    head: [['Oran Adı', 'Değer', 'Değerlendirme']],
    body: [
      ['Cari Oran', financialData.currentRatio.toFixed(2), getRatioEvaluation('currentRatio', financialData.currentRatio)],
      ['Asit-Test Oranı', financialData.acidTestRatio.toFixed(2), getRatioEvaluation('quickRatio', financialData.acidTestRatio)],
      ['Nakit Oranı', financialData.cashRatio?.toFixed(2) || 'N/A', getRatioEvaluation('cashRatio', financialData.cashRatio)],
    ],
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
  const infoSheet = workbook.addWorksheet('Genel Bilgiler');
  infoSheet.columns = [
    { header: 'Bilgi', key: 'info', width: 30 },
    { header: 'Değer', key: 'value', width: 50 }
  ];
  
  // Şirket bilgilerini ekle
  infoSheet.addRow({ info: 'Şirket Adı', value: company.name });
  infoSheet.addRow({ info: 'Şirket Kodu', value: company.code });
  infoSheet.addRow({ info: 'Sektör', value: company.sector || 'Belirtilmemiş' });
  infoSheet.addRow({ info: 'Rapor Tarihi', value: new Date().toLocaleDateString('tr-TR') });
  
  // Finansal oranlar sayfası
  const ratiosSheet = workbook.addWorksheet('Finansal Oranlar');
  ratiosSheet.columns = [
    { header: 'Oran Kategorisi', key: 'category', width: 20 },
    { header: 'Oran Adı', key: 'name', width: 30 },
    { header: 'Değer', key: 'value', width: 15 },
    { header: 'Değerlendirme', key: 'evaluation', width: 40 }
  ];
  
  // Oran kategorilerini ekle
  let rowIndex = 2;
  
  // Likidite oranları
  ratiosSheet.addRow({ 
    category: 'Likidite', 
    name: 'Cari Oran', 
    value: financialData.currentRatio.toFixed(2), 
    evaluation: getRatioEvaluation('currentRatio', financialData.currentRatio) 
  });
  
  ratiosSheet.addRow({ 
    category: 'Likidite', 
    name: 'Asit-Test Oranı', 
    value: financialData.acidTestRatio.toFixed(2), 
    evaluation: getRatioEvaluation('quickRatio', financialData.acidTestRatio) 
  });
  
  ratiosSheet.addRow({ 
    category: 'Likidite', 
    name: 'Nakit Oranı', 
    value: financialData.cashRatio?.toFixed(2) || 'N/A', 
    evaluation: getRatioEvaluation('cashRatio', financialData.cashRatio) 
  });
  
  // Excel dosyasını kaydet
  await workbook.xlsx.writeFile(filePath);
  
  // URL'i döndür
  return `/reports/${fileName}`;
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
  
  // CSV başlık ve değerleri
  const csvRows = [
    ['Rapor Tipi', 'FinRasyo Finansal Analiz Raporu'],
    ['Şirket', company.name],
    ['Kod', company.code],
    ['Sektör', company.sector || 'Belirtilmemiş'],
    ['Rapor Tarihi', new Date().toLocaleDateString('tr-TR')],
    [''],
    ['Oran Kategorisi', 'Oran Adı', 'Değer', 'Değerlendirme'],
    ['Likidite', 'Cari Oran', financialData.currentRatio.toFixed(2), getRatioEvaluation('currentRatio', financialData.currentRatio)],
    ['Likidite', 'Asit-Test Oranı', financialData.acidTestRatio.toFixed(2), getRatioEvaluation('quickRatio', financialData.acidTestRatio)],
    ['Likidite', 'Nakit Oranı', financialData.cashRatio?.toFixed(2) || 'N/A', getRatioEvaluation('cashRatio', financialData.cashRatio)]
  ];
  
  // CSV formatına dönüştür
  const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  // Dosyaya yaz
  fs.writeFileSync(filePath, csvContent);
  
  // URL'i döndür
  return `/reports/${fileName}`;
}

// Word rapor oluştur (HTML formatında kaydedilir, Word'de açılabilir)
async function generateWordReport(company: Company, financialData: any): Promise<string> {
  // HTML/Word için geçici dosya yolu oluştur
  const fileName = `report_${company.id}_${Date.now()}.html`;
  const reportDir = path.join(process.cwd(), 'public', 'reports');
  const filePath = path.join(reportDir, fileName);
  
  // Klasör yoksa oluştur
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // MS Word açılabilir HTML oluştur
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>FinRasyo - Finansal Analiz Raporu</title>
      <style>
        body { font-family: 'Calibri', sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #4285f4; color: white; text-align: left; padding: 8px; }
        td { border: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .footer { text-align: center; color: #666; margin-top: 50px; }
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
      
      <h2>Likidite Oranları</h2>
      <table>
        <tr>
          <th>Oran Adı</th>
          <th>Değer</th>
          <th>Değerlendirme</th>
        </tr>
        <tr>
          <td>Cari Oran</td>
          <td>${financialData.currentRatio.toFixed(2)}</td>
          <td>${getRatioEvaluation('currentRatio', financialData.currentRatio)}</td>
        </tr>
        <tr>
          <td>Asit-Test Oranı</td>
          <td>${financialData.acidTestRatio.toFixed(2)}</td>
          <td>${getRatioEvaluation('quickRatio', financialData.acidTestRatio)}</td>
        </tr>
        <tr>
          <td>Nakit Oranı</td>
          <td>${financialData.cashRatio?.toFixed(2) || 'N/A'}</td>
          <td>${getRatioEvaluation('cashRatio', financialData.cashRatio)}</td>
        </tr>
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