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
import { bistCompanies } from "@/data/bist-companies";

// Mevcut finansal oranların listesi
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
  { id: "inventoryTurnover", name: "Stok Devir Hızı", description: "Şirketin stoklarını ne kadar hızlı sattığını gösterir" },
  { id: "receivablesTurnover", name: "Alacak Devir Hızı", description: "Şirketin alacaklarını ne kadar hızlı tahsil ettiğini gösterir" },
  { id: "assetTurnover", name: "Varlık Devir Hızı", description: "Şirketin varlıklarının satışlara dönüşme hızını gösterir" },
  { id: "interestCoverageRatio", name: "Faiz Karşılama Oranı", description: "Şirketin faiz ödemelerini karşılama yeteneğini gösterir" },
  { id: "dividendYield", name: "Temettü Verimi", description: "Hisse başına ödenen temettünün hisse fiyatına oranını gösterir" }
];

// Çıktı formatları
const outputFormats = [
  { id: "pdf", name: "PDF", icon: "📄" },
  { id: "excel", name: "Excel", icon: "📊" },
  { id: "word", name: "Word", icon: "📝" },
  { id: "csv", name: "CSV", icon: "📑" }
];

export default function AnalysisWizard() {
  const [step, setStep] = useState(1);
  const [selectedCompanies, setSelectedCompanies] = useState<any[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedRatios, setSelectedRatios] = useState<string[]>(financialRatios.map(r => r.id));
  const [price, setPrice] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
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
      
      const financialDataResponse = await apiRequest("POST", "/api/financial-data", {
        companyId: company.id,
        year: selectedYear, // Sayı olarak gönder
        // Gerekli finansal veri alanları - test değerleri
        cashAndEquivalents: 1000000,
        accountsReceivable: 500000,
        inventory: 750000,
        otherCurrentAssets: 250000,
        totalCurrentAssets: 2500000,
        totalNonCurrentAssets: 5000000,
        totalAssets: 7500000,
        shortTermDebt: 300000,
        accountsPayable: 400000,
        otherCurrentLiabilities: 300000,
        totalCurrentLiabilities: 1000000
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
        price: price
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
  
  // Word raporu oluştur
  const handleWordReport = async () => {
    try {
      setIsGeneratingReport(true);
      const reportData = await handleReport("word");
      toast({
        title: "Rapor Hazır",
        description: "Word raporu başarıyla oluşturuldu.",
      });
      setLocation("/reports");
    } catch (error) {
      console.error("Word rapor oluşturma hatası:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
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
          <span className="mt-2">Rapor Oluştur</span>
        </div>
      </div>
      
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Analiz Edilecek Şirketleri Seçin"}
            {step === 2 && "Analiz Dönemlerini Seçin"}
            {step === 3 && "Hesaplanacak Finansal Oranları Seçin"}
            {step === 4 && "Rapor Oluştur"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Finansal analiz yapmak istediğiniz şirketleri seçin. Birden fazla şirket seçebilirsiniz."}
            {step === 2 && "Analiz yapılacak dönemleri (yılları) seçin. Birden fazla dönem seçebilirsiniz."}
            {step === 3 && "Raporda yer almasını istediğiniz finansal oranları seçin."}
            {step === 4 && "Finansal analiz raporu için çıktı formatını seçin ve raporu oluşturun."}
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map(year => (
                  <div key={year} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`year-${year}`} 
                      checked={selectedYears.includes(year.toString())}
                      onCheckedChange={() => handleYearChange(year.toString())}
                    />
                    <Label htmlFor={`year-${year}`}>{year}</Label>
                  </div>
                ))}
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
          
          {/* Adım 4: Rapor Oluşturma */}
          {step === 4 && (
            <div className="space-y-6">
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
                          if (format.id === "pdf") handlePdfReport();
                          else if (format.id === "excel") handleExcelReport();
                          else if (format.id === "word") handleWordReport();
                          else if (format.id === "csv") handleCsvReport();
                        }}
                        disabled={isGeneratingReport}
                      >
                        {isGeneratingReport ? "Oluşturuluyor..." : `${format.name} Raporu Oluştur`}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Fiyat Hesaplama</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Şirket Sayısı</p>
                    <p className="font-medium">{selectedCompanies.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dönem Sayısı</p>
                    <p className="font-medium">{selectedYears.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Oran Sayısı</p>
                    <p className="font-medium">{selectedRatios.length}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Toplam Fiyat</span>
                  <span className="text-xl font-bold">{price.toFixed(2)} ₺</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isGeneratingReport}>
              Geri
            </Button>
          )}
          
          {step < 4 && (
            <Button className="ml-auto" onClick={handleNext}>
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