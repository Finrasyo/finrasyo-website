import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  ArrowLeft, 
  Download, 
  FileDown,
  BarChart3
} from "lucide-react";
import CompanySelector from "@/components/financial/company-selector";
import CompanyFinancialData from "@/components/financial/company-financial-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { bistCompanies } from "@/data/bist-companies";

export default function CompanyAnalysisPage() {
  const { companyCode } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<{
    code: string;
    name: string;
    sector: string;
  } | null>(null);

  // URL'den gelen şirket kodunu kontrol et
  useEffect(() => {
    if (companyCode) {
      const company = bistCompanies.find(c => c.code === companyCode);
      if (company) {
        setSelectedCompany(company);
      } else {
        setError(`"${companyCode}" kodlu şirket bulunamadı.`);
      }
    }
  }, [companyCode]);

  // Şirket seçildiğinde
  const handleCompanySelect = (company: { code: string; name: string; sector: string }) => {
    setSelectedCompany(company);
    setLocation(`/analiz/${company.code}`);
    setError(null);
  };

  // Ana sayfaya dön
  const goToHome = () => {
    setLocation("/");
  };

  // Analiz yap
  const analyzeFinancials = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    setError(null);

    try {
      // Şirket finansal verilerini al
      const response = await apiRequest("GET", `/api/company-financials/${selectedCompany.code}`);
      
      if (!response.ok) {
        throw new Error("Finansal veri alınamadı");
      }
      
      // Başarılı bildirim
      toast({
        title: "Analiz Tamamlandı",
        description: `${selectedCompany.name} şirketinin finansal verileri başarıyla analiz edildi.`,
      });
    } catch (err) {
      console.error("Analiz hatası:", err);
      setError("Finansal analiz yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Finansal analiz yapılırken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Şirket Analizi</h1>
          <p className="text-muted-foreground">
            BIST'te işlem gören şirketlerin finansal analizini yapın ve raporlayın
          </p>
        </div>
        <Button variant="outline" onClick={goToHome}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Şirket Seçimi</CardTitle>
          <CardDescription>
            Analiz yapmak istediğiniz şirketi seçin veya arayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanySelector onSelect={handleCompanySelect} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedCompany && (
        <div className="space-y-6">
          <CompanyFinancialData 
            companyCode={selectedCompany.code} 
            companyName={selectedCompany.name} 
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Rapor Oluştur</CardTitle>
              <CardDescription>
                Şirket finansal verilerine göre detaylı rapor oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Rapor Tipi</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF Raporu
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Excel Raporu
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Rapor İçeriği</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-ratios"
                        className="h-4 w-4 rounded border-gray-300"
                        defaultChecked
                      />
                      <label htmlFor="include-ratios">
                        Oran Analizleri
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-trend"
                        className="h-4 w-4 rounded border-gray-300"
                        defaultChecked
                      />
                      <label htmlFor="include-trend">
                        Trend Analizi
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-comparison"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor="include-comparison">
                        Sektör Karşılaştırması
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Rapor Oluştur (1 Kredi)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}