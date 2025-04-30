import { useState, useEffect } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Company, FinancialData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import FinancialDataForm from "@/components/financial/financial-data-form";
import ResultsSection from "@/components/financial/results-section";
import { useFinancialData } from "@/hooks/use-financial-data";

export default function AnalysisPage() {
  const { id } = useParams();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const dataId = searchParams.get('data');
  
  const companyId = parseInt(id);
  const financialDataId = dataId ? parseInt(dataId) : null;
  
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { getFinancialData } = useFinancialData();
  
  const [calculatedData, setCalculatedData] = useState<FinancialData | null>(null);
  const [isEditing, setIsEditing] = useState(!financialDataId);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    data: company,
    isLoading: isLoadingCompany,
    error: companyError
  } = useQuery<Company>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !isNaN(companyId),
    onError: () => {
      toast({
        title: "Hata",
        description: "Şirket bilgileri yüklenemedi.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    const loadFinancialData = async () => {
      if (financialDataId) {
        setIsLoading(true);
        try {
          const data = await getFinancialData(financialDataId);
          setCalculatedData(data);
        } catch (error) {
          toast({
            title: "Hata",
            description: "Finansal veri yüklenemedi.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadFinancialData();
  }, [financialDataId]);

  const handleBack = () => {
    navigate(`/company/${companyId}`);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleFinancialDataSubmitted = (data: FinancialData) => {
    setCalculatedData(data);
    setIsEditing(false);
  };

  if (isLoadingCompany || isNaN(companyId) || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                Şirket Bulunamadı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Bu şirket bulunamadı veya erişim izniniz yok.</p>
              <Button onClick={() => navigate("/")}>Ana Sayfaya Dön</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Analysis Header */}
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Şirkete Dön
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="bg-primary-50 p-3 rounded-lg mr-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-800">
                    {company.name} - Finansal Analiz
                  </h1>
                  <p className="text-neutral-600">
                    {calculatedData ? 
                      `${calculatedData.year} Yılı Analizi • ${formatDate(calculatedData.createdAt)}` :
                      "Yeni Analiz"
                    }
                  </p>
                </div>
              </div>
              
              {calculatedData && !isEditing && (
                <div className="mt-4 md:mt-0">
                  <Button variant="outline" onClick={handleEdit}>
                    Düzenle
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Analysis Content */}
          {isEditing ? (
            <FinancialDataForm 
              companyId={companyId}
              initialData={calculatedData}
              onSubmitted={handleFinancialDataSubmitted}
            />
          ) : calculatedData ? (
            <ResultsSection 
              financialData={calculatedData}
              company={company}
            />
          ) : (
            <FinancialDataForm 
              companyId={companyId}
              onSubmitted={handleFinancialDataSubmitted}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
