import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useFinancialData } from "@/hooks/use-financial-data";
import MultiCompanySelectorWithAutocomplete from "@/components/financial/multi-company-selector-with-autocomplete";
import YearSelector from "@/components/financial/year-selector";
import { bistCompanies } from "@/data/bist-companies";
import { ArrowRight } from "lucide-react";

// Mevcut finansal oranların listesi - Çıkarılan oranlar:
// Stok Devir Hızı, Varlık Devir Hızı, Faiz Karşılama Oranı, Temettü Verimi, Alacak Devir Hızı
const financialRatios = [
  { id: "currentRatio", name: "Cari Oran", description: "Şirketin kısa vadeli borçlarını ödeme kabiliyetini ölçer" },
  { id: "quickRatio", name: "Asit-Test Oranı", description: "Şirketin stoklarını hariç tutarak kısa vadeli borçlarını ödeme kabiliyetini ölçer" },
  { id: "cashRatio", name: "Nakit Oranı", description: "Şirketin sadece nakit ve nakit benzerlerini kullanarak kısa vadeli borçlarını ödeme kabiliyetini ölçer" },
  { id: "debtToAssetRatio", name: "Borç/Varlık Oranı", description: "Şirketin varlıklarının ne kadarının borçlanma ile finanse edildiğini gösterir" },
  { id: "debtToEquityRatio", name: "Borç/Özsermaye Oranı", description: "Şirketin borçlanma seviyesini özsermayesiyle karşılaştırır" },
  { id: "financialLeverageRatio", name: "Finansal Kaldıraç Oranı", description: "Şirketin toplam varlıklarının özsermayesine oranını gösterir" },
  { id: "grossProfitMargin", name: "Brüt Kar Marjı", description: "Satışların maliyeti düşüldükten sonra kalan kar marjını gösterir" },
  { id: "operatingProfitMargin", name: "Faaliyet Kar Marjı", description: "Faaliyet giderleri düşüldükten sonra kalan kar marjını gösterir" },
  { id: "netProfitMargin", name: "Net Kar Marjı", description: "Tüm giderler düşüldükten sonra kalan kar marjını gösterir" },
  { id: "returnOnAssets", name: "Aktif Karlılık (ROA)", description: "Şirketin varlıklarının ne kadar karlı kullanıldığını gösterir" },
  { id: "returnOnEquity", name: "Özsermaye Karlılığı (ROE)", description: "Şirketin özsermayesinin ne kadar karlı kullanıldığını gösterir" },
  { id: "payablesTurnover", name: "Borç Devir Hızı", description: "Şirketin kısa vadeli borçlarını ödeme hızını gösterir" }
];

// Çıktı formatları
const outputFormats = [
  { id: "pdf", name: "PDF", icon: "📄" },
  { id: "excel", name: "Excel", icon: "📊" },
  { id: "csv", name: "CSV", icon: "📑" }
];

