import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Report } from "@shared/schema";
import { formatInfo } from "@/components/financial/report-format-selector";
import { FileDown, CheckCircle, Share, AlertTriangle, RefreshCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const reportId = id ? parseInt(id) : NaN;
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Rapor hazırlanma durumu
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Rapor verilerini al
  const { 
    data: report,
    isLoading: isLoadingReport,
    error: reportError
  } = useQuery<Report & { url?: string; companyName?: string }>({
    queryKey: [`/api/reports/${reportId}`],
    enabled: !isNaN(reportId),
  });
  
  // Rapor hazırlanma simülasyonu
  useEffect(() => {
    if (isNaN(reportId)) return;
    
    let timer: NodeJS.Timeout;
    
    if (progress < 100 && !isReady && !isError) {
      timer = setTimeout(() => {
        const nextProgress = progress + 10;
        if (nextProgress >= 100) {
          setProgress(100);
          setIsReady(true);
        } else {
          setProgress(nextProgress);
        }
      }, 800);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [progress, isReady, isError, reportId]);
  
  // Raporu indir
  const handleDownload = () => {
    if (!report || !report.url) return;
    
    // Gerçek dosya indirme işlemi
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}${report.url}`;
    
    // Yeni sekme açarak dosyayı indir
    window.open(fileUrl, '_blank');
    
    toast({
      title: "Rapor İndiriliyor",
      description: `${report.companyName || 'Rapor'} başarıyla indiriliyor...`,
    });
    
    // İndirme simülasyonu
    setTimeout(() => {
      toast({
        title: "Rapor İndirildi",
        description: `Rapor başarıyla indirildi.`,
        variant: "default",
      });
    }, 1500);
  };
  
  // Raporu paylaş
  const handleShare = () => {
    if (!report) return;
    
    // URL'yi kopyala
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Bağlantı Kopyalandı",
        description: "Rapor bağlantısı panoya kopyalandı.",
      });
    });
  };
  
  if (isNaN(reportId)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Geçersiz Rapor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Rapor bulunamadı veya geçersiz bir rapor kimliği.</p>
              <Button onClick={() => navigate("/")} className="w-full">
                Ana Sayfaya Dön
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (isLoadingReport) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Rapor Yükleniyor</CardTitle>
              <CardDescription>Rapor bilgileri alınıyor...</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={30} className="mb-4" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (reportError || !report) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Rapor Bulunamadı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Bu rapor bulunamadı veya erişim izniniz yok.</p>
              <Button onClick={() => navigate("/")} className="w-full">
                Ana Sayfaya Dön
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Format bilgisini al
  const format = report?.format || "pdf";
  const formatData = formatInfo[format as keyof typeof formatInfo];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Raporunuz</CardTitle>
              <CardDescription>
                {report.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isReady ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Rapor Hazırlanıyor...</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="mb-4" />
                  <p className="text-sm text-neutral-500">
                    Raporunuz hazırlanıyor, lütfen bekleyin. Bu işlem birkaç dakika sürebilir.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-green-800">Rapor Hazır</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Raporunuz başarıyla hazırlandı. Aşağıdaki düğmeleri kullanarak raporunuzu indirebilir veya paylaşabilirsiniz.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Oluşturulma Tarihi</h3>
                      <p className="text-neutral-800">{formatDate(report.createdAt)}</p>
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Rapor Formatı</h3>
                      <div className="flex items-center">
                        {formatData.icon}
                        <span className="ml-2">{formatData.name}</span>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Şirket</h3>
                      <p className="text-neutral-800">{report.companyName}</p>
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Ödeme Durumu</h3>
                      <p className="text-green-600 font-medium">Ödendi</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button 
                className="w-full" 
                onClick={handleDownload}
                disabled={!isReady}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Raporu İndir
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleShare}
                disabled={!isReady}
              >
                <Share className="mr-2 h-4 w-4" />
                Paylaş
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Yeni Analiz Oluştur
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}