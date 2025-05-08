/**
 * BIST Şirketlerinin Finansal Verilerini Google Finance ve Yahoo Finance'den Çeken Script
 *
 * Bu script, BIST'te işlem gören şirketlerin finansal verilerini Google Finance ve Yahoo Finance
 * gibi kaynaklardan çeker ve yerel veri deposuna kaydeder.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { bistCompanies } from '../client/src/data/bist-companies';

// Yahoo Finance API için gerekli başlıklar
const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};

// Google Finance API için gerekli başlıklar
const GOOGLE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'DNT': '1',
  'Connection': 'keep-alive'
};

// BIST şirketlerinin Yahoo Finance ve Google Finance'deki kod önekleri
const YAHOO_PREFIX = 'IST:'; // Yahoo Finance'de BIST şirketleri için kullanılan önek (IST:AKBNK gibi)
const GOOGLE_PREFIX = 'IST:'; // Google Finance'de BIST şirketleri için kullanılan önek

/**
 * Yahoo Finance'den bir şirketin finansal verilerini çeker
 */
async function fetchYahooFinancials(stockCode: string): Promise<any> {
  try {
    console.log(`Yahoo Finance'den ${stockCode} için veri çekiliyor...`);
    
    // Yahoo Finance'in finansal veri API'si
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${YAHOO_PREFIX}${stockCode}?modules=financialData,defaultKeyStatistics,balanceSheetHistory,incomeStatementHistory,cashflowStatementHistory`;
    
    const response = await axios.get(url, { headers: YAHOO_HEADERS });
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Yahoo Finance'den gelen verileri işle
    const data = response.data;
    if (!data.quoteSummary || !data.quoteSummary.result || data.quoteSummary.result.length === 0) {
      throw new Error("Veri bulunamadı veya boş veri döndürüldü.");
    }
    
    // Temel finansal verileri çıkart
    const financials = data.quoteSummary.result[0];
    
    return {
      source: 'YahooFinance',
      stockCode,
      financialData: financials.financialData || {},
      keyStatistics: financials.defaultKeyStatistics || {},
      balanceSheet: financials.balanceSheetHistory?.balanceSheetStatements || [],
      incomeStatement: financials.incomeStatementHistory?.incomeStatementHistory || [],
      cashflowStatement: financials.cashflowStatementHistory?.cashflowStatements || []
    };
  } catch (error) {
    console.error(`${stockCode} için Yahoo Finance verileri çekilemedi:`, error);
    return null;
  }
}

/**
 * Google Finance'den bir şirketin finansal verilerini çeker
 */
async function fetchGoogleFinancials(stockCode: string): Promise<any> {
  try {
    console.log(`Google Finance'den ${stockCode} için veri çekiliyor...`);
    
    // Google Finance'in finansal veri sayfası
    const url = `https://www.google.com/finance/quote/${GOOGLE_PREFIX}${stockCode}`;
    
    const response = await axios.get(url, { headers: GOOGLE_HEADERS });
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // HTML içeriğinden veri çıkartmak için cheerio kullanımı
    const $ = cheerio.load(response.data);
    
    // Şirket adı
    const companyName = $('div[role="heading"][aria-level="1"]').text().trim();
    
    // Mevcut hisse fiyatı
    const currentPrice = $('div[data-last-price]').data('last-price') as string;
    
    // Fiyat değişimi
    const priceChange = $('div[data-last-price]').next().find('span:first-child').text().trim();
    
    // Diğer finansal metrikler (P/E, Divident Yield vb.)
    const metrics: Record<string, string> = {};
    $('table.PFMUnZe0Bm7ZJhEbwEJy tbody tr').each((_, el) => {
      const key = $(el).find('td:first-child div').text().trim();
      const value = $(el).find('td:last-child div').text().trim();
      if (key && value) {
        metrics[key] = value;
      }
    });
    
    return {
      source: 'GoogleFinance',
      stockCode,
      companyName,
      currentPrice,
      priceChange,
      metrics
    };
  } catch (error) {
    console.error(`${stockCode} için Google Finance verileri çekilemedi:`, error);
    return null;
  }
}

/**
 * İki farklı kaynaktan alınan verileri birleştirir
 */
