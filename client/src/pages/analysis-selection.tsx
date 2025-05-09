import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ArrowLeft, ArrowRight, FileDown, CircleDollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MultiCompanySelector from "@/components/financial/multi-company-selector";
import YearSelector from "@/components/financial/year-selector";
import RatioSelector, { RatioType, ratioInfo } from "@/components/financial/ratio-selector";
import ReportFormatSelector, { ReportFormat, formatInfo } from "@/components/financial/report-format-selector";
import PriceCalculator from "@/components/financial/price-calculator";
import { useFinancialData } from "@/hooks/use-financial-data";

// Şirket tipi
interface Company {
  code: string;
  name: string;
  sector: string;
}

export default function AnalysisSelectionPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { generateReport } = useFinancialData();
  
  // Aktif sekme
  const [activeTab, setActiveTab] = useState("companies");
  
  // Seçimler
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([new Date().getFullYear()]);
  const [selectedRatios, setSelectedRatios] = useState<RatioType[]>(["currentRatio", "liquidityRatio", "acidTestRatio"]);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("pdf");
  
  // Fiyat
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Seçim tamamlandı mı?
  const [selectionComplete, setSelectionComplete] = useState(false);
  
  // Seçilen ögeler az ise uyarı göster
  const showWarning = selectedCompanies.length === 0 || 
                      selectedYears.length === 0 || 
                      selectedRatios.length === 0;
  
  // Ana sayfaya dön
  const goToHome = () => {
    navigate("/");
  };
  
  // Ödeme sayfasına git
  const goToPayment = () => {
    // Seçimleri localStorage'a kaydet (ödeme sayfasından sonra kullanılacak)
    localStorage.setItem('analysis_selection', JSON.stringify({
      companies: selectedCompanies,
      years: selectedYears,
      ratios: selectedRatios,
      format: selectedFormat,
      price: totalPrice
    }));
    
    // Ödeme sayfasına yönlendir
    navigate(`/payment?amount=${totalPrice}&returnUrl=/report`);
  };
  
  // Değişiklikleri takip et ve seçim tamamlandıysa fiyat göster
  useEffect(() => {
    const isComplete = 
      selectedCompanies.length > 0 && 
      selectedYears.length > 0 && 
      selectedRatios.length > 0;
    
    setSelectionComplete(isComplete);
  }, [selectedCompanies, selectedYears, selectedRatios]);
  
  // Sonraki sekmeye geç
  const nextTab = () => {
    if (activeTab === "companies") {
      setActiveTab("periods");
    } else if (activeTab === "periods") {
      setActiveTab("ratios");
    } else if (activeTab === "ratios") {
      setActiveTab("format");
    }
  };
  
  // Önceki sekmeye dön
  const prevTab = () => {
    if (activeTab === "format") {
      setActiveTab("ratios");
    } else if (activeTab === "ratios") {
      setActiveTab("periods");
    } else if (activeTab === "periods") {
      setActiveTab("companies");
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Sayfa Başlığı */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Button variant="ghost" onClick={goToHome} className="mb-2 -ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Button>
              <h1 className="text-2xl font-bold">Finansal Analiz</h1>
              <p className="text-neutral-600">
                Finansal analiz yapmak için gerekli kriterleri seçin
              </p>
            </div>
          </div>
          
          {/* Seçim Alanı */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sol Taraf: Seçim Sekmeleri */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="companies">
                    1. Şirketler
                  </TabsTrigger>
                  <TabsTrigger value="periods">
                    2. Dönemler
                  </TabsTrigger>
                  <TabsTrigger value="ratios">
                    3. Oranlar
                  </TabsTrigger>
                  <TabsTrigger value="format">
                    4. Format
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="companies" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Şirket Seçimi</CardTitle>
                      <CardDescription>
                        Analiz etmek istediğiniz şirketleri seçin (maksimum 10 şirket)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MultiCompanySelector
                        selectedCompanies={selectedCompanies}
                        onSelect={setSelectedCompanies}
                        maxSelections={10}
                      />
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end">
                    <Button onClick={nextTab} disabled={selectedCompanies.length === 0}>
                      Sonraki <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="periods" className="space-y-6">
                  <YearSelector
                    selectedYears={selectedYears}
                    onYearSelect={setSelectedYears}
                    maxSelections={5}
                  />
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevTab}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Geri
                    </Button>
                    <Button onClick={nextTab} disabled={selectedYears.length === 0}>
                      Sonraki <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="ratios" className="space-y-6">
                  <RatioSelector
                    selectedRatios={selectedRatios}
                    onRatioSelect={setSelectedRatios}
                  />
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevTab}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Geri
                    </Button>
                    <Button onClick={nextTab} disabled={selectedRatios.length === 0}>
                      Sonraki <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="format" className="space-y-6">
                  <ReportFormatSelector
                    selectedFormat={selectedFormat}
                    onFormatSelect={setSelectedFormat}
                  />
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevTab}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Geri
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sağ Taraf: Fiyat ve Devam */}
            <div className="space-y-6">
              <PriceCalculator
                companiesCount={selectedCompanies.length}
                periodsCount={selectedYears.length}
                ratiosCount={selectedRatios.length}
                onChange={setTotalPrice}
              />
              
              {selectionComplete && (
                <Card className="border-2 border-primary-100">
                  <CardContent className="pt-6">
                    <Button 
                      className="w-full mb-2" 
                      size="lg" 
                      onClick={goToPayment}
                    >
                      <CircleDollarSign className="mr-2 h-4 w-4" />
                      Ödemeye Geç
                    </Button>
                    <p className="text-xs text-center text-neutral-500">
                      Ödeme sonrası raporunuz hazırlanacaktır
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {showWarning && (
                <Card className="border border-amber-200 bg-amber-50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-amber-700">
                      Lütfen rapor oluşturmak için en az bir şirket, dönem ve oran türü seçin.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md">Seçimleriniz</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div>
                    <p className="font-medium">Şirketler:</p>
                    <p className="text-neutral-600">
                      {selectedCompanies.length > 0 
                        ? selectedCompanies.map(c => c.name).join(", ")
                        : "Henüz şirket seçilmedi"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Dönemler:</p>
                    <p className="text-neutral-600">
                      {selectedYears.length > 0 
                        ? selectedYears.join(", ")
                        : "Henüz dönem seçilmedi"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Oran Türleri:</p>
                    <p className="text-neutral-600">
                      {selectedRatios.length > 0 
                        ? selectedRatios.map(r => ratioInfo[r].name).join(", ")
                        : "Henüz oran türü seçilmedi"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Format:</p>
                    <p className="text-neutral-600">
                      {formatInfo[selectedFormat].name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}