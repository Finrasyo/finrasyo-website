/**
 * PDF Rapor Oluşturma ve İndirme İşlemleri
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, Content, StyleDictionary, TableCell } from 'pdfmake/interfaces';
import { saveAs } from 'file-saver';
import { ratioCategories } from './financial-ratios';
import { formatFinancialValue, generateRatioAnalysis } from './financial-calculations';

// PDF oluşturucu için fontları ayarla
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Türkçe karakter desteği
const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

// PDF stilleri
const styles: StyleDictionary = {
  header: {
    fontSize: 22,
    bold: true,
    alignment: 'center',
    margin: [0, 0, 0, 10]
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5],
    color: '#3366cc'
  },
  sectionHeader: {
    fontSize: 14,
    bold: true,
    margin: [0, 15, 0, 5]
  },
  tableHeader: {
    bold: true,
    fillColor: '#428bca',
    color: 'white',
    alignment: 'center'
  },
  tableCell: {
    margin: [0, 3, 0, 3]
  },
  valueBold: {
    bold: true
  },
  footer: {
    fontSize: 8,
    margin: [0, 10, 0, 0],
    color: '#666666',
    alignment: 'center'
  }
};

/**
 * Finansal verileri kullanarak PDF raporu oluşturur
 */
export async function generatePDFReport(
  company: { name: string; code: string | null; sector: string | null; id?: number },
  financialData: any
): Promise<Blob> {
  try {
    console.log("PDF raporu oluşturuluyor:", {
      company: company.name,
      financialDataKeys: Object.keys(financialData || {})
    });

    // Başlık
    const title = `${company.name} Finansal Analiz Raporu`;
    
    // Tarih
    const today = new Date();
    const dateStr = today.toLocaleDateString('tr-TR');
    
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
    
    // Finansal veri özeti tablosu
    const financialSummaryTable = {
      layout: 'headerLineOnly',
      table: {
        headerRows: 1,
        widths: ['40%', '60%'],
        body: [
          [{ text: 'Finansal Gösterge', style: 'tableHeader' }, { text: 'Değer', style: 'tableHeader' }],
          ['Dönem', financialData.period || 'N/A'],
          ['Dönem Sonu Tarihi', financialData.year ? `${financialData.year}` : 'N/A'],
          ['Toplam Varlıklar', formatFinancialValue(financialData.totalAssets || 0)],
          ['Toplam Borçlar', formatFinancialValue(financialData.totalLiabilities || 0)],
          ['Öz Sermaye', formatFinancialValue(financialData.equity || 0)],
          ['Satış Gelirleri', formatFinancialValue(financialData.revenue || 0)],
          ['Faaliyet Kârı', formatFinancialValue(financialData.operatingProfit || 0)],
          ['Net Kâr', formatFinancialValue(financialData.netProfit || 0)]
        ]
      },
      margin: [0, 10, 0, 20]
    };
    
    // Finansal oranlar
    const ratios = generateRatioAnalysis(financialData);
    
    // Likidite oranları tablosu
    const liquidityRatiosTable = {
      layout: 'headerLineOnly',
      table: {
        headerRows: 1,
        widths: ['40%', '30%', '30%'],
        body: [
          [
            { text: 'Likidite Oranları', style: 'tableHeader' }, 
            { text: 'Değer', style: 'tableHeader' }, 
            { text: 'Değerlendirme', style: 'tableHeader' }
          ],
          ...ratioCategories.liquidity.map(ratio => [
            ratio.name,
            formatFinancialValue(ratios[ratio.id]?.value || 0),
            ratios[ratio.id]?.interpretation || 'N/A'
          ])
        ]
      },
      margin: [0, 10, 0, 20]
    };
    
    // Finansal yapı oranları tablosu
    const financialStructureTable = {
      layout: 'headerLineOnly',
      table: {
        headerRows: 1,
        widths: ['40%', '30%', '30%'],
        body: [
          [
            { text: 'Finansal Yapı Oranları', style: 'tableHeader' }, 
            { text: 'Değer', style: 'tableHeader' }, 
            { text: 'Değerlendirme', style: 'tableHeader' }
          ],
          ...ratioCategories.financialStructure.map(ratio => [
            ratio.name,
            formatFinancialValue(ratios[ratio.id]?.value || 0),
            ratios[ratio.id]?.interpretation || 'N/A'
          ])
        ]
      },
      margin: [0, 10, 0, 20]
    };
    
    // Karlılık oranları tablosu
    const profitabilityTable = {
      layout: 'headerLineOnly',
      table: {
        headerRows: 1,
        widths: ['40%', '30%', '30%'],
        body: [
          [
            { text: 'Kârlılık Oranları', style: 'tableHeader' }, 
            { text: 'Değer', style: 'tableHeader' }, 
            { text: 'Değerlendirme', style: 'tableHeader' }
          ],
          ...ratioCategories.profitability.map(ratio => [
            ratio.name,
            formatFinancialValue(ratios[ratio.id]?.value || 0),
            ratios[ratio.id]?.interpretation || 'N/A'
          ])
        ]
      },
      margin: [0, 10, 0, 20]
    };
    
    // Logo yolu
    // const logoPath = '/logo.jpg'; // Public klasöründeki logo 
    
    // PDF içerik ağacını oluştur
    const docDefinition: TDocumentDefinitions = {
      info: {
        title: title,
        author: 'FinRasyo',
        subject: 'Finansal Analiz Raporu',
        keywords: 'finansal analiz, oran analizi, finrasyo',
      },
      header: function(currentPage, pageCount) {
        return { 
          text: 'FinRasyo - Finansal Veri Sunum Platformu', 
          alignment: 'right',
          margin: [10, 10, 20, 0],
          fontSize: 8,
          color: '#444'
        };
      },
      footer: function(currentPage, pageCount) {
        return { 
          text: `Sayfa ${currentPage}/${pageCount} | © ${new Date().getFullYear()} FinRasyo`, 
          alignment: 'center',
          margin: [10, 0, 10, 10],
          fontSize: 8,
          color: '#666'
        };
      },
      content: [
        { text: title, style: 'header' },
        
        // Şirket Bilgileri
        { text: 'Şirket Bilgileri', style: 'subheader' },
        companyInfoTable,
        
        // Finansal Veriler
        { text: 'Finansal Veriler Özeti', style: 'subheader' },
        { text: 'Temel finansal göstergeler aşağıda listelenmiştir:', margin: [0, 0, 0, 10] },
        financialSummaryTable,
        
        // Finansal Oran Analizi
        { text: 'Finansal Oran Analizi', style: 'subheader' },
        { text: 'Finansal oranlar aşağıdaki kategorilere göre hesaplanmıştır:', margin: [0, 0, 0, 10] },
        
        // Likidite Oranları
        { text: 'Likidite Oranları', style: 'sectionHeader' },
        { text: 'Bu oranlar şirketin kısa vadeli borçlarını ödeme gücünü gösterir:', margin: [0, 0, 0, 10] },
        liquidityRatiosTable,
        
        // Finansal Yapı Oranları
        { text: 'Finansal Yapı Oranları', style: 'sectionHeader' },
        { text: 'Bu oranlar şirketin uzun vadeli borç ödeme gücü ve finansal yapısını gösterir:', margin: [0, 0, 0, 10] },
        financialStructureTable,
        
        // Kârlılık Oranları
        { text: 'Kârlılık Oranları', style: 'sectionHeader' },
        { text: 'Bu oranlar şirketin karlılık düzeyini ve verimliliğini gösterir:', margin: [0, 0, 0, 10] },
        profitabilityTable,
        
        // Uyarı ve Yorum
        {
          text: 'Bu rapordaki veriler finansal analiz amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.',
          bold: true,
          margin: [0, 20, 0, 10]
        },
      ],
      styles: styles,
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      }
    };
    
    // PDF oluştur
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    // PDF'i blob olarak indir
    return new Promise<Blob>((resolve, reject) => {
      try {
        pdfDocGenerator.getBlob((blob) => {
          console.log("PDF blob başarıyla oluşturuldu, boyut:", blob.size);
          resolve(blob);
        });
      } catch (error) {
        console.error("PDF blob oluşturma hatası:", error);
        reject(error);
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