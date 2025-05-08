import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// Debug fonksiyonu
function saveHtmlToFile(html: string) {
  fs.writeFileSync('debug-output.html', html);
  console.log('HTML içeriği debug-output.html dosyasına kaydedildi');
}

// Şirketleri çekme fonksiyonu
async function fetchBistCompanies() {
  try {
    console.log('Finans.mynet.com adresinden BIST şirketleri çekiliyor...');
    const response = await axios.get('https://finans.mynet.com/borsa/hisseler/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // HTML içeriğini dosyaya kaydet (debug için)
    saveHtmlToFile(response.data);

    const $ = cheerio.load(response.data);
    const companies: { code: string; name: string; sector: string }[] = [];

    // Tüm tabloları kontrol et
    $('table').each((_, table) => {
      console.log('Tablo bulundu');
      
      $(table).find('tr').each((index, row) => {
        if (index === 0) return; // Başlık satırını atla
        
        const columns = $(row).find('td');
        if (columns.length >= 2) {
          const code = $(columns[0]).text().trim();
          const name = $(columns[1]).text().trim();
          const sector = ''; // Sektör bilgisi şimdilik boş
          
          if (code && name) {
            console.log(`Şirket bulundu: ${code} - ${name}`);
            companies.push({ code, name, sector });
          }
        }
      });
    });

    // Eğer tablo içinde bulamazsak, diğer olası yapıları deneyelim
    if (companies.length === 0) {
      console.log('Tabloda şirket bulunamadı, alternatif seçiciler deneniyor...');
      
      // Tüm linkleri kontrol et, Borsa kodları genellikle büyük harfle yazılır
      $('a').each((_, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href') || '';
        
        // Hisse detay sayfasına giden linkler genellikle hisse kodunu içerir
        if (text.length > 0 && text.length <= 5 && text === text.toUpperCase() && href.includes('/borsa/hisseler/')) {
          // Eğer şirket adını bulamazsak en azından kodunu kaydedelim
          companies.push({ 
            code: text, 
            name: text, // Geçici olarak kod ile aynı
            sector: '' 
          });
          console.log(`Link tabanlı şirket bulundu: ${text}`);
        }
      });
    }

    console.log(`Toplam ${companies.length} şirket bulundu.`);

    if (companies.length === 0) {
      console.error('Şirket listesi boş! HTML yapısı beklenenden farklı.');
      
      // Şirketleri manuel olarak ekleyelim
      return manualCompanyList();
    }

    // Şirketleri alphabetik sıraya göre sırala
    companies.sort((a, b) => a.name.localeCompare(b.name));

    return companies;
  } catch (error) {
    console.error('Şirketleri çekerken hata oluştu:', error);
    console.log('Manuel şirket listesi kullanılıyor...');
    return manualCompanyList();
  }
}

// Web kazıması başarısız olursa manuel bir liste sağlayalım
function manualCompanyList() {
  console.log('Manuel şirket listesi oluşturuluyor');
  
  // BIST'te işlem gören popüler şirketlerden bir kısmı
  const companies = [
    { code: "ACSEL", name: "Acıselsan Acıpayam Selüloz", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "ADEL", name: "Adel Kalemcilik", sector: "Kırtasiye" },
    { code: "AEFES", name: "Anadolu Efes", sector: "Gıda, İçecek ve Tütün" },
    { code: "AFYON", name: "Afyon Çimento", sector: "Çimento ve Beton" },
    { code: "AKBNK", name: "Akbank", sector: "Bankacılık" },
    { code: "AKSA", name: "Aksa Akrilik", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "AKSEN", name: "Aksa Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "ALARK", name: "Alarko Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "ARCLK", name: "Arçelik", sector: "Dayanıklı Tüketim Malları" },
    { code: "ASELS", name: "Aselsan", sector: "Savunma" },
    { code: "AYGAZ", name: "Aygaz", sector: "Enerji" },
    { code: "BAGFS", name: "Bagfaş", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "BIMAS", name: "BİM Birleşik Mağazalar", sector: "Perakende Ticaret" },
    { code: "DOHOL", name: "Doğan Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "EGEEN", name: "Ege Endüstri", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "EKGYO", name: "Emlak Konut GYO", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "ENKAI", name: "Enka İnşaat", sector: "İnşaat ve Bayındırlık" },
    { code: "EREGL", name: "Ereğli Demir Çelik", sector: "Metal Ana Sanayi" },
    { code: "FROTO", name: "Ford Otosan", sector: "Otomotiv" },
    { code: "GARAN", name: "Garanti Bankası", sector: "Bankacılık" },
    { code: "GUBRF", name: "Gübre Fabrikaları", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "HEKTS", name: "Hektaş", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "ISCTR", name: "İş Bankası (C)", sector: "Bankacılık" },
    { code: "ISFIN", name: "İş Finansal Kiralama", sector: "Finansal Kiralama ve Faktoring" },
    { code: "ISGYO", name: "İş Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "KCHOL", name: "Koç Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "KRDMD", name: "Kardemir (D)", sector: "Metal Ana Sanayi" },
    { code: "MGROS", name: "Migros Ticaret", sector: "Perakende Ticaret" },
    { code: "NETAS", name: "Netaş Telekomünikasyon", sector: "Telekomünikasyon" },
    { code: "PETKM", name: "Petkim", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "PGSUS", name: "Pegasus", sector: "Ulaştırma ve Haberleşme" },
    { code: "SAHOL", name: "Sabancı Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "SASA", name: "Sasa Polyester", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "SISE", name: "Şişe Cam", sector: "Cam ve Seramik" },
    { code: "TAVHL", name: "TAV Havalimanları", sector: "Ulaştırma ve Haberleşme" },
    { code: "TCELL", name: "Turkcell", sector: "Telekomünikasyon" },
    { code: "THYAO", name: "Türk Hava Yolları", sector: "Ulaştırma ve Haberleşme" },
    { code: "TOASO", name: "Tofaş Oto", sector: "Otomotiv" },
    { code: "TRKCM", name: "Trakya Cam", sector: "Cam ve Seramik" },
    { code: "TUPRS", name: "Tüpraş", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "ULKER", name: "Ülker Bisküvi", sector: "Gıda, İçecek ve Tütün" },
    { code: "VAKBN", name: "Vakıfbank", sector: "Bankacılık" },
    { code: "VESTL", name: "Vestel", sector: "Dayanıklı Tüketim Malları" },
    { code: "YKBNK", name: "Yapı ve Kredi Bankası", sector: "Bankacılık" },
    { code: "ZOREN", name: "Zorlu Enerji", sector: "Elektrik, Gaz ve Su" }
  ];
  
  return companies;
}

// Ana fonksiyon
async function main() {
  const companies = await fetchBistCompanies();
  
  if (companies.length === 0) {
    console.error('Hata: Şirket verisi alınamadı!');
    process.exit(1);
  }

  // Sektör listesini oluştur
  const sectors = [...new Set(companies.filter(c => c.sector).map(c => c.sector))].sort();
  
  // Veriyi TS dosyası formatına dönüştür
  const fileContent = `
// Bu dosya otomatik olarak scripts/fetch-bist-companies.ts tarafından oluşturulmuştur
// finans.mynet.com adresinden alınan veriler ile oluşturulmuştur

export const bistCompanies = ${JSON.stringify(companies, null, 2)};

export const sectors = ${JSON.stringify(sectors, null, 2)};

// Şirket arama fonksiyonu
export function searchCompanies(query: string) {
  if (!query || query.trim() === '') return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return bistCompanies.filter(company => 
    company.name.toLowerCase().includes(normalizedQuery) || 
    company.code.toLowerCase().includes(normalizedQuery)
  );
}
`;

  // Dosyayı yaz
  const outputPath = path.resolve('client/src/data/bist-companies.ts');
  fs.writeFileSync(outputPath, fileContent);
  console.log(`Şirket verileri başarıyla yazıldı: ${outputPath}`);
}

// Scripti çalıştır
main().catch(error => {
  console.error('Script çalıştırılırken hata oluştu:', error);
  process.exit(1);
});