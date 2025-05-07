import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FinRasyo</h1>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900">
            Nasıl Çalışır
          </h2>
        </div>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="prose max-w-none">
            <p className="text-lg text-center mb-8">
              Sisteme giriş yaptığınızda ilgili firmaları, dönem bilgilerini ve istediğiniz oranları seçtikten sonra sistem size verilerin toplam maliyetini bildirecektir. Ödeme sayfasına yönlendirildikten sonra ödemenizi yaparak istediğiniz formatta verilerinizi indirebilirsiniz.
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