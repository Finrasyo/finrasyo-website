/**
 * PDF Rapor Oluşturma ve İndirme İşlemleri
 */

import { saveAs } from 'file-saver';
import { ratioCategories } from './financial-ratios';
import { formatFinancialValue, generateRatioAnalysis } from './financial-calculations';

// PdfMake değişkeni
let pdfMake: any = null;

// Yazı stilleri
const styles = {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 10],
    color: '#1F497D'
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5],
    color: '#1F497D'
  },
  sectionHeader: {
    fontSize: 14,
    bold: true,
    margin: [0, 10, 0, 5],
    color: '#1F497D'
  },
  tableHeader: {
    bold: true,
    fontSize: 12,
    color: '#1F497D'
  },
  tableCell: {
    fontSize: 11,
    color: '#333333'
  },
  tableTitle: {
    fontSize: 12,
    bold: true,
    color: '#1F497D'
  }
};

/**
 * PdfMake kütüphanesini yükler (lazy loading)
 */
async function loadPdfLibraries() {
  if (pdfMake) return pdfMake;
  
  try {
    console.log("pdfMake kütüphanesi yükleniyor...");
    
    // pdfMake kütüphanesini dinamik olarak import et
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    
    // pdfMake'i global değişkene ata
    pdfMake = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    
    console.log("pdfMake kütüphanesi başarıyla yüklendi");
    
    return pdfMake;
  } catch (error) {
    console.error("pdfMake kütüphanesi yüklenirken hata:", error);
    throw new Error(`pdfMake kütüphanesi yüklenemedi: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Finansal verileri kullanarak PDF raporu oluşturur
 */
export async function generatePDFReport(
  company: { name: string; code: string | null; sector: string | null; id?: number },
  financialData: any,
  selectedRatios?: string[]
): Promise<Blob> {
  try {
    console.log("PDF raporu oluşturuluyor:", {
      company: company.name,
      financialDataKeys: Object.keys(financialData || {})
    });
    
    // pdfMake kütüphanesini yükle
    await loadPdfLibraries();
    
    if (!pdfMake) {
      throw new Error("PDF kütüphanesi yüklenemedi!");
    }
    
    // Başlık
    const title = `${company.name} Finansal Analiz Raporu`;
    
    // Tarih
    const today = new Date();
    const dateStr = today.toLocaleDateString('tr-TR');
    
    // Trend analizi için örnek yıllar
    const sampleYears = [2020, 2021, 2022, 2023, 2024];
    
    // Oran ID'lerini standardize etme fonksiyonu
    const normalizeRatioId = (ratioId: string): string => {
      // ID eşleştirmeleri
      const idMappings: Record<string, string> = {
        'acidTestRatio': 'quickRatio',
        'quickRatio': 'quickRatio'
      };
      
      return idMappings[ratioId] || ratioId;
    };
    
    // Fonksiyon: Seçilen oranları kontrol et
    const isRatioSelected = (ratioId: string): boolean => {
      // Eğer selectedRatios dizisi boşsa veya undefined ise, hiçbir oranı gösterme
      if (!selectedRatios || selectedRatios.length === 0) return false;
      
      // ID'yi standardize et
      const normalizedId = normalizeRatioId(ratioId);
      
      // Debug için seçilen oranları loglayalım
      console.log("Seçilen oranlar:", selectedRatios);
      console.log("Kontrol edilen oran ID:", ratioId, "Normalleştirilmiş ID:", normalizedId);
      
      // Hem orijinal ID'yi hem de normalleştirilmiş ID'yi kontrol et
      return selectedRatios.includes(ratioId) || selectedRatios.includes(normalizedId);
    };
    
    // Örnek trend verileri oluştur (gerçek uygulamada bu veritabanından gelecektir)
    const generateTrendDataForRatio = (ratioId: string, baseValue: number): Record<number, number> => {
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
    
    // Şirket bilgileri tablosu
    const companyInfoTable = {
      layout: 'lightHorizontalLines',
      table: {
        widths: ['30%', '70%'],
        body: [
          ['Şirket Adı', { text: company.name, bold: true }],
          ['Borsa Kodu', company.code || 'N/A'],
          ['Sektör', company.sector || 'N/A'],
          ['Rapor Tarihi', dateStr]
        ]
      },
      margin: [0, 10, 0, 20]
    };
    
    // İçerik nesnelerini tutacak dizi
    const contentItems: any[] = [
      { text: title, style: 'header' },
      
      // Şirket Bilgileri
      { text: 'Şirket Bilgileri', style: 'subheader' },
      companyInfoTable,
      
      // Yıllara göre oran analizi başlığı
      { text: 'Yıllara Göre Finansal Oran Analizi', style: 'subheader', pageBreak: 'before' },
      { text: 'Seçilen finansal oranların yıllara göre karşılaştırmalı değerleri aşağıda listelenmiştir:', margin: [0, 0, 0, 15] },
    ];
    
    // Finansal oranları hesapla
    const ratios = generateRatioAnalysis(financialData);
    
    // Likidite Oranları
    let hasLiquidityRatios = false;
    ratioCategories.liquidity.forEach(ratio => {
      if (isRatioSelected(ratio.id)) {
        hasLiquidityRatios = true;
      }
    });
    
    if (hasLiquidityRatios) {
      contentItems.push({
        text: 'Likidite Oranları',
        style: 'sectionHeader',
        margin: [0, 10, 0, 5]
      });
      
      // Her bir likidite oranı için trend tablosu oluştur
      ratioCategories.liquidity.forEach(ratio => {
        if (isRatioSelected(ratio.id)) {
          // Mevcut financialData'dan değeri al
          const currentValue = ratios[ratio.id]?.value || 0;
          
          // Trend verisi oluştur
          const trendData = generateTrendDataForRatio(ratio.id, currentValue);
          
          // Tablo verisini hazırla
          const tableBody = [
            [{ text: 'Yıl', style: 'tableHeader' }, { text: ratio.name, style: 'tableHeader' }]
          ];
          
          // Her yıl için satır ekle
          sampleYears.forEach(year => {
            tableBody.push([
              { text: year.toString(), style: 'tableCell' },
              { text: formatFinancialValue(trendData[year] || 0), style: 'tableCell' }
            ]);
          });
          
          // Tabloyu ekle
          contentItems.push({
            text: ratio.name,
            style: 'tableTitle',
            margin: [0, 10, 0, 5]
          });
          
          contentItems.push({
            table: {
              headerRows: 1,
              widths: ['30%', '70%'],
              body: tableBody
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 15]
          });
        }
      });
    }
    
    // Finansal Yapı Oranları
    let hasStructureRatios = false;
    ratioCategories.financialStructure.forEach(ratio => {
      if (isRatioSelected(ratio.id)) {
        hasStructureRatios = true;
      }
    });
    
    if (hasStructureRatios) {
      contentItems.push({
        text: 'Finansal Yapı Oranları',
        style: 'sectionHeader',
        margin: [0, 10, 0, 5],
        pageBreak: 'before'
      });
      
      // Her bir finansal yapı oranı için trend tablosu oluştur
      ratioCategories.financialStructure.forEach(ratio => {
        if (isRatioSelected(ratio.id)) {
          // Mevcut financialData'dan değeri al
          const currentValue = ratios[ratio.id]?.value || 0;
          
          // Trend verisi oluştur
          const trendData = generateTrendDataForRatio(ratio.id, currentValue);
          
          // Tablo verisini hazırla
          const tableBody = [
            [{ text: 'Yıl', style: 'tableHeader' }, { text: ratio.name, style: 'tableHeader' }]
          ];
          
          // Her yıl için satır ekle
          sampleYears.forEach(year => {
            tableBody.push([
              { text: year.toString(), style: 'tableCell' },
              { text: formatFinancialValue(trendData[year] || 0), style: 'tableCell' }
            ]);
          });
          
          // Tabloyu ekle
          contentItems.push({
            text: ratio.name,
            style: 'tableTitle',
            margin: [0, 10, 0, 5]
          });
          
          contentItems.push({
            table: {
              headerRows: 1,
              widths: ['30%', '70%'],
              body: tableBody
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 15]
          });
        }
      });
    }
    
    // Karlılık Oranları
    let hasProfitabilityRatios = false;
    ratioCategories.profitability.forEach(ratio => {
      if (isRatioSelected(ratio.id)) {
        hasProfitabilityRatios = true;
      }
    });
    
    if (hasProfitabilityRatios) {
      contentItems.push({
        text: 'Karlılık Oranları',
        style: 'sectionHeader',
        margin: [0, 10, 0, 5],
        pageBreak: 'before'
      });
      
      // Her bir karlılık oranı için trend tablosu oluştur
      ratioCategories.profitability.forEach(ratio => {
        if (isRatioSelected(ratio.id)) {
          // Mevcut financialData'dan değeri al
          const currentValue = ratios[ratio.id]?.value || 0;
          
          // Trend verisi oluştur
          const trendData = generateTrendDataForRatio(ratio.id, currentValue);
          
          // Tablo verisini hazırla
          const tableBody = [
            [{ text: 'Yıl', style: 'tableHeader' }, { text: ratio.name, style: 'tableHeader' }]
          ];
          
          // Her yıl için satır ekle
          sampleYears.forEach(year => {
            tableBody.push([
              { text: year.toString(), style: 'tableCell' },
              { text: formatFinancialValue(trendData[year] || 0), style: 'tableCell' }
            ]);
          });
          
          // Tabloyu ekle
          contentItems.push({
            text: ratio.name,
            style: 'tableTitle',
            margin: [0, 10, 0, 5]
          });
          
          contentItems.push({
            table: {
              headerRows: 1,
              widths: ['30%', '70%'],
              body: tableBody
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 15]
          });
        }
      });
    }
    
    // Yasal uyarı ekle
    contentItems.push({
      text: 'Bu rapordaki veriler finansal analiz amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.',
      bold: true,
      margin: [0, 20, 0, 10]
    });
    
    // PDF içerik ağacını oluştur - Yeni format
    const docDefinition: any = {
      info: {
        title: title,
        author: 'FinRasyo',
        subject: 'Finansal Analiz Raporu',
        keywords: 'finansal analiz, oran analizi, finrasyo',
      },
      header: function(currentPage: number, pageCount: number) {
        return { 
          text: 'FinRasyo - Finansal Veri Sunum Platformu', 
          alignment: 'right',
          margin: [10, 10, 20, 0],
          fontSize: 8,
          color: '#444'
        };
      },
      footer: function(currentPage: number, pageCount: number) {
        return { 
          text: `Sayfa ${currentPage}/${pageCount} | © ${new Date().getFullYear()} FinRasyo`, 
          alignment: 'center',
          margin: [10, 0, 10, 10],
          fontSize: 8,
          color: '#666'
        };
      },
      content: contentItems,
      styles: styles,
      defaultStyle: {
        fontSize: 10
      }
    };
    
    console.log("PDF tanımı oluşturuldu, PDF üretiliyor...");
    
    // PDF oluştur
    return new Promise((resolve, reject) => {
      try {
        // PDF dokümanı oluştur
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        
        // PDF blob'ı oluştur ve döndür
        pdfDocGenerator.getBlob((blob: Blob) => {
          console.log("PDF blob oluşturuldu");
          resolve(blob);
        });
      } catch (error) {
        console.error("PDF oluşturma hatası:", error);
        reject(new Error(`PDF oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  } catch (error) {
    console.error("PDF raporu oluşturma hatası:", error);
    throw new Error(`PDF raporu oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Raporu indirir
 */
export function downloadPDFReport(blob: Blob, filename: string): void {
  try {
    console.log(`PDF raporu indiriliyor: ${filename}`, {
      blobSize: blob.size,
      blobType: blob.type
    });
    
    saveAs(blob, filename);
    console.log("PDF rapor indirme işlemi başarılı");
  } catch (error) {
    console.error("PDF rapor indirme hatası:", error);
    throw new Error(`PDF raporu indirilemedi: ${error instanceof Error ? error.message : String(error)}`);
  }
}