function mergeFinancialData(yahooData: any, googleData: any): any {
  if (!yahooData && !googleData) return null;
  
  // Birleştirilmiş veri nesnesi
  const mergedData = {
    stockCode: yahooData?.stockCode || googleData?.stockCode,
    companyName: googleData?.companyName || '',
    currentPrice: {
      value: parseFloat(googleData?.currentPrice || '0'),
      source: 'GoogleFinance'
    },
    priceChange: {
      value: googleData?.priceChange || '0',
      source: 'GoogleFinance'
    },
    financialData: yahooData?.financialData || {},
    keyStatistics: yahooData?.keyStatistics || {},
    balanceSheet: yahooData?.balanceSheet || [],
    incomeStatement: yahooData?.incomeStatement || [],
    cashflowStatement: yahooData?.cashflowStatement || [],
    metrics: googleData?.metrics || {},
    lastUpdated: new Date().toISOString()
  };
  
  return mergedData;
}

/**
 * Bir şirketin hem Yahoo Finance hem de Google Finance'den verilerini çeker
 */
async function fetchCompanyFinancials(stockCode: string): Promise<any> {
  try {
    // Her iki kaynaktan da verileri çek
    const yahooData = await fetchYahooFinancials(stockCode);
    const googleData = await fetchGoogleFinancials(stockCode);
    
    // Verileri birleştir
    const mergedData = mergeFinancialData(yahooData, googleData);
    
    return mergedData;
  } catch (error) {
    console.error(`${stockCode} için veriler çekilemedi:`, error);
    return null;
  }
}

/**
 * Tüm BIST şirketlerinin finansal verilerini çeker
 */
async function fetchAllCompanyFinancials(): Promise<Record<string, any>> {
  const financialData: Record<string, any> = {};
  const errorList: string[] = [];
  
  console.log(`Toplam ${bistCompanies.length} şirket için veri çekme işlemi başlatılıyor...`);
  
  // Her şirket için paralel işlem yapmak yerine sırayla işlem yapıyoruz
  // çünkü API rate limit'lerine takılmamak önemli
  for (const company of bistCompanies) {
    try {
      console.log(`${company.code} (${company.name}) için veri çekiliyor...`);
      const data = await fetchCompanyFinancials(company.code);
      
      if (data) {
        financialData[company.code] = {
          ...data,
          name: company.name,
          sector: company.sector
        };
        console.log(`✓ ${company.code} için veri başarıyla çekildi.`);
      } else {
        console.error(`✗ ${company.code} için veri çekilemedi.`);
        errorList.push(company.code);
      }
      
      // API rate limit'lerine takılmamak için her istek arasında biraz bekle
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`${company.code} için hata oluştu:`, error);
      errorList.push(company.code);
    }
  }
  
  console.log(`Veri çekme işlemi tamamlandı. Toplam ${Object.keys(financialData).length} şirket için veri başarıyla çekildi.`);
  if (errorList.length > 0) {
    console.warn(`${errorList.length} şirket için veri çekilemedi: ${errorList.join(', ')}`);
  }
  
  return financialData;
}

/**
 * Finansal verileri dosyaya kaydeder
 */
function saveFinancialData(data: Record<string, any>, outputPath: string): void {
  const dirPath = path.dirname(outputPath);
  
  // Klasörün var olduğundan emin ol
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Veriyi JSON formatında dosyaya yaz
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

/**
 * Ana fonksiyon
 */
async function main(): Promise<void> {
  try {
    console.log('BIST şirketlerinin finansal verilerini çekme işlemi başlatılıyor...');
    
    // Tüm şirketlerin verilerini çek
    const financialData = await fetchAllCompanyFinancials();
    
    // Verileri dosyaya kaydet
    const outputPath = path.resolve('client/src/data/company-financials.json');
    saveFinancialData(financialData, outputPath);
    
    console.log(`Finansal veriler başarıyla kaydedildi: ${outputPath}`);
  } catch (error) {
    console.error('İşlem sırasında hata oluştu:', error);
    process.exit(1);
  }
}

// Programı çalıştır
if (require.main === module) {
  main().catch(console.error);
}

export { fetchCompanyFinancials, fetchAllCompanyFinancials, saveFinancialData };