import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { StaticNavbar } from "@/components/layout/static-navbar";
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
    console.log('HomePage mounted and ready');
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <StaticNavbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-primary to-primary-600 bg-clip-text text-transparent">
                FinRasyo v3.0
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-600 mb-6">
                Finansal Analiz Kolaylaştı
              </p>
              <p className="text-sm text-red-600 mb-8 font-semibold">
                Static HTML Navigation - {new Date().toLocaleTimeString()}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" onClick={goToNewAnalysis}>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Hemen Analiz Yap
                </Button>
                <Button variant="outline" size="lg" onClick={goToNewCompany}>
                  <FileUp className="mr-2 h-5 w-5" />
                  Şirket Ekle
                </Button>
              </div>
              
              {/* CRITICAL NAVIGATION FIX */}
              <div className="bg-blue-100 border-4 border-blue-600 rounded-lg p-6 max-w-2xl mx-auto shadow-lg">
                <h3 className="font-bold text-blue-800 mb-4 text-lg">🔧 STATIC HTML NAVBAR</h3>
                <p className="text-blue-700 mb-4 text-sm">Pure HTML links - Cloudflare bypass</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-green-800 mb-2">Working:</h4>
                    <div className="text-sm text-green-700">
                      ✓ Static HTML navbar<br/>
                      ✓ Pure anchor tags<br/>
                      ✓ No JavaScript navigation
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-2">Test Links:</h4>
                    <div className="space-y-1 text-sm">
                      <div><a href="https://www.finrasyo.com/about" className="text-blue-600 hover:text-blue-800">About</a></div>
                      <div><a href="https://www.finrasyo.com/contact" className="text-blue-600 hover:text-blue-800">Contact</a></div>
                      <div><a href="https://www.finrasyo.com/how-it-works" className="text-blue-600 hover:text-blue-800">How it works</a></div>
                      <div><a href="/meta-refresh-test.html" className="text-purple-600 hover:text-purple-800 font-bold">🚀 Meta Refresh Test</a></div>
                      <div><a href="/iframe-nav-test.html" className="text-orange-600 hover:text-orange-800 font-bold">🔧 IFrame Test</a></div>
                      <div><a href="/final-emergency-nav.html" className="text-red-600 hover:text-red-800 font-bold">🚨 Emergency Navigation</a></div>
                      <div><a href="/cloudflare-fix-guide.html" className="text-green-600 hover:text-green-800 font-bold">🛠️ Cloudflare Fix Guide</a></div>
                      <div><a href="/dns-only-guide.html" className="text-emerald-600 hover:text-emerald-800 font-bold">⚡ DNS Only Mode Rehberi</a></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-4">
                  Profesyonel Finansal Analiz Araçları
                </h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  BIST şirketlerinin finansal verilerini analiz edin, profesyonel raporlar oluşturun
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Finansal Oran Analizi</CardTitle>
                    <CardDescription>
                      40+ finansal oranı otomatik hesaplama ve analiz etme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>• Likidite Oranları</li>
                      <li>• Karlılık Oranları</li>
                      <li>• Faaliyet Oranları</li>
                      <li>• Finansal Kaldıraç Oranları</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>BIST Şirket Verileri</CardTitle>
                    <CardDescription>
                      Borsa İstanbul'da işlem gören şirketlerin güncel verileri
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>• 500+ BIST Şirketi</li>
                      <li>• Güncel Mali Tablolar</li>
                      <li>• Sektörel Karşılaştırma</li>
                      <li>• Tarihsel Veri Analizi</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Profesyonel Raporlar</CardTitle>
                    <CardDescription>
                      PDF, Excel ve CSV formatlarında detaylı analiz raporları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>• PDF Analiz Raporları</li>
                      <li>• Excel Veri Dosyaları</li>
                      <li>• CSV Veri İhracı</li>
                      <li>• Özelleştirilebilir Şablonlar</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Hemen Başlayın
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Profesyonel finansal analiz araçlarını kullanmaya başlayın
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={goToNewAnalysis}>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Ücretsiz Analiz Başlat
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                  <ChevronRight className="mr-2 h-5 w-5" />
                  Daha Fazla Bilgi
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}