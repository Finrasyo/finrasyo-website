import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Company, FinancialData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, File, History, AlertCircle, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import FinancialDataForm from "@/components/financial/financial-data-form";
import HistoricalData from "@/components/financial/historical-data";
import YearSelector from "@/components/financial/year-selector";
import RatioSelector from "@/components/financial/ratio-selector";
import ReportFormatSelector, { ReportFormat } from "@/components/financial/report-format-selector";

export default function CompanyPage() {
  const { id } = useParams();
  const companyId = parseInt(id);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Seçilen yıllar için state
  const [selectedYears, setSelectedYears] = useState<number[]>([new Date().getFullYear()]);
  
  // Seçilen oran türleri için state
  const [selectedRatios, setSelectedRatios] = useState<string[]>(["currentRatio", "liquidityRatio", "acidTestRatio"]);
  
  // Seçilen rapor formatı için state
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("pdf");

  const { 
    data: company,
    isLoading: isLoadingCompany,
    error: companyError
  } = useQuery<Company>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !isNaN(companyId),
    onError: () => {
      toast({
        title: "Hata",
        description: "Şirket bilgileri yüklenemedi.",
        variant: "destructive"
      });
    }
  });

  const {
    data: financialData = [],
    isLoading: isLoadingFinancialData
  } = useQuery<FinancialData[]>({
    queryKey: [`/api/companies/${companyId}/financial-data`],
    enabled: !isNaN(companyId),
  });

  const handleCreateAnalysis = () => {
    navigate(`/analysis/${companyId}`);
  };

  if (isLoadingCompany || isNaN(companyId)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                Şirket Bulunamadı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Bu şirket bulunamadı veya erişim izniniz yok.</p>
              <Button onClick={() => navigate("/")}>Ana Sayfaya Dön</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Company Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="bg-primary-50 p-3 rounded-lg mr-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-800">{company.name}</h1>
                  <p className="text-neutral-600">
                    {company.code ? `Kod: ${company.code} • ` : ""}
                    Son güncelleme: {formatDate(company.lastUpdated)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex">
                <Button onClick={handleCreateAnalysis}>
                  <File className="mr-2 h-4 w-4" />
                  Yeni Analiz Oluştur
                </Button>
              </div>
            </div>
          </div>
          
          {/* Company Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
              <TabsTrigger value="analysis">Analiz</TabsTrigger>
              <TabsTrigger value="history">Analiz Geçmişi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Şirket Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Şirket Adı</p>
                        <p className="mt-1 text-neutral-800">{company.name}</p>
                      </div>
                      
                      {company.code && (
                        <div>
                          <p className="text-sm font-medium text-neutral-500">Şirket Kodu</p>
                          <p className="mt-1 text-neutral-800">{company.code}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Son Güncelleme</p>
                        <p className="mt-1 text-neutral-800">{formatDate(company.lastUpdated)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Mevcut Analiz Sayısı</p>
                        <p className="mt-1 text-neutral-800">
                          {isLoadingFinancialData ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary inline mr-2" />
                          ) : (
                            financialData.length
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button variant="outline" className="w-full" onClick={handleCreateAnalysis}>
                        <File className="mr-2 h-4 w-4" />
                        Yeni Analiz Oluştur
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Son Analizler</CardTitle>
                    <CardDescription>
                      Bu şirket için yapılan son finansal analizler
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingFinancialData ? (
                      <div className="py-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : financialData.length === 0 ? (
                      <div className="py-8 text-center border border-dashed rounded-lg">
                        <History className="mx-auto h-12 w-12 text-neutral-300" />
                        <h3 className="mt-4 text-lg font-medium text-neutral-700">Henüz Analiz Yok</h3>
                        <p className="mt-2 text-neutral-500">
                          Bu şirket için henüz finansal analiz yapılmamış.
                        </p>
                        <Button className="mt-4" onClick={handleCreateAnalysis}>
                          İlk Analizi Oluştur
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {financialData.slice(0, 3).map((data) => (
                          <div 
                            key={data.id} 
                            className="p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer"
                            onClick={() => navigate(`/analysis/${companyId}?data=${data.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-neutral-800">{data.year} Yılı Analizi</h3>
                                <p className="text-sm text-neutral-500">
                                  Oluşturulma: {formatDate(data.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-neutral-700">
                                  Cari Oran: {data.currentRatio.toFixed(2)}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {formatDate(data.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {financialData.length > 3 && (
                          <Button 
                            variant="ghost" 
                            className="w-full text-primary"
                            onClick={() => setActiveTab("history")}
                          >
                            Tüm Analizleri Görüntüle ({financialData.length})
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Şirket bilgileri */}
                <div className="col-span-1">
                  <div className="space-y-6">
                    {/* Dönem Seçimi */}
                    <YearSelector 
                      selectedYears={selectedYears}
                      onYearSelect={setSelectedYears}
                      maxSelections={5}
                    />
                    
                    {/* Şirket Bilgileri Kartı */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Şirket Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-neutral-500">Şirket Adı</p>
                            <p className="mt-1 text-neutral-800">{company.name}</p>
                          </div>
                          
                          {company.code && (
                            <div>
                              <p className="text-sm font-medium text-neutral-500">Şirket Kodu</p>
                              <p className="mt-1 text-neutral-800">{company.code}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Analiz Alanı */}
                <div className="col-span-1 lg:col-span-2">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Oran Türü Seçimi */}
                      <RatioSelector 
                        selectedRatios={selectedRatios}
                        onRatioSelect={setSelectedRatios}
                      />
                      
                      {/* Rapor Formatı Seçimi */}
                      <ReportFormatSelector 
                        selectedFormat={selectedFormat}
                        onFormatSelect={setSelectedFormat}
                        showPrepareButton={true}
                        onPrepare={() => {
                          // Raporun toplam fiyatını hesapla
                          const yearCount = selectedYears.length;
                          const ratioCount = selectedRatios.length;
                          const basePrice = 25; // TL
                          const totalPrice = basePrice * yearCount;
                          
                          // Ödeme sayfasına yönlendir
                          navigate(`/payment?amount=${totalPrice}&format=${selectedFormat}&years=${selectedYears.join(",")}&ratios=${selectedRatios.join(",")}&companyId=${companyId}`);
                          
                          toast({
                            title: "Rapor hazırlanıyor",
                            description: `${selectedYears.join(", ")} yılları için ${selectedFormat.toUpperCase()} raporu hazırlanıyor.`,
                          });
                        }}
                        isPreparing={false}
                        price={selectedYears.length * 25}
                        currency="₺"
                      />
                    </div>
                    
                    {/* Sonuçlar Alanı */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Analiz Sonuçları</CardTitle>
                        <CardDescription>
                          Seçilen dönemler ve oran türlerine göre analiz sonuçları
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedYears.length === 0 ? (
                          <div className="py-8 text-center border border-dashed rounded-lg">
                            <p className="text-neutral-500">
                              Lütfen analiz için en az bir dönem seçiniz.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-neutral-600">
                              {company.name} şirketi için {selectedYears.join(", ")} 
                              {selectedYears.length > 1 ? " yıllarına" : " yılına"} ait 
                              {selectedRatios.length === 0 ? " (oran seçiniz)" : ""} analiz sonuçları.
                            </p>
                            
                            {/* Sonuçlar burada gösterilecek */}
                            <div className="mt-4">
                              <Button onClick={() => {
                                toast({
                                  title: "Analiz yapılıyor",
                                  description: "Seçilen dönemler için finansal analiz yapılıyor...",
                                });
                              }}>
                                Analiz Et
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <HistoricalData companyId={companyId} companyName={company.name} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
