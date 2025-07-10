import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { BarChart3, FileUp, ChevronRight, Building, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const goToNewAnalysis = () => {
    navigate("/analysis-wizard");
  };
  
  const goToNewCompany = () => {
    navigate("/company/new");
  };
  
  useEffect(() => {
    // Welcome message on first render
    if (user) {
      toast({
        title: "Hoş Geldiniz",
        description: `${user.username}, FinRasyo platformuna hoş geldiniz.`,
      });
    }
    
    // Global click test
    const testGlobalClick = (e: any) => {
      console.log('Global click detected:', e.target.tagName, e.target.className);
      if (e.target.dataset.nav) {
        console.log('Navigation data found:', e.target.dataset.nav);
        window.location.href = e.target.dataset.nav;
      }
    };
    
    document.addEventListener('click', testGlobalClick);
    
    // Also test with timeout
    setTimeout(() => {
      console.log('HomePage mounted and ready');
    }, 1000);
    
    return () => document.removeEventListener('click', testGlobalClick);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Temporary Simple Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-primary font-bold text-xl">FinRasyo</span>
            </div>
            <div className="flex space-x-4">
              <a href="/about" className="text-neutral-600 hover:text-neutral-800 px-3 py-2">Hakkımızda</a>
              <a href="/how-it-works" className="text-neutral-600 hover:text-neutral-800 px-3 py-2">Nasıl Çalışır</a>
              <a href="/contact" className="text-neutral-600 hover:text-neutral-800 px-3 py-2">İletişim</a>
              <a href="/auth" className="bg-primary text-white px-4 py-2 rounded">Giriş Yap</a>
              <a href="/test.html" className="bg-red-500 text-white px-4 py-2 rounded ml-4">TEST</a>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-primary to-primary-600 bg-clip-text text-transparent">
                FinRasyo
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-600 mb-10">
                Finansal Analiz Kolaylaştı
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={goToNewAnalysis}>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Hemen Analiz Yap
                </Button>
                <Button variant="outline" size="lg" onClick={goToNewCompany}>
                  <FileUp className="mr-2 h-5 w-5" />
                  Şirket Ekle
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Kolay Finansal Analiz</h2>
              <p className="mt-4 text-lg text-neutral-600 max-w-3xl mx-auto">
                BIST şirketlerinin finansal verilerini analiz edin, raporlayın ve paylaşın
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Building className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Şirket Seçimi</CardTitle>
                  <CardDescription>
                    BIST'te işlem gören şirketler arasından seçim yapın veya kendi şirketinizi ekleyin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">
                    Borsa İstanbul'da işlem gören tüm şirketler için hazır finansal veriler ve özel şirketleriniz için veri girişi imkanı
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={goToNewCompany}>
                    Şirket Ekle <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Oran Analizi</CardTitle>
                  <CardDescription>
                    Likidite, Kaldıraç, Faaliyet ve Karlılık oranlarını hesaplayın
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">
                    Cari Oran, Asit-Test Oranı, Finansal Kaldıraç Oranı ve daha fazlasını tek tıkla hesaplayın
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={goToNewAnalysis}>
                    Analiz Yap <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Raporlama</CardTitle>
                  <CardDescription>
                    PDF, Excel, Word ve CSV formatlarında rapor oluşturun
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">
                    Hazır şablonlar ile profesyonel görünümlü raporlar oluşturun ve paylaşın
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate("/reports")}>
                    Raporlarım <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Hemen Finansal Analizlere Başlayın</h2>
              <p className="text-lg text-neutral-600 mb-8">
                İstediğiniz şirket, dönem ve oran için raporlar oluşturabilirsiniz. Ödemenizi sadece oluşturduğunuz raporlar için yapın.
              </p>
              <Button size="lg" onClick={goToNewAnalysis}>
                <BarChart3 className="mr-2 h-5 w-5" />
                Analiz Yapmaya Başla
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
