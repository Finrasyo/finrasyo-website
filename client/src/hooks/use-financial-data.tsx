import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FinancialData, InsertFinancialData, Company } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type FinancialDataContextType = {
  saveFinancialData: (data: Omit<InsertFinancialData, "userId">) => Promise<FinancialData>;
  getFinancialData: (id: number) => Promise<FinancialData>;
  getCompanyFinancialData: (companyId: number) => Promise<FinancialData[]>;
  generateReport: (
    companyId: number, 
    financialDataId: number, 
    type: string, 
    options?: {
      numCompanies?: number;
      numPeriods?: number;
      numRatios?: number;
      price?: number;
      reportName?: string;
    }
  ) => Promise<any>;
};

const FinancialDataContext = createContext<FinancialDataContextType | null>(null);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const saveFinancialDataMutation = useMutation({
    mutationFn: async (data: Omit<InsertFinancialData, "userId">) => {
      const res = await apiRequest("POST", "/api/financial-data", data);
      return await res.json();
    },
    onSuccess: (financialData: FinancialData) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${financialData.companyId}/financial-data`] });
      toast({
        title: "Finansal veri kaydedildi",
        description: "Finansal veriler başarıyla kaydedildi ve oranlar hesaplandı.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Finansal veri kaydedilemedi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async ({
      companyId,
      financialDataId,
      type,
      options,
    }: {
      companyId: number;
      financialDataId: number;
      type: string;
      options?: {
        numCompanies?: number;
        numPeriods?: number;
        numRatios?: number;
        price?: number;
        reportName?: string;
      };
    }) => {
      const reportName = options?.reportName || `Finansal Oran Raporu`;
      const res = await apiRequest("POST", "/api/reports", {
        companyId,
        financialDataId,
        format: type,
        name: reportName, // Gerekli name (isim) alanını ekledik
        type: 'financial', // Gerekli type (tür) alanını ekledik
        status: 'completed', // Durumu tamamlandı olarak işaretleyelim
        options: {
          numCompanies: options?.numCompanies || 1,
          numPeriods: options?.numPeriods || 1,
          numRatios: options?.numRatios || 1,
          price: options?.price || 0.25,
        }
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Rapor oluşturuldu",
        description: "Rapor başarıyla oluşturuldu.",
      });
      
      return data;
    },
    onError: (error: any) => {
      console.error("Rapor oluşturma hatası (useFinancialData):", error);
      
      // Daha ayrıntılı hata bilgisi göster
      let errorMessage = error.message || "Bilinmeyen bir hata oluştu";
      
      // Eğer varsa sunucu hata mesajını detaylı göster
      if (error.cause?.message) {
        errorMessage += ` - ${error.cause.message}`;
      }
      
      // Yanıttaki olası ek bilgileri kontrol et
      if (error.response && typeof error.response === 'object') {
        console.error("API yanıtı:", error.response);
      }
      
      toast({
        title: "Rapor oluşturulamadı",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const saveFinancialData = async (data: Omit<InsertFinancialData, "userId">) => {
    return await saveFinancialDataMutation.mutateAsync(data);
  };

  const getFinancialData = async (id: number) => {
    const res = await apiRequest("GET", `/api/financial-data/${id}`);
    return await res.json();
  };

  const getCompanyFinancialData = async (companyId: number) => {
    const res = await apiRequest("GET", `/api/companies/${companyId}/financial-data`);
    return await res.json();
  };

  const generateReport = async (
    companyId: number, 
    financialDataId: number, 
    type: string, 
    options?: {
      numCompanies?: number;
      numPeriods?: number;
      numRatios?: number;
      price?: number;
    }
  ) => {
    return await generateReportMutation.mutateAsync({
      companyId,
      financialDataId,
      type,
      options
    });
  };

  return (
    <FinancialDataContext.Provider
      value={{
        saveFinancialData,
        getFinancialData,
        getCompanyFinancialData,
        generateReport,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error("useFinancialData must be used within a FinancialDataProvider");
  }
  return context;
}
