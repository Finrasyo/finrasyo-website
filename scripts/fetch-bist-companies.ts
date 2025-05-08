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
  
  // BIST'te işlem gören tüm şirketler
  const companies = [
    { code: "A1CAP", name: "A1 Capital Yatırım Menkul Değerler", sector: "Finans" },
    { code: "ACSEL", name: "Acıselsan Acıpayam Selüloz", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "ADEL", name: "Adel Kalemcilik", sector: "Kırtasiye" },
    { code: "ADESE", name: "Adese Alışveriş Merkezleri", sector: "Perakende Ticaret" },
    { code: "AEFES", name: "Anadolu Efes", sector: "Gıda, İçecek ve Tütün" },
    { code: "AFYON", name: "Afyon Çimento", sector: "Çimento ve Beton" },
    { code: "AGHOL", name: "AG Anadolu Grubu Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "AGYO", name: "Atakule Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "AHGAZ", name: "Ahlatcı Doğal Gaz", sector: "Enerji" },
    { code: "AKBNK", name: "Akbank", sector: "Bankacılık" },
    { code: "AKCNS", name: "Akçansa", sector: "Çimento ve Beton" },
    { code: "AKENR", name: "Ak Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "AKFGY", name: "Akfen Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "AKFEN", name: "Akfen Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "AKGRT", name: "Aksigorta", sector: "Sigortacılık" },
    { code: "AKMGY", name: "Akmerkez Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "AKSA", name: "Aksa Akrilik", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "AKSEN", name: "Aksa Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "AKSGY", name: "Akiş Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "AKSUE", name: "Aksu Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "ALARK", name: "Alarko Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "ALBRK", name: "Albaraka Türk", sector: "Bankacılık" },
    { code: "ALCAR", name: "Alarko Carrier", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "ALGYO", name: "Alarko Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "ALKA", name: "Alkim Kağıt", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "ALKIM", name: "Alkim Alkali Kimya", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "ALMAD", name: "Altınyağ Madencilik", sector: "Madencilik" },
    { code: "ANELE", name: "Anel Elektrik", sector: "İnşaat ve Bayındırlık" },
    { code: "ANHYT", name: "Anadolu Hayat Emeklilik", sector: "Sigortacılık" },
    { code: "ANSGR", name: "Anadolu Sigorta", sector: "Sigortacılık" },
    { code: "ARCLK", name: "Arçelik", sector: "Dayanıklı Tüketim Malları" },
    { code: "ARDYZ", name: "Ardıç Bilişim", sector: "Bilişim" },
    { code: "ARENA", name: "Arena Bilgisayar", sector: "Teknoloji" },
    { code: "ARMDA", name: "Armada Bilgisayar", sector: "Teknoloji" },
    { code: "ARSAN", name: "Arsan Tekstil", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "ASELS", name: "Aselsan", sector: "Savunma" },
    { code: "ATLAS", name: "Atlas Yatırım Ortaklığı", sector: "Yatırım Ortaklıkları" },
    { code: "ATSYH", name: "Atlantis Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "AVISA", name: "Avivasa Emeklilik ve Hayat", sector: "Sigortacılık" },
    { code: "AVOD", name: "A.V.O.D. Kurutulmuş Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "AYDEM", name: "Aydem Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "AYEN", name: "Ayen Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "AYGAZ", name: "Aygaz", sector: "Enerji" },
    { code: "BAGFS", name: "Bagfaş", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "BAKAB", name: "Bak Ambalaj", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "BANVT", name: "Banvit", sector: "Gıda, İçecek ve Tütün" },
    { code: "BASCM", name: "Baştaş Başkent Çimento", sector: "Çimento ve Beton" },
    { code: "BERA", name: "Bera Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "BEYAZ", name: "Beyaz Filo", sector: "Ulaştırma ve Haberleşme" },
    { code: "BIMAS", name: "BİM Birleşik Mağazalar", sector: "Perakende Ticaret" },
    { code: "BIZIM", name: "Bizim Toptan", sector: "Perakende Ticaret" },
    { code: "BJKAS", name: "Beşiktaş Futbol Yatırımları", sector: "Spor" },
    { code: "BLCYT", name: "Bilici Yatırım", sector: "Holding ve Yatırım Şirketleri" },
    { code: "BMSCH", name: "BMS Çelik Hasır", sector: "Metal Ana Sanayi" },
    { code: "BNTAS", name: "Bantaş Ambalaj", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "BOSSA", name: "Bossa", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "BRISA", name: "Brisa", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "BRKSN", name: "Berkosan Yalıtım", sector: "İnşaat ve Bayındırlık" },
    { code: "BRMEN", name: "Birlik Mensucat", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "BSKYO", name: "Başkent Yatırım Ortaklığı", sector: "Yatırım Ortaklıkları" },
    { code: "BTCIM", name: "Batıçim Batı Anadolu Çimento", sector: "Çimento ve Beton" },
    { code: "BUCIM", name: "Bursa Çimento", sector: "Çimento ve Beton" },
    { code: "BURCE", name: "Burçelik", sector: "Metal Ana Sanayi" },
    { code: "BURVA", name: "Burçelik Vana", sector: "Metal Ana Sanayi" },
    { code: "CCOLA", name: "Coca-Cola İçecek", sector: "Gıda, İçecek ve Tütün" },
    { code: "CELHA", name: "Çelik Halat", sector: "Metal Ana Sanayi" },
    { code: "CEMAS", name: "Çemaş Döküm", sector: "Metal Ana Sanayi" },
    { code: "CEMTS", name: "Çemtaş", sector: "Metal Ana Sanayi" },
    { code: "CEOEM", name: "CEO Event Medya", sector: "Medya" },
    { code: "CIMSA", name: "Çimsa", sector: "Çimento ve Beton" },
    { code: "CLEBI", name: "Çelebi Hava Servisi", sector: "Ulaştırma ve Haberleşme" },
    { code: "COSMO", name: "Cosmos Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "CRDFA", name: "Creditwest Faktoring", sector: "Finansal Kiralama ve Faktoring" },
    { code: "DAGHL", name: "Dagi Giyim", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "DARDL", name: "Dardanel", sector: "Gıda, İçecek ve Tütün" },
    { code: "DENGE", name: "Denge Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "DESA", name: "Desa Deri", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "DESPC", name: "Despec Bilgisayar", sector: "Teknoloji" },
    { code: "DEVA", name: "Deva Holding", sector: "Sağlık" },
    { code: "DGATE", name: "Datagate Bilgisayar", sector: "Teknoloji" },
    { code: "DGGYO", name: "Doğuş Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "DIRIT", name: "Diriteks Diriliş Tekstil", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "DITAS", name: "Ditaş Doğan", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "DMSAS", name: "Demisaş Döküm", sector: "Metal Ana Sanayi" },
    { code: "DOAS", name: "Doğuş Otomotiv", sector: "Otomotiv" },
    { code: "DOBUR", name: "Doğan Burda", sector: "Medya" },
    { code: "DOCO", name: "DO & CO Aktiengesellschaft", sector: "Turizm" },
    { code: "DOHOL", name: "Doğan Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "DOKTA", name: "Döktaş Dökümcülük", sector: "Metal Ana Sanayi" },
    { code: "DURDO", name: "Duran Doğan Basım", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "DYOBY", name: "Dyo Boya", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "ECILC", name: "EİS Eczacıbaşı İlaç", sector: "Sağlık" },
    { code: "ECZYT", name: "Eczacıbaşı Yatırım", sector: "Holding ve Yatırım Şirketleri" },
    { code: "EDIP", name: "Edip Gayrimenkul", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "EGCYO", name: "Egeli & Co Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "EGEEN", name: "Ege Endüstri", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "EGGUB", name: "Ege Gübre", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "EGPRO", name: "Ege Profil", sector: "İnşaat ve Bayındırlık" },
    { code: "EGSER", name: "Ege Seramik", sector: "Cam ve Seramik" },
    { code: "EKGYO", name: "Emlak Konut GYO", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "EKIZ", name: "Ekiz Kimya", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "ENKAI", name: "Enka İnşaat", sector: "İnşaat ve Bayındırlık" },
    { code: "ERBOS", name: "Erbosan", sector: "Metal Ana Sanayi" },
    { code: "EREGL", name: "Ereğli Demir Çelik", sector: "Metal Ana Sanayi" },
    { code: "ERSU", name: "Ersu Meyve ve Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "ESCOM", name: "Escort Teknoloji", sector: "Teknoloji" },
    { code: "ETILR", name: "Etiler Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "ETYAT", name: "Euro Trend Yatırım Ortaklığı", sector: "Yatırım Ortaklıkları" },
    { code: "EUHOL", name: "Euro Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "EUPWR", name: "Europower Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "FENER", name: "Fenerbahçe Futbol", sector: "Spor" },
    { code: "FLAP", name: "Flap Kongre Toplantı Hizmetleri", sector: "Turizm" },
    { code: "FMIZP", name: "Federal-Mogul İzmit Piston", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "FONET", name: "Fonet Bilgi Teknolojileri", sector: "Bilişim" },
    { code: "FORMT", name: "Format Matbaacılık", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "FRIGO", name: "Frigo-Pak Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "FROTO", name: "Ford Otosan", sector: "Otomotiv" },
    { code: "GARAN", name: "Garanti Bankası", sector: "Bankacılık" },
    { code: "GARFA", name: "Garanti Faktoring", sector: "Finansal Kiralama ve Faktoring" },
    { code: "GEDIK", name: "Gedik Yatırım", sector: "Finans" },
    { code: "GEDZA", name: "Gediz Ambalaj", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "GLRYH", name: "Güler Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "GLYHO", name: "Global Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "GOLTS", name: "Göltaş Çimento", sector: "Çimento ve Beton" },
    { code: "GOODY", name: "Goodyear", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "GOZDE", name: "Gözde Girişim", sector: "Holding ve Yatırım Şirketleri" },
    { code: "GRNYO", name: "Garanti Yatırım Ortaklığı", sector: "Yatırım Ortaklıkları" },
    { code: "GSDDE", name: "GSD Denizcilik", sector: "Ulaştırma ve Haberleşme" },
    { code: "GSDHO", name: "GSD Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "GSRAY", name: "Galatasaray Sportif", sector: "Spor" },
    { code: "GUBRF", name: "Gübre Fabrikaları", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "GUSGR", name: "Güneş Sigorta", sector: "Sigortacılık" },
    { code: "HALKB", name: "Halk Bankası", sector: "Bankacılık" },
    { code: "HATEK", name: "Hateks Hatay Tekstil", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "HEKTS", name: "Hektaş", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "HLGYO", name: "Halk Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "HUBVC", name: "Hub Girişim Sermayesi", sector: "Holding ve Yatırım Şirketleri" },
    { code: "HURGZ", name: "Hürriyet Gazetecilik", sector: "Medya" },
    { code: "ICBCT", name: "ICBC Turkey Bank", sector: "Bankacılık" },
    { code: "IDEAS", name: "İdealist Danışmanlık", sector: "Bilişim" },
    { code: "IDGYO", name: "İdealist Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "IHEVA", name: "İhlas Ev Aletleri", sector: "Dayanıklı Tüketim Malları" },
    { code: "IHGZT", name: "İhlas Gazetecilik", sector: "Medya" },
    { code: "IHLAS", name: "İhlas Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "IHYAY", name: "İhlas Yayın Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "IMASM", name: "İmaş Makine", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "INDES", name: "İndeks Bilgisayar", sector: "Teknoloji" },
    { code: "INFO", name: "İnfo Yatırım", sector: "Finans" },
    { code: "INTEM", name: "İntema", sector: "Ticaret" },
    { code: "IPEKE", name: "İpek Doğal Enerji", sector: "Madencilik" },
    { code: "ISCTR", name: "İş Bankası (C)", sector: "Bankacılık" },
    { code: "ISFIN", name: "İş Finansal Kiralama", sector: "Finansal Kiralama ve Faktoring" },
    { code: "ISGSY", name: "İş Girişim Sermayesi", sector: "Holding ve Yatırım Şirketleri" },
    { code: "ISGYO", name: "İş Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "ISYAT", name: "İş Yatırım Ortaklığı", sector: "Yatırım Ortaklıkları" },
    { code: "ITTFH", name: "İttifak Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "IZFAS", name: "İzmir Fırça", sector: "Mobilya" },
    { code: "IZOCM", name: "İzocam", sector: "İnşaat ve Bayındırlık" },
    { code: "JANTS", name: "Jantsa Jant", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "KAPLM", name: "Kaplamin Ambalaj", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "KAREL", name: "Karel Elektronik", sector: "Bilişim" },
    { code: "KARSN", name: "Karsan Otomotiv", sector: "Otomotiv" },
    { code: "KARTN", name: "Kartonsan", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "KATMR", name: "Katmerciler Ekipman", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "KAYSE", name: "Kayseri Şeker Fabrikası", sector: "Gıda, İçecek ve Tütün" },
    { code: "KCAER", name: "Kuştur Club Aytur", sector: "Turizm" },
    { code: "KCHOL", name: "Koç Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "KENT", name: "Kent Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "KERVN", name: "Kervan Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "KERVT", name: "Kerevitaş Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "KFEIN", name: "Kafein Yazılım", sector: "Bilişim" },
    { code: "KLMSN", name: "Klimasan Klima", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "KLNMA", name: "Türkiye Kalkınma ve Yatırım Bankası", sector: "Bankacılık" },
    { code: "KNFRT", name: "Konfrut Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "KONYA", name: "Konya Çimento", sector: "Çimento ve Beton" },
    { code: "KORDS", name: "Kordsa Teknik Tekstil", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "KORTS", name: "Koroplast Temizlik Ambalaj", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "KPHOL", name: "Kapital Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "KRDMA", name: "Kardemir (A)", sector: "Metal Ana Sanayi" },
    { code: "KRDMB", name: "Kardemir (B)", sector: "Metal Ana Sanayi" },
    { code: "KRDMD", name: "Kardemir (D)", sector: "Metal Ana Sanayi" },
    { code: "KRONT", name: "Kron Telekomünikasyon", sector: "Bilişim" },
    { code: "KRSTL", name: "Kristal Kola", sector: "Gıda, İçecek ve Tütün" },
    { code: "KSTUR", name: "Kuştur Kuşadası Turizm", sector: "Turizm" },
    { code: "KUTPO", name: "Kütahya Porselen", sector: "Cam ve Seramik" },
    { code: "KUYAS", name: "Kuyas Yatırım", sector: "Holding ve Yatırım Şirketleri" },
    { code: "LIDFA", name: "Lider Faktoring", sector: "Finansal Kiralama ve Faktoring" },
    { code: "LINK", name: "Link Bilgisayar", sector: "Bilişim" },
    { code: "LKMNH", name: "Lokman Hekim Engürüsağ", sector: "Sağlık" },
    { code: "LOGO", name: "Logo Yazılım", sector: "Bilişim" },
    { code: "LUKSK", name: "Lüks Kadife", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "MAALT", name: "Marmaris Altınyunus", sector: "Turizm" },
    { code: "MAKTK", name: "Makina Takım", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "MANAS", name: "Manisa Fırça", sector: "Mobilya" },
    { code: "MARKA", name: "Marka Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "MARTI", name: "Martı Otel", sector: "Turizm" },
    { code: "MAVI", name: "Mavi Giyim", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "MEMSA", name: "Mensa", sector: "İnşaat ve Bayındırlık" },
    { code: "MEPET", name: "Mepet Metro Petrol", sector: "Toptan ve Perakende Ticaret" },
    { code: "MERCN", name: "Mercan Kimya", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "MERIT", name: "Merit Turizm", sector: "Turizm" },
    { code: "MERKO", name: "Merko Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "METRO", name: "Metro Ticari ve Mali Yatırımlar", sector: "Holding ve Yatırım Şirketleri" },
    { code: "METUR", name: "Metemtur Otelcilik", sector: "Turizm" },
    { code: "MGROS", name: "Migros Ticaret", sector: "Perakende Ticaret" },
    { code: "MIPAZ", name: "Milpa", sector: "İnşaat ve Bayındırlık" },
    { code: "MMCAS", name: "MMC Sanayi", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "MNDRS", name: "Menderes Tekstil", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "MPARK", name: "MLP Sağlık", sector: "Sağlık" },
    { code: "MRGYO", name: "Martı Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "MRSHL", name: "Marshall Boya", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "MSGYO", name: "Mistral Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "MTRKS", name: "Metriks Bilgisayar", sector: "Bilişim" },
    { code: "MTRYO", name: "Metro Yatırım Ortaklığı", sector: "Yatırım Ortaklıkları" },
    { code: "MZHLD", name: "Mazhar Zorlu Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "NATEN", name: "Naturel Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "NETAS", name: "Netaş Telekomünikasyon", sector: "Telekomünikasyon" },
    { code: "NIBAS", name: "Niğbaş Niğde Beton", sector: "İnşaat ve Bayındırlık" },
    { code: "NTHOL", name: "Net Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "NUGYO", name: "Nurol Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "NUHCM", name: "Nuh Çimento", sector: "Çimento ve Beton" },
    { code: "ODAS", name: "Odaş Elektrik", sector: "Elektrik, Gaz ve Su" },
    { code: "OLMIP", name: "Olmuksan International Paper", sector: "Kağıt ve Kağıt Ürünleri" },
    { code: "ORCAY", name: "Orçay Ortaköy Çay", sector: "Gıda, İçecek ve Tütün" },
    { code: "ORGE", name: "Orge Enerji Elektrik", sector: "İnşaat ve Bayındırlık" },
    { code: "ORMA", name: "Orma Orman Mahsulleri", sector: "Mobilya" },
    { code: "OSMEN", name: "Osmanlı Yatırım", sector: "Finans" },
    { code: "OSTIM", name: "Ostim Endüstriyel Yatırımlar", sector: "Holding ve Yatırım Şirketleri" },
    { code: "OTKAR", name: "Otokar", sector: "Otomotiv" },
    { code: "OYAKC", name: "Oyak Çimento", sector: "Çimento ve Beton" },
    { code: "OYAYO", name: "Oyak Yatırım Ortaklığı", sector: "Yatırım Ortaklıkları" },
    { code: "OYLUM", name: "Oylum Sınai Yatırımlar", sector: "Gıda, İçecek ve Tütün" },
    { code: "OZBAL", name: "Özbal Çelik Boru", sector: "Metal Ana Sanayi" },
    { code: "OZGYO", name: "Özderici Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "OZKGY", name: "Özak Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "PAGYO", name: "Panora Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "PAMEL", name: "Pamel Yenilenebilir Elektrik", sector: "Elektrik, Gaz ve Su" },
    { code: "PAPIL", name: "Papilon Savunma", sector: "Savunma" },
    { code: "PARSN", name: "Parsan", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "PEGYO", name: "Pera Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "PEKGY", name: "Peker Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "PENTA", name: "Penta Teknoloji", sector: "Teknoloji" },
    { code: "PETUN", name: "Pınar Et ve Un", sector: "Gıda, İçecek ve Tütün" },
    { code: "PETKM", name: "Petkim", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "PINSU", name: "Pınar Su", sector: "Gıda, İçecek ve Tütün" },
    { code: "PKART", name: "Plastikkart", sector: "Bilişim" },
    { code: "PKENT", name: "Petrokent Turizm", sector: "Turizm" },
    { code: "PGSUS", name: "Pegasus", sector: "Ulaştırma ve Haberleşme" },
    { code: "PNSUT", name: "Pınar Süt", sector: "Gıda, İçecek ve Tütün" },
    { code: "POLHO", name: "Polisan Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "POLTK", name: "Politeknik Metal", sector: "Metal Ana Sanayi" },
    { code: "PRKAB", name: "Türk Prysmian Kablo", sector: "Metal Ana Sanayi" },
    { code: "PRZMA", name: "Prizma Grup", sector: "Holding ve Yatırım Şirketleri" },
    { code: "PSDTC", name: "Pergamon Dış Ticaret", sector: "Toptan ve Perakende Ticaret" },
    { code: "PSDTC", name: "Pergamon Dış Ticaret", sector: "Toptan ve Perakende Ticaret" },
    { code: "QNBFL", name: "QNB Finans Finansal Kiralama", sector: "Finansal Kiralama ve Faktoring" },
    { code: "QNBFB", name: "QNB Finansbank", sector: "Bankacılık" },
    { code: "QUAGR", name: "QUA Granite", sector: "Cam ve Seramik" },
    { code: "RALYH", name: "Ralyh Girişim Sermayesi", sector: "Holding ve Yatırım Şirketleri" },
    { code: "RAYSG", name: "Ray Sigorta", sector: "Sigortacılık" },
    { code: "RNPOL", name: "Reysaş Taşımacılık", sector: "Ulaştırma ve Haberleşme" },
    { code: "RODRG", name: "Rodrigo Tekstil", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "ROYAL", name: "Royal Halı", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "RTALB", name: "RTA Laboratuvarları", sector: "Sağlık" },
    { code: "RYGYO", name: "Reysaş Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "RYSAS", name: "Reysaş Taşımacılık", sector: "Ulaştırma ve Haberleşme" },
    { code: "SAFKR", name: "Şafkar Endüstri", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "SAHOL", name: "Sabancı Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "SALIX", name: "Salix Yatırım Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "SANFM", name: "Sanifoam Sünger", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "SANKO", name: "Sanko Pazarlama", sector: "Ticaret" },
    { code: "SARKY", name: "Sarkuysan", sector: "Metal Ana Sanayi" },
    { code: "SASA", name: "Sasa Polyester", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "SAYAS", name: "Say Reklamcılık", sector: "Medya" },
    { code: "SEKFK", name: "Şeker Finansal Kiralama", sector: "Finansal Kiralama ve Faktoring" },
    { code: "SEKUR", name: "Sekuro Plastik", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "SELEC", name: "Selçuk Ecza Deposu", sector: "Sağlık" },
    { code: "SELGD", name: "Selçuk Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "SERVE", name: "Serve Film Prodüksiyon", sector: "Medya" },
    { code: "SEYKM", name: "Seymur Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "SILVR", name: "Silverline Endüstri", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "SISE", name: "Şişe Cam", sector: "Cam ve Seramik" },
    { code: "SKBNK", name: "Şekerbank", sector: "Bankacılık" },
    { code: "SMART", name: "Smartiks Yazılım", sector: "Bilişim" },
    { code: "SNGYO", name: "Sinpaş Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "SNICA", name: "Sönmez Çimento", sector: "Çimento ve Beton" },
    { code: "SNKRN", name: "Senkron Güvenlik", sector: "Bilişim" },
    { code: "SODSN", name: "Sodaş Sodyum", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "SOKM", name: "Şok Marketler", sector: "Perakende Ticaret" },
    { code: "SONME", name: "Sönmez Filament", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "SOKE", name: "Söke Değirmencilik", sector: "Gıda, İçecek ve Tütün" },
    { code: "TACTR", name: "TAÇ Tarım Ürünleri", sector: "Gıda, İçecek ve Tütün" },
    { code: "TATGD", name: "Tat Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "TAVHL", name: "TAV Havalimanları", sector: "Ulaştırma ve Haberleşme" },
    { code: "TBORG", name: "Türk Tuborg", sector: "Gıda, İçecek ve Tütün" },
    { code: "TCELL", name: "Turkcell", sector: "Telekomünikasyon" },
    { code: "TDGYO", name: "Trend Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "TEKTU", name: "Tek-Art Turizm", sector: "Turizm" },
    { code: "TGSAS", name: "TGS Dış Ticaret", sector: "Toptan ve Perakende Ticaret" },
    { code: "THYAO", name: "Türk Hava Yolları", sector: "Ulaştırma ve Haberleşme" },
    { code: "TKFEN", name: "Tekfen Holding", sector: "Holding ve Yatırım Şirketleri" },
    { code: "TKNSA", name: "Teknosa İç ve Dış Ticaret", sector: "Perakende Ticaret" },
    { code: "TLMAN", name: "Trabzon Liman", sector: "Ulaştırma ve Haberleşme" },
    { code: "TMPOL", name: "Temapol Polimer Plastik", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "TMSN", name: "Tümosan Motor ve Traktör", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "TNZTP", name: "Tanaz Tekstil", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "TOASO", name: "Tofaş Oto Fabrika", sector: "Otomotiv" },
    { code: "TRGYO", name: "Torunlar Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "TSKB", name: "Türkiye Sınai Kalkınma Bankası", sector: "Bankacılık" },
    { code: "TSPOR", name: "Trabzonspor Sportif", sector: "Spor" },
    { code: "TTKOM", name: "Türk Telekom", sector: "Telekomünikasyon" },
    { code: "TTRAK", name: "Türk Traktör", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "TUCLK", name: "Tuğçelik", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "TUKAS", name: "Tukaş", sector: "Gıda, İçecek ve Tütün" },
    { code: "TUPRS", name: "Tüpraş", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "TURGG", name: "Türker Proje", sector: "İnşaat ve Bayındırlık" },
    { code: "UFUK", name: "Ufuk Yatırım", sector: "Holding ve Yatırım Şirketleri" },
    { code: "ULAS", name: "Ulaşlar Turizm", sector: "Turizm" },
    { code: "ULKER", name: "Ülker Bisküvi", sector: "Gıda, İçecek ve Tütün" },
    { code: "ULUFA", name: "Ulusoy Un", sector: "Gıda, İçecek ve Tütün" },
    { code: "ULUSE", name: "Ulusoy Elektrik", sector: "Metal Eşya, Makine ve Gereç Yapım" },
    { code: "UNJSA", name: "Ünyes Sağlık Hizmetleri", sector: "Sağlık" },
    { code: "UNLU", name: "Ünlü & Co", sector: "Finans" },
    { code: "UNYEC", name: "Ünye Çimento", sector: "Çimento ve Beton" },
    { code: "USAK", name: "Uşak Seramik", sector: "Cam ve Seramik" },
    { code: "UTPYA", name: "Utopya Turizm", sector: "Turizm" },
    { code: "UZERB", name: "Uzertaş Boya", sector: "Kimya, Petrol, Kauçuk ve Plastik Ürünler" },
    { code: "VAKBN", name: "Vakıfbank", sector: "Bankacılık" },
    { code: "VAKFN", name: "Vakıf Finansal Kiralama", sector: "Finansal Kiralama ve Faktoring" },
    { code: "VAKKO", name: "Vakko Tekstil", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "VANGD", name: "Vanet Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "VERTU", name: "Verusaturk Girişim Sermayesi", sector: "Holding ve Yatırım Şirketleri" },
    { code: "VESBE", name: "Vestel Beyaz Eşya", sector: "Dayanıklı Tüketim Malları" },
    { code: "VESTL", name: "Vestel", sector: "Dayanıklı Tüketim Malları" },
    { code: "VKFYO", name: "Vakıf Menkul Kıymet Yatırım Ortaklığı", sector: "Yatırım Ortaklıkları" },
    { code: "VKGYO", name: "Vakıf Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "YATAS", name: "Yataş", sector: "Mobilya" },
    { code: "YAYLA", name: "Yayla Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "YGGYO", name: "Yeni Gimat Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "YGYO", name: "Yesil Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" },
    { code: "YKBNK", name: "Yapı ve Kredi Bankası", sector: "Bankacılık" },
    { code: "YONGA", name: "Yonga Mobilya", sector: "Mobilya" },
    { code: "YUNSA", name: "Yünsa", sector: "Tekstil, Giyim Eşyası ve Deri" },
    { code: "YYAPI", name: "Yeşil Yapı", sector: "İnşaat ve Bayındırlık" },
    { code: "YYLGD", name: "Yayla Agro Gıda", sector: "Gıda, İçecek ve Tütün" },
    { code: "ZOREN", name: "Zorlu Enerji", sector: "Elektrik, Gaz ve Su" },
    { code: "ZRGYO", name: "Ziraat Gayrimenkul Yatırım Ortaklığı", sector: "Gayrimenkul Yatırım Ortaklığı" }
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