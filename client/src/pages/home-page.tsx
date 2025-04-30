import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CompanySelector from "@/components/dashboard/company-selector";
import QuickActions from "@/components/dashboard/quick-actions";
import CreditInfo from "@/components/dashboard/credit-info";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Welcome message on first render
    if (user) {
      toast({
        title: "Hoş Geldiniz",
        description: `${user.username}, FinRatio platformuna hoş geldiniz.`,
      });
    }
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">Finansal Oran Analizi</h1>
            <p className="text-neutral-600 mt-1">Şirketlerin finansal oranlarını hesaplayın ve raporları indirin</p>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-3">
                <CompanySelector />
              </div>
              
              <div className="col-span-1 space-y-4">
                <QuickActions />
                <CreditInfo />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
