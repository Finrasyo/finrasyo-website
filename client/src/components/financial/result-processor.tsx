import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllRatios } from "@/lib/financial-ratios";

interface ResultProcessorProps {
  data: any;
  selectedRatios: string[];
  onResultsProcessed: (processedData: any) => void;
}

export default function ResultProcessor({
  data,
  selectedRatios,
  onResultsProcessed
}: ResultProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  
  // Veri alındığında otomatik olarak işlemeyi başlat
  useEffect(() => {
    if (data && !results) {
      processFinancialData();
    }
  }, [data]);
  
  const processFinancialData = async () => {
    if (!data) {
      toast({
        title: "Veri Yok",
        description: "İşlenecek finansal veri bulunamadı.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Finansal oranları hesapla
      const processedResults: any = {};
      
      // Her şirket için oranları hesapla
      Object.keys(data).forEach(companyCode => {
        const company = data[companyCode];
        processedResults[companyCode] = { 
          name: company.name, 
          years: {}
        };
        
        // Her yıl için oranları hesapla
        Object.keys(company.years).forEach(year => {
          const yearData = company.years[year];
          
          // Hata kontrolü
          if (yearData.error) {
            processedResults[companyCode].years[year] = { error: yearData.error };
            return;
          }
          
          // Oranlar için hazırlık yap
          processedResults[companyCode].years[year] = { ratios: {} };
          
          // Seçilen finansal oranları hesapla
          selectedRatios.forEach(ratioId => {
            try {
              const ratio = calculateRatio(ratioId, yearData);
              processedResults[companyCode].years[year].ratios[ratioId] = ratio;
            } catch (error) {
              processedResults[companyCode].years[year].ratios[ratioId] = {
                value: null,
                error: `Hesaplama hatası: ${error}`
              };
            }
          });
        });
      });
      
      // Sonuçları kaydet ve bildir
      setResults(processedResults);
      onResultsProcessed(processedResults);
      
      toast({
        title: "İşlem Tamamlandı",
        description: "Finansal oranlar başarıyla hesaplandı.",
        variant: "default"
      });
    } catch (error: any) {
      console.error("Oran hesaplama hatası:", error);
      toast({
        title: "Hesaplama Hatası",
        description: error.message || "Finansal oranlar hesaplanırken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Finansal oran hesaplama işlevi
  const calculateRatio = (ratioId: string, financialData: any) => {
    // Veri kontrolü
    if (!financialData || !financialData.balanceSheet || !financialData.incomeStatement) {
      throw new Error("Yetersiz finansal veri");
    }
    
    // Örnek olarak bazı temel oranları hesaplayalım
    // Gerçek uygulama için daha kapsamlı hesaplamalar gerekecektir
    const balance = financialData.balanceSheet[0] || {};
    const income = financialData.incomeStatement[0] || {};
    
    switch (ratioId) {
      case "currentRatio":
        if (!balance.currentAssets || !balance.currentLiabilities || balance.currentLiabilities === 0) {
          throw new Error("Cari oran hesaplanamadı: Gerekli veriler eksik");
        }
        return {
          value: balance.currentAssets / balance.currentLiabilities,
          formula: `${balance.currentAssets} / ${balance.currentLiabilities}`
        };
        
      case "quickRatio":
        if (!balance.currentAssets || !balance.inventory || !balance.currentLiabilities || balance.currentLiabilities === 0) {
          throw new Error("Asit-test oranı hesaplanamadı: Gerekli veriler eksik");
        }
        return {
          value: (balance.currentAssets - balance.inventory) / balance.currentLiabilities,
          formula: `(${balance.currentAssets} - ${balance.inventory}) / ${balance.currentLiabilities}`
        };
        
      case "debtRatio":
        if (!balance.totalLiabilities || !balance.totalAssets || balance.totalAssets === 0) {
          throw new Error("Borç oranı hesaplanamadı: Gerekli veriler eksik");
        }
        return {
          value: balance.totalLiabilities / balance.totalAssets,
          formula: `${balance.totalLiabilities} / ${balance.totalAssets}`
        };
        
      case "netProfitMargin":
        if (!income.netIncome || !income.revenue || income.revenue === 0) {
          throw new Error("Net kar marjı hesaplanamadı: Gerekli veriler eksik");
        }
        return {
          value: income.netIncome / income.revenue,
          formula: `${income.netIncome} / ${income.revenue}`
        };
        
      // Diğer oranlar için de benzer şekilde hesaplamalar yapılır
      default:
        return {
          value: null,
          error: `Desteklenmeyen oran: ${ratioId}`
        };
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finansal Analiz</CardTitle>
        <CardDescription>
          Toplanan veriler üzerinden seçilen finansal oranları hesapla
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-neutral-600">Finansal oranlar hesaplanıyor...</p>
          </div>
        ) : results ? (
          <div className="space-y-4">
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Analiz Tamamlandı</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Seçilen şirketler ve dönemler için finansal oranlar başarıyla hesaplandı.
                      Şimdi raporları görüntüleyebilir veya indirebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onResultsProcessed(results)}>
                <FileText className="mr-2 h-4 w-4" />
                Raporu Görüntüle
              </Button>
              
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Raporu İndir
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-500">
            <FileText className="h-12 w-12 text-neutral-300 mb-4" />
            <p>Henüz işlenmiş finansal veri bulunmuyor.</p>
            <p className="text-sm mt-2">
              Önce şirket verilerini çekip, finansal oranları hesaplamanız gerekiyor.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}