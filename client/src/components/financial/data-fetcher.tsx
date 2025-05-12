import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DataFetcherProps {
  companies: Array<{code: string, name: string, sector: string}>;
  years: number[];
  ratios: string[];
  onDataFetched: (data: any) => void;
  onError: (error: string) => void;
}

export default function DataFetcher({
  companies,
  years,
  ratios,
  onDataFetched,
  onError
}: DataFetcherProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const fetchFinancialData = async () => {
    if (companies.length === 0 || years.length === 0 || ratios.length === 0) {
      toast({
        title: "Eksik Parametre",
        description: "Şirket, dönem ve oran seçimi yapılmalıdır.",
        variant: "destructive"
      });
      return;
    }
    
    setIsFetching(true);
    setProgress(0);
    
    try {
      // İlerleme simülasyonu
      const totalSteps = companies.length * years.length;
      let currentStep = 0;
      
      const allResults: any = {};
      
      // Her şirket için veri çek
      for (const company of companies) {
        allResults[company.code] = { name: company.name, years: {} };
        
        for (const year of years) {
          try {
            // Şirket ve döneme göre finansal verileri al
            const response = await apiRequest(
              "GET", 
              `/api/company-financials/${company.code}?year=${year}`
            );
            
            if (!response.ok) {
              throw new Error(`${company.code} için ${year} yılı verileri alınamadı.`);
            }
            
            const data = await response.json();
            allResults[company.code].years[year] = data;
          } catch (error) {
            console.error(`Veri çekme hatası (${company.code}, ${year}):`, error);
            allResults[company.code].years[year] = { error: `${year} yılı verileri alınamadı.` };
          }
          
          // İlerlemeyi güncelle
          currentStep++;
          setProgress(Math.floor((currentStep / totalSteps) * 100));
        }
      }
      
      // Tüm veriler çekildikten sonra sonuçları ilet
      onDataFetched(allResults);
    } catch (error: any) {
      console.error("Finansal veri çekme hatası:", error);
      toast({
        title: "Veri Çekme Hatası",
        description: error.message || "Finansal veriler çekilirken bir hata oluştu.",
        variant: "destructive"
      });
      onError(error.message || "Finansal veriler çekilirken bir hata oluştu.");
    } finally {
      setIsFetching(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finansal Verileri Çek</CardTitle>
        <CardDescription>
          Seçilen şirketlerin finansal verilerini analiz için hazırla
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Seçilen Şirketler:</span>
              <span className="font-medium">{companies.length} adet</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Seçilen Dönemler:</span>
              <span className="font-medium">{years.length} adet</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Hesaplanacak Oranlar:</span>
              <span className="font-medium">{ratios.length} adet</span>
            </div>
          </div>
          
          {isFetching ? (
            <div className="space-y-4">
              <div className="w-full bg-neutral-100 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-neutral-600">
                Finansal veriler çekiliyor... ({progress}%)
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Önemli Bilgi</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        İşlem süresi seçilen şirket ve dönem sayısına göre değişebilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={fetchFinancialData} 
                className="w-full"
                size="lg"
              >
                Verileri Çek
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}