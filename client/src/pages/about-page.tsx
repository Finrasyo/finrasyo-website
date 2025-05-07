import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
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
            <Button
              onClick={() => setLocation("/")}
              className="mt-4"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}