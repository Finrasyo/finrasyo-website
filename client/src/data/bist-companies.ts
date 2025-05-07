// Borsa İstanbul'da işlem gören şirketlerin listesi
export const bistCompanies = [
  { code: "AEFES", name: "ANADOLU EFES", fullName: "ANADOLU EFES BİRACILIK VE MALT SANAYİİ A.Ş." },
  { code: "AKBNK", name: "AKBANK", fullName: "AKBANK T.A.Ş." },
  { code: "AKSEN", name: "AKSA ENERJİ", fullName: "AKSA ENERJİ ÜRETİM A.Ş." },
  { code: "ALARK", name: "ALARKO HOLDİNG", fullName: "ALARKO HOLDİNG A.Ş." },
  { code: "ARCLK", name: "ARÇELİK", fullName: "ARÇELİK A.Ş." },
  { code: "ASELS", name: "ASELSAN", fullName: "ASELSAN ELEKTRONİK SANAYİ VE TİCARET A.Ş." },
  { code: "BIMAS", name: "BİM MAĞAZALAR", fullName: "BİM BİRLEŞİK MAĞAZALAR A.Ş." },
  { code: "DOHOL", name: "DOĞAN HOLDİNG", fullName: "DOĞAN ŞİRKETLER GRUBU HOLDİNG A.Ş." },
  { code: "ECILC", name: "EİS ECZACIBAŞI", fullName: "EİS ECZACIBAŞI İLAÇ, SINAİ VE FİNANSAL YATIRIMLAR SANAYİ VE TİCARET A.Ş." },
  { code: "EKGYO", name: "EMLAK KONUT GMYO", fullName: "EMLAK KONUT GAYRİMENKUL YATIRIM ORTAKLIĞI A.Ş." },
  { code: "ENKAI", name: "ENKA İNŞAAT", fullName: "ENKA İNŞAAT VE SANAYİ A.Ş." },
  { code: "EREGL", name: "EREĞLİ DEMİR CELİK", fullName: "EREĞLİ DEMİR VE ÇELİK FABRİKALARI T.A.Ş." },
  { code: "FROTO", name: "FORD OTOSAN", fullName: "FORD OTOMOTİV SANAYİ A.Ş." },
  { code: "GARAN", name: "GARANTİ BANKASI", fullName: "TÜRKİYE GARANTİ BANKASI A.Ş." },
  { code: "HALKB", name: "HALKBANK", fullName: "TÜRKİYE HALK BANKASI A.Ş." },
  { code: "ISCTR", name: "İŞ BANKASI (C)", fullName: "TÜRKİYE İŞ BANKASI A.Ş." },
  { code: "KCHOL", name: "KOÇ HOLDİNG", fullName: "KOÇ HOLDİNG A.Ş." },
  { code: "KOZAL", name: "KOZA ALTIN", fullName: "KOZA ALTIN İŞLETMELERİ A.Ş." },
  { code: "KRDMD", name: "KARDEMİR (D)", fullName: "KARDEMİR KARABÜK DEMİR ÇELİK SANAYİ VE TİCARET A.Ş." },
  { code: "MGROS", name: "MİGROS TİCARET", fullName: "MİGROS TİCARET A.Ş." },
  { code: "OYAKC", name: "OYAK ÇİMENTO", fullName: "OYAK ÇİMENTO FABRİKALARI A.Ş." },
  { code: "PETKM", name: "PETKİM", fullName: "PETKİM PETROKİMYA HOLDİNG A.Ş." },
  { code: "PGSUS", name: "PEGASUS", fullName: "PEGASUS HAVA TAŞIMACILIĞI A.Ş." },
  { code: "SAHOL", name: "SABANCI HOLDİNG", fullName: "HACI ÖMER SABANCI HOLDİNG A.Ş." },
  { code: "SASA", name: "SASA POLYESTER", fullName: "SASA POLYESTER SANAYİ A.Ş." },
  { code: "SISE", name: "ŞİŞE CAM", fullName: "TÜRKİYE ŞİŞE VE CAM FABRİKALARI A.Ş." },
  { code: "TAVHL", name: "TAV HAVALİMANLARI", fullName: "TAV HAVALİMANLARI HOLDİNG A.Ş." },
  { code: "TCELL", name: "TURKCELL", fullName: "TURKCELL İLETİŞİM HİZMETLERİ A.Ş." },
  { code: "THYAO", name: "TÜRK HAVA YOLLARI", fullName: "TÜRK HAVA YOLLARI A.O." },
  { code: "TKFEN", name: "TEKFEN HOLDİNG", fullName: "TEKFEN HOLDİNG A.Ş." },
  { code: "TOASO", name: "TOFAŞ OTO. FAB.", fullName: "TOFAŞ TÜRK OTOMOBİL FABRİKASI A.Ş." },
  { code: "TTKOM", name: "TÜRK TELEKOM", fullName: "TÜRK TELEKOMÜNİKASYON A.Ş." },
  { code: "TUPRS", name: "TÜPRAŞ", fullName: "TÜRKIYE PETROL RAFİNERİLERİ A.Ş." },
  { code: "ULKER", name: "ÜLKER BİSKÜVİ", fullName: "ÜLKER BİSKÜVİ SANAYİ A.Ş." },
  { code: "VAKBN", name: "VAKIFBANK", fullName: "TÜRKİYE VAKIFLAR BANKASI T.A.O." },
  { code: "VESTL", name: "VESTEL", fullName: "VESTEL ELEKTRONİK SANAYİ VE TİCARET A.Ş." },
  { code: "YKBNK", name: "YAPI KREDİ BANKASI", fullName: "YAPI VE KREDİ BANKASI A.Ş." },
  { code: "ZOREN", name: "ZORLU ENERJİ", fullName: "ZORLU ENERJİ ELEKTRİK ÜRETİM A.Ş." },
  // Daha fazla şirket eklenebilir
];

// Sektörlere göre şirketleri gruplandırma (ileriki geliştirmeler için)
export const sectors = [
  { id: 1, name: "Bankacılık" },
  { id: 2, name: "Holding" },
  { id: 3, name: "Otomotiv" },
  { id: 4, name: "Enerji" },
  { id: 5, name: "Telekomünikasyon" },
  { id: 6, name: "Havayolu" },
  { id: 7, name: "Perakende" },
  { id: 8, name: "Demir-Çelik" },
  { id: 9, name: "İnşaat" },
  { id: 10, name: "Kimya" },
  { id: 11, name: "Gıda" },
  { id: 12, name: "Elektronik" }
];

// Şirket arama fonksiyonu
export function searchCompanies(query: string) {
  if (!query || query.trim() === "") {
    return bistCompanies;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return bistCompanies.filter(company => 
    company.code.toLowerCase().includes(normalizedQuery) || 
    company.name.toLowerCase().includes(normalizedQuery) ||
    company.fullName.toLowerCase().includes(normalizedQuery)
  );
}