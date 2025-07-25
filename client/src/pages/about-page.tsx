import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function AboutPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FinRasyo</h1>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900">
            Hakkımızda
          </h2>
        </div>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="prose max-w-none">
            <p className="text-lg text-center mb-6">
              FinRasyo araştırmacıların daha hızlı ve kolay araştırma yapabilmeleri için tasarlanmış olan bir finansal veri sunum platformudur. Çok sayıdaki orana saniyeler içerisinde ulaşabileceksiniz.
            </p>
            
            <p className="text-lg text-center font-medium mt-10">
              FinRasyo ile İyi Çalışmalar
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <form method="GET" action="/" className="inline-block">
              <input 
                type="submit" 
                value="Ana Sayfaya Dön"
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              />
            </form>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}