import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Save, Download } from "lucide-react";
import MultiCompanySelector from "@/components/financial/multi-company-selector";
import YearSelector from "@/components/financial/year-selector";
import RatioSelector from "@/components/financial/ratio-selector";
import { PriceCalculator } from "@/components/financial/price-calculator";
import DataFetcher from "@/components/financial/data-fetcher";
import ResultProcessor from "@/components/financial/result-processor";
import ReportGenerator from "@/components/financial/report-generator";
import { useFinancialData } from "@/hooks/use-financial-data";
import { apiRequest } from "@/lib/queryClient";

interface Company {
  code: string;
  name: string;
  sector: string;
}

export default function AnalysisWizardPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { generateReport } = useFinancialData();
  
  // Wizard states
  const [currentStep, setCurrentStep] = useState("company-selection");
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedRatios, setSelectedRatios] = useState<string[]>([]);
  const [price, setPrice] = useState(0);
  const [credits, setCredits] = useState(0);
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [processedResults, setProcessedResults] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  
  // Restore selections from localStorage if available
  useEffect(() => {
    const savedCompanies = localStorage.getItem('selectedCompanies');
    const savedYears = localStorage.getItem('selectedYears');
    
    if (savedCompanies) {
      try {
        setSelectedCompanies(JSON.parse(savedCompanies));
      } catch (e) {
        console.error("Kaydedilmiş şirket verileri okunamadı:", e);
      }
    }
    
    if (savedYears) {
      try {
        setSelectedYears(JSON.parse(savedYears));
      } catch (e) {
        console.error("Kaydedilmiş dönem verileri okunamadı:", e);
      }
    }
  }, []);
  
  const handleCompanySelection = (companies: Company[]) => {
    setSelectedCompanies(companies);
    localStorage.setItem('selectedCompanies', JSON.stringify(companies));
  };
  
  const handleYearSelection = (years: number[]) => {
    setSelectedYears(years);
    localStorage.setItem('selectedYears', JSON.stringify(years));
  };
  
  const handleRatioSelection = (ratios: string[]) => {
    setSelectedRatios(ratios);
  };
  
  const handlePriceChange = (newPrice: number, newCredits: number) => {
    setPrice(newPrice);
    setCredits(newCredits);
  };
  
  const handleDataFetched = (data: any) => {
    setFetchedData(data);
    setCurrentStep("ratio-calculation");
  };
  
  const handleResultsProcessed = (results: any) => {
    setProcessedResults(results);
    if (!processedResults) {
      setCurrentStep("report-generation");
    }
  };
  
  const handleBackStep = () => {
    if (currentStep === "year-selection") {
      setCurrentStep("company-selection");
    } else if (currentStep === "ratio-selection") {
      setCurrentStep("year-selection");
    } else if (currentStep === "price-calculation") {
      setCurrentStep("ratio-selection");
    } else if (currentStep === "data-fetching") {
      setCurrentStep("price-calculation");
    } else if (currentStep === "ratio-calculation") {
      setCurrentStep("data-fetching");
    } else if (currentStep === "report-generation") {
      setCurrentStep("ratio-calculation");
    }
  };
  
  const handleNextStep = () => {
    if (currentStep === "company-selection") {
      if (selectedCompanies.length === 0) {
        toast({
          title: "Şirket Seçiniz",
          description: "Lütfen en az bir şirket seçin",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep("year-selection");
    } else if (currentStep === "year-selection") {
      if (selectedYears.length === 0) {
        toast({
          title: "Dönem Seçiniz",
          description: "Lütfen en az bir finansal dönem seçin",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep("ratio-selection");
    } else if (currentStep === "ratio-selection") {
      if (selectedRatios.length === 0) {
        toast({
          title: "Oran Seçiniz",
          description: "Lütfen en az bir finansal oran seçin",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep("price-calculation");
    } else if (currentStep === "price-calculation") {
      // Admin veya credits yeterliyse doğrudan işleme devam et
      if (user?.role === "admin" || (user && user.credits >= credits)) {
        setIsPaid(true);
        setCurrentStep("data-fetching");
      } else {
        // Ödeme sayfasına yönlendir
        localStorage.setItem('pendingAnalysis', JSON.stringify({
          companies: selectedCompanies,
          years: selectedYears,
          ratios: selectedRatios,
          price, 
          credits
        }));
        navigate("/payment");
      }
    }
  };
  
  const handlePayment = async () => {
    // Ödeme işlemi
    try {
      if (price === 0) {
        setIsPaid(true);
        setCurrentStep("data-fetching");
        return;
      }
      
      const response = await apiRequest("POST", "/api/payments", {
        amount: price,
        credits: credits,
        description: `${selectedCompanies.length} şirket, ${selectedYears.length} dönem, ${selectedRatios.length} oran için analiz`
      });
      
      if (!response.ok) {
        throw new Error("Ödeme işlemi başarısız oldu.");
      }
      
      setIsPaid(true);
      setCurrentStep("data-fetching");
      
      toast({
        title: "Ödeme Başarılı",
        description: "Ödemeniz başarıyla alındı, analiz başlatılıyor.",
      });
    } catch (error: any) {
      console.error("Ödeme hatası:", error);
      toast({
        title: "Ödeme Hatası",
        description: error.message || "Ödeme işlemi sırasında bir hata oluştu.",
        variant: "destructive"
      });
    }
  };
  
  const handleReport = async (format: string) => {
    try {
      // İşlenmiş verileri sunucuya gönder ve rapor oluştur
      await generateReport(
        parseInt(selectedCompanies[0].code), 
        0, // Geçici olarak 0 kullanıyoruz, gerçek uygulamada finansal veri ID'si olmalı
        format,
        {
          numCompanies: selectedCompanies.length,
          numPeriods: selectedYears.length,
          numRatios: selectedRatios.length,
          price: price
        }
      );
      
      toast({
        title: "Rapor Oluşturuldu",
        description: `Raporunuz ${format.toUpperCase()} formatında başarıyla oluşturuldu.`,
      });
      
      navigate("/reports");
    } catch (error: any) {
      console.error("Rapor oluşturma hatası:", error);
      toast({
        title: "Rapor Hatası",
        description: error.message || "Rapor oluşturulurken bir hata meydana geldi.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-6">Finansal Analiz Sihirbazı</h1>
          
          {/* Step Indicator */}
          <div className="mb-8">
            <Tabs value={currentStep} className="w-full">
              <TabsList className="grid grid-cols-6">
                <TabsTrigger 
                  value="company-selection" 
                  onClick={() => setCurrentStep("company-selection")}
                  disabled={false}
                >
                  1. Şirket Seçimi
                </TabsTrigger>
                <TabsTrigger 
                  value="year-selection" 
                  onClick={() => setCurrentStep("year-selection")}
                  disabled={selectedCompanies.length === 0}
                >
                  2. Dönem Seçimi
                </TabsTrigger>
                <TabsTrigger 
                  value="ratio-selection" 
                  onClick={() => setCurrentStep("ratio-selection")}
                  disabled={selectedYears.length === 0}
                >
                  3. Oran Seçimi
                </TabsTrigger>
                <TabsTrigger 
                  value="price-calculation" 
                  onClick={() => setCurrentStep("price-calculation")}
                  disabled={selectedRatios.length === 0}
                >
                  4. Fiyat Hesaplama
                </TabsTrigger>
                <TabsTrigger 
                  value="data-fetching" 
                  onClick={() => setCurrentStep("data-fetching")}
                  disabled={!isPaid}
                >
                  5. Veri Çekme
                </TabsTrigger>
                <TabsTrigger 
                  value="report-generation" 
                  onClick={() => setCurrentStep("report-generation")}
                  disabled={!processedResults}
                >
                  6. Rapor Oluşturma
                </TabsTrigger>
              </TabsList>
              
              {/* Şirket Seçimi */}
              <TabsContent value="company-selection" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Şirket Seçimi</CardTitle>
                    <CardDescription>
                      Analiz yapmak istediğiniz şirketleri seçin (birden fazla seçim yapabilirsiniz)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MultiCompanySelector 
                      onSelectCompanies={handleCompanySelection}
                      initialSelectedCompanies={selectedCompanies}
                      maxResults={10}
                    />
                    
                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={handleNextStep}
                        disabled={selectedCompanies.length === 0}
                      >
                        İleri <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Dönem Seçimi */}
              <TabsContent value="year-selection" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dönem Seçimi</CardTitle>
                    <CardDescription>
                      Analiz yapmak istediğiniz mali dönemleri seçin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <YearSelector 
                      onSelectYears={handleYearSelection}
                      initialSelectedYears={selectedYears}
                      yearCount={5}
                    />
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBackStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                      </Button>
                      <Button 
                        onClick={handleNextStep}
                        disabled={selectedYears.length === 0}
                      >
                        İleri <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Oran Seçimi */}
              <TabsContent value="ratio-selection" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Oran Seçimi</CardTitle>
                    <CardDescription>
                      Hesaplanmasını istediğiniz finansal oranları seçin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RatioSelector 
                      onSelectRatios={handleRatioSelection}
                      initialSelectedRatios={selectedRatios}
                    />
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBackStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                      </Button>
                      <Button 
                        onClick={handleNextStep}
                        disabled={selectedRatios.length === 0}
                      >
                        İleri <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Fiyat Hesaplama */}
              <TabsContent value="price-calculation" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fiyat Hesaplama</CardTitle>
                    <CardDescription>
                      Seçimlerinize göre ödemeniz gereken tutarı görüntüleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PriceCalculator 
                      onPriceChange={handlePriceChange}
                      initialCompanies={selectedCompanies.length}
                      initialPeriods={selectedYears.length}
                      initialRatios={selectedRatios.length}
                      pricePerUnit={0.25}
                    />
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBackStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                      </Button>
                      <Button 
                        onClick={handleNextStep}
                      >
                        Öde ve Devam Et <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Veri Çekme */}
              <TabsContent value="data-fetching" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Veri Çekme</CardTitle>
                    <CardDescription>
                      Seçtiğiniz şirketlerin finansal verilerini çekin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataFetcher 
                      companies={selectedCompanies}
                      years={selectedYears}
                      ratios={selectedRatios}
                      onDataFetched={handleDataFetched}
                      onError={(error) => console.error(error)}
                    />
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBackStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Oran Hesaplama ve Rapor Üretme */}
              <TabsContent value="ratio-calculation" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Oran Hesaplama</CardTitle>
                    <CardDescription>
                      Finansal verileri işleyerek istediğiniz oranları hesaplayın
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultProcessor 
                      data={fetchedData}
                      selectedRatios={selectedRatios}
                      onProcessed={handleResultsProcessed}
                    />
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBackStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Rapor Oluşturma */}
              <TabsContent value="report-generation" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rapor Oluşturma</CardTitle>
                    <CardDescription>
                      Analizlerinizi farklı formatlarda raporlayın
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center py-6"
                          onClick={() => handleReport("pdf")}
                        >
                          <Save className="h-8 w-8 mb-2" />
                          <span>PDF Olarak Kaydet</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center py-6"
                          onClick={() => handleReport("excel")}
                        >
                          <Save className="h-8 w-8 mb-2" />
                          <span>Excel Olarak Kaydet</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center py-6"
                          onClick={() => handleReport("word")}
                        >
                          <Save className="h-8 w-8 mb-2" />
                          <span>Word Olarak Kaydet</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center py-6"
                          onClick={() => handleReport("csv")}
                        >
                          <Save className="h-8 w-8 mb-2" />
                          <span>CSV Olarak Kaydet</span>
                        </Button>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Rapor Özeti</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Şirketler</h3>
                                <p>{selectedCompanies.map(c => c.code).join(", ")}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Dönemler</h3>
                                <p>{selectedYears.join(", ")}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Oranlar</h3>
                                <p>{selectedRatios.length} adet oran</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Toplam Kredi</h3>
                                <p>{credits} kredi ({price.toFixed(2)} ₺)</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={handleBackStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        <Button onClick={() => navigate("/reports")}>
                          <Download className="mr-2 h-4 w-4" />
                          Tüm Raporlarım
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}