import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function HowItWorksPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
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
            <a 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}