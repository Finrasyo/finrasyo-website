import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ArrowRight, BarChart3, Clock } from "lucide-react";
import { bistCompanies } from "@/data/bist-companies";
import { useToast } from "@/hooks/use-toast";
import MultiCompanySelectorWithAutocomplete from "@/components/financial/multi-company-selector-with-autocomplete";
import YearSelector from "@/components/financial/year-selector";

interface Company {
  code: string;
  name: string;
  sector: string;
}

export default function AnalysisSelectionPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  
  const handleCompanySelection = (companies: Company[]) => {
    setSelectedCompanies(companies);
  };
  
  const handleYearSelection = (years: number[]) => {
    setSelectedYears(years);
  };
  
  const handleContinue = () => {
    if (selectedCompanies.length === 0) {
      toast({
        title: "Şirket Seçiniz",
        description: "Lütfen en az bir şirket seçin",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedYears.length === 0) {
      toast({
        title: "Dönem Seçiniz",
        description: "Lütfen en az bir finansal dönem seçin",
        variant: "destructive"
      });
      return;
    }
    
    // Seçimleri localStorage'a kaydet
    localStorage.setItem('selectedCompanies', JSON.stringify(selectedCompanies));
    localStorage.setItem('selectedYears', JSON.stringify(selectedYears));
    
    // Doğrudan analiz sihirbazına yönlendir
    navigate("/analysis-wizard");
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-6">Analiz İçin Şirket ve Dönem Seçimi</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Şirket Seçimi */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Şirket Seçimi</CardTitle>
                <CardDescription>
                  Analiz etmek istediğiniz şirketleri seçin (birden fazla seçim yapabilirsiniz)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiCompanySelectorWithAutocomplete 
                  onSelectCompanies={handleCompanySelection}
                  initialSelectedCompanies={selectedCompanies}
                  maxCompanies={10}
                />
              </CardContent>
            </Card>
            
            {/* Dönem Seçimi */}
            <Card>
              <CardHeader>
                <CardTitle>Dönem Seçimi</CardTitle>
                <CardDescription>
                  Analiz etmek istediğiniz finansal dönemleri seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <YearSelector
                  onSelectYears={handleYearSelection}
                  yearCount={5}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Özet ve Devam Et */}
          <div className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Özet</h3>
                    <p className="text-neutral-600 mt-1">
                      {selectedCompanies.length} şirket ve {selectedYears.length} dönem seçildi
                    </p>
                  </div>
                  <Button 
                    className="mt-4 md:mt-0" 
                    size="lg" 
                    onClick={handleContinue}
                    disabled={selectedCompanies.length === 0 || selectedYears.length === 0}
                  >
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Oran Seçimine Devam Et
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}