export default function AnalysisWizard() {
  const [step, setStep] = useState(1);
  const [selectedCompanies, setSelectedCompanies] = useState<any[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedRatios, setSelectedRatios] = useState<string[]>(financialRatios.map(r => r.id));
  const [price, setPrice] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Fiyat hesaplama
  useEffect(() => {
    // Temel fiyatı hesapla: Şirket sayısı x Dönem sayısı x Oran sayısı x 0.25₺
    const basePrice = selectedCompanies.length * selectedYears.length * selectedRatios.length * 0.25;
    
    // Kuruş hassasiyetinde fiyatı 2 ondalık basamakla göster
    setPrice(parseFloat(basePrice.toFixed(2)));
  }, [selectedCompanies, selectedYears, selectedRatios]);

  // Şirket seçimi
  const handleCompanySelection = (companies: any[]) => {
    setSelectedCompanies(companies);
  };

  // Dönem (yıl) seçimi değiştiğinde
  const handleYearChange = (year: string) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  // Finansal oran seçimi değiştiğinde
  const handleRatioChange = (ratioId: string) => {
    if (selectedRatios.includes(ratioId)) {
      setSelectedRatios(selectedRatios.filter(r => r !== ratioId));
    } else {
      setSelectedRatios([...selectedRatios, ratioId]);
    }
  };

  // Tüm oranları seç/kaldır
  const handleSelectAllRatios = () => {
    if (selectedRatios.length === financialRatios.length) {
      setSelectedRatios([]);
    } else {
      setSelectedRatios(financialRatios.map(r => r.id));
    }
  };
  
  // İleri butonuna tıklandığında
  const handleNext = () => {
    if (step === 1 && selectedCompanies.length === 0) {
      toast({
        title: "Şirket Seçilmedi",
        description: "Lütfen en az bir şirket seçin.",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && selectedYears.length === 0) {
      toast({
        title: "Dönem Seçilmedi",
        description: "Lütfen en az bir dönem seçin.",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 3 && selectedRatios.length === 0) {
      toast({
        title: "Oran Seçilmedi",
        description: "Lütfen en az bir finansal oran seçin.",
        variant: "destructive"
      });
      return;
    }
    
    setStep(prevStep => prevStep + 1);
  };
  
  // Geri butonuna tıklandığında
  const handleBack = () => {
    setStep(prevStep => prevStep - 1);
  };
  
  // Ödeme işlemini başlat
  const handleProceedToPayment = async () => {
    try {
      setIsPaymentProcessing(true);
      
      // Ödeme simülasyonu - Stripe entegrasyonu burada olabilir
      console.log("Ödeme işlemi başlatılıyor... Fiyat:", price);
      
      // Simüle edilmiş ödeme işlemi (normalde burada Stripe API'si kullanılır)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ödeme başarılı
      setIsPaymentComplete(true);
      setIsPaymentProcessing(false);
      
      toast({
        title: "Ödeme Başarılı",
        description: `${price.toFixed(2)} ₺ tutarındaki ödeme işlemi tamamlandı.`,
      });
      
      // Ödemeden sonra bir sonraki adıma geç
      setStep(prevStep => prevStep + 1);
      
    } catch (error: any) {
      console.error("Ödeme hatası:", error);
      setIsPaymentProcessing(false);
      
      toast({
        title: "Ödeme Hatası",
        description: error.message || "Ödeme işlemi sırasında bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  // Rapor oluşturma
  const handleReport = async (format: string) => {
    try {
      // Şirket verilerini hazırla
      if (selectedCompanies.length === 0) {
        throw new Error("Lütfen en az bir şirket seçin");
      }
      
      // Önce şirket verileri kaydetmek için bir istek yap
      const companyResponse = await apiRequest("POST", "/api/companies", {
        name: selectedCompanies[0].name,
        code: selectedCompanies[0].code,
        sector: selectedCompanies[0].sector
      });
      
      if (!companyResponse.ok) {
        const errorText = await companyResponse.text();
        throw new Error(`Şirket kaydedilemedi: ${errorText}`);
      }
      
      const company = await companyResponse.json();
      console.log("Şirket kaydedildi:", company);
      
      // Şimdi finansal veri oluştur
      const today = new Date().getFullYear(); // Geçerli yıl
      // selectedYears[0] string olduğu için parseInt ile sayıya çevirelim
      const selectedYear = selectedYears.length > 0 ? parseInt(selectedYears[0]) : today;
      
      // Önce şirketin gerçek finansal verilerini çek
      const companyFinancialResponse = await apiRequest("GET", `/api/company-financials/${selectedCompanies[0].code}?year=${selectedYear}`);
      
      let realFinancialData = {};
      if (companyFinancialResponse.ok) {
        const companyData = await companyFinancialResponse.json();
        console.log("Çekilen şirket verileri:", companyData);
        
        // Gerçek finansal verileri kullan
        realFinancialData = companyData.financialData || {};
      }
      
      const financialDataResponse = await apiRequest("POST", "/api/financial-data", {
        companyId: company.id,
        year: selectedYear,
        // Gerçek finansal verilerden oranlar için gerekli alanları al
        currentAssets: realFinancialData.currentAssets || 2500000,
        cashAndEquivalents: realFinancialData.cashAndEquivalents || 1000000,
        inventory: realFinancialData.inventory || 750000,
        shortTermLiabilities: realFinancialData.shortTermLiabilities || 1000000,
        longTermLiabilities: realFinancialData.longTermLiabilities || 2000000,
        totalAssets: realFinancialData.totalAssets || 7500000,
        equity: realFinancialData.equity || 4500000,
        netSales: realFinancialData.netSales || 8000000,
        grossProfit: realFinancialData.grossProfit || 3200000,
        operatingProfit: realFinancialData.operatingProfit || 1600000,
        netProfit: realFinancialData.netProfit || 800000,
        fixedAssets: realFinancialData.fixedAssets || 5000000,
        tangibleFixedAssets: realFinancialData.tangibleFixedAssets || 4000000,
        totalLiabilities: realFinancialData.totalLiabilities || 3000000,
        // Eski alanları da koruyalım
        accountsReceivable: 500000,
        otherCurrentAssets: 250000,
        totalCurrentAssets: realFinancialData.currentAssets || 2500000,
        totalNonCurrentAssets: realFinancialData.fixedAssets || 5000000,
        shortTermDebt: 300000,
        accountsPayable: 400000,
        otherCurrentLiabilities: 300000,
        totalCurrentLiabilities: realFinancialData.shortTermLiabilities || 1000000
      });

      if (!financialDataResponse.ok) {
        const errorText = await financialDataResponse.text();
        console.error("Finansal veri kaydetme hatası yanıtı:", errorText);
        throw new Error(`Finansal veri kaydedilemedi: ${errorText}`);
      }

      const financialData = await financialDataResponse.json();
      console.log("Kaydedilen finansal veri:", financialData);
      
      // Rapor oluştur
      console.log("Rapor oluşturma başlatılıyor...", {
        companyId: company.id,
        financialDataId: financialData.id,
        format: format
      });
      
      // Rapor isteği yap
      const reportResponse = await apiRequest("POST", "/api/reports", {
        companyId: company.id,
        financialDataId: financialData.id,
        format: format,
        name: `${company.name} - ${selectedYear} Finansal Analiz Raporu`,
        type: 'financial',
        status: 'completed',
        numCompanies: selectedCompanies.length,
        numPeriods: selectedYears.length,
        numRatios: selectedRatios.length,
        price: price,
        metadata: JSON.stringify({
          ratio_ids: selectedRatios
        })
      });
      
      if (!reportResponse.ok) {
        const errorText = await reportResponse.text();
        console.error("Rapor oluşturma hatası yanıtı:", reportResponse.status, errorText);
        throw new Error(`Rapor oluşturulamadı: ${reportResponse.status} - ${errorText}`);
      }
      
      const reportData = await reportResponse.json();
      console.log("Oluşturulan rapor:", reportData);
      return reportData;
      
    } catch (error: any) {
      console.error("Rapor oluşturma hatası:", error);
      let errorMessage = error.message || "Rapor oluşturulurken bir hata meydana geldi.";
      
      toast({
        title: "Rapor Oluşturma Hatası",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // PDF raporu oluştur
  const handlePdfReport = async () => {
    try {
      setIsGeneratingReport(true);
      const reportData = await handleReport("pdf");
      toast({
        title: "Rapor Hazır",
        description: "PDF raporu başarıyla oluşturuldu.",
      });
      setLocation("/reports");
    } catch (error) {
      console.error("PDF rapor oluşturma hatası:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  // Excel raporu oluştur
  const handleExcelReport = async () => {
    try {
      setIsGeneratingReport(true);
      const reportData = await handleReport("excel");
      toast({
        title: "Rapor Hazır",
        description: "Excel raporu başarıyla oluşturuldu.",
      });
      setLocation("/reports");
    } catch (error) {
      console.error("Excel rapor oluşturma hatası:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  // Word raporu kaldırıldı
  
  // CSV raporu oluştur
  const handleCsvReport = async () => {
    try {
      setIsGeneratingReport(true);
      const reportData = await handleReport("csv");
      toast({
        title: "Rapor Hazır",
        description: "CSV raporu başarıyla oluşturuldu.",
      });
      setLocation("/reports");
    } catch (error) {
      console.error("CSV rapor oluşturma hatası:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Finansal Analiz Sihirbazı</h1>
      
      {/* Adım göstergesi */}
      <div className="flex justify-between mb-8 px-4">
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>1</div>
          <span className="mt-2">Şirket Seçimi</span>
        </div>
        <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>2</div>
          <span className="mt-2">Dönem Seçimi</span>
        </div>
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>3</div>
          <span className="mt-2">Oran Seçimi</span>
        </div>
        <div className={`flex flex-col items-center ${step >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-primary bg-primary/10' : 'border-muted'}`}>4</div>
          <span className="mt-2">Ödeme</span>
        </div>
        <div className={`flex flex-col items-center ${step >= 5 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 5 ? 'border-primary bg-primary/10' : 'border-muted'}`}>5</div>
          <span className="mt-2">Rapor İndir</span>
        </div>
      </div>
      
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Analiz Edilecek Şirketleri Seçin"}
            {step === 2 && "Analiz Dönemlerini Seçin"}
            {step === 3 && "Hesaplanacak Finansal Oranları Seçin"}
            {step === 4 && "Ödeme İşlemi"}
            {step === 5 && "Rapor İndir"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Finansal analiz yapmak istediğiniz şirketleri seçin. Birden fazla şirket seçebilirsiniz."}
            {step === 2 && "Analiz yapılacak dönemleri (yılları) seçin. Birden fazla dönem seçebilirsiniz."}
            {step === 3 && "Raporda yer almasını istediğiniz finansal oranları seçin."}
            {step === 4 && "Raporunuz için hesaplanan ücreti ödeyerek analiz sürecini tamamlayın."}
            {step === 5 && "Finansal analiz raporu için çıktı formatını seçin ve raporu indirin."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Adım 1: Şirket Seçimi */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Şirket Ara</Label>
                <MultiCompanySelectorWithAutocomplete 
                  onSelectCompanies={handleCompanySelection}
                  initialSelectedCompanies={selectedCompanies}
                />
              </div>
            </div>
          )}
          
          {/* Adım 2: Dönem Seçimi */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-2">Analiz Dönemlerini Seçin</h3>
              <p className="text-sm text-muted-foreground mb-4">Analiz yapılacak mali dönemleri seçin (2000 yılına kadar).</p>
              
              {/* YearSelector bileşenini kullan */}
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <YearSelector 
                  onSelectYears={(years) => setSelectedYears(years.map(y => y.toString()))}
                  yearCount={26} // 2000-2025 arası
                />
              </div>
            </div>
          )}
          
          {/* Adım 3: Oran Seçimi */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Hesaplanacak Finansal Oranları Seçin</h3>
              <p className="text-sm text-muted-foreground mb-4">Raporda yer almasını istediğiniz finansal oranları seçin.</p>
              
              <div className="flex items-center space-x-2 mb-6 border-b pb-2">
                <Checkbox 
                  id="select-all" 
                  checked={selectedRatios.length === financialRatios.length}
                  onCheckedChange={handleSelectAllRatios}
                />
                <Label htmlFor="select-all" className="font-bold">Tümünü Seç / Kaldır</Label>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-6 gap-x-8">
                {financialRatios.map(ratio => (
                  <div key={ratio.id} className="flex items-start space-x-3 pb-3 border-b">
                    <Checkbox 
                      id={`ratio-${ratio.id}`} 
                      checked={selectedRatios.includes(ratio.id)}
                      onCheckedChange={() => handleRatioChange(ratio.id)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor={`ratio-${ratio.id}`} className="font-medium">{ratio.name}</Label>
                      <p className="text-sm text-muted-foreground mt-1">{ratio.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Adım 4: Ödeme İşlemi */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-muted p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-4">Ödeme Özeti</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-muted-foreground">Şirket Sayısı</p>
                    <p className="font-bold text-lg">{selectedCompanies.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-muted-foreground">Dönem Sayısı</p>
                    <p className="font-bold text-lg">{selectedYears.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-muted-foreground">Oran Sayısı</p>
                    <p className="font-bold text-lg">{selectedRatios.length}</p>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
                  <p className="text-sm text-muted-foreground">Ödenecek Tutar</p>
                  <p className="text-3xl font-bold text-primary mt-1">{price.toFixed(2)} ₺</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Şirket Sayısı × Dönem Sayısı × Oran Sayısı × 0.25₺ hesaplama formülü kullanılmıştır.
                  </p>
                </div>
                
                <Button 
                  className="w-full py-6 text-lg"
                  onClick={handleProceedToPayment}
                  disabled={isPaymentProcessing}
                >
                  {isPaymentProcessing ? 
                    <div className="flex items-center justify-center">
                      <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-white rounded-full" />
                      İşleminiz Gerçekleştiriliyor...
                    </div> : 
                    <div className="flex items-center justify-center">
                      <span className="mr-2">Ödeme Yap</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  }
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  "Ödeme Yap" butonuna tıkladığınızda, ödeme sistemi sayfasına yönlendirileceksiniz.
                </p>
              </div>
            </div>
          )}
          
          {/* Adım 5: Rapor İndirme */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Ödeme Başarılı</h3>
                    <p className="text-sm text-green-600">
                      {price.toFixed(2)} ₺ tutarındaki ödemeniz başarıyla tamamlandı.
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Rapor Formatını Seçin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {outputFormats.map(format => (
                  <Card key={format.id} className="overflow-hidden">
                    <CardHeader className="bg-muted pb-2">
                      <CardTitle className="flex items-center">
                        <span className="text-2xl mr-2">{format.icon}</span> 
                        {format.name} Formatı
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground mb-4">
                        Finansal analiz raporunu {format.name} formatında oluştur.
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSelectedFormat(format.id);
                          if (format.id === "pdf") handlePdfReport();
                          else if (format.id === "excel") handleExcelReport();
                          else if (format.id === "csv") handleCsvReport();
                        }}
                        disabled={isGeneratingReport}
                        variant={selectedFormat === format.id ? "default" : "outline"}
                      >
                        {isGeneratingReport && selectedFormat === format.id 
                          ? "Oluşturuluyor..." 
                          : `${format.name} Raporu İndir`
                        }
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={isGeneratingReport || isPaymentProcessing}
            >
              Geri
            </Button>
          )}
          
          {step < 5 && step !== 4 && (
            <Button 
              className="ml-auto" 
              onClick={handleNext}
              disabled={isPaymentProcessing || isGeneratingReport}
            >
              İleri
            </Button>
          )}
          
          {step === 1 && (
            <Button variant="ghost" disabled className="opacity-0">
              Placeholder
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}