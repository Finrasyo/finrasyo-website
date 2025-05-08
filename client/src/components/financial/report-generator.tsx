import { useState } from "react";
import { useFinancialData } from "@/hooks/use-financial-data";
import { useToast } from "@/hooks/use-toast";
import { Company, FinancialData } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, FileText, FileSpreadsheet, AlertCircle } from "lucide-react";
import { exportReport } from "@/lib/report-generation";
import { PriceCalculator } from "./price-calculator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReportGeneratorProps {
  financialData: FinancialData;
  company: Company;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportGenerator({
  financialData,
  company,
  isOpen,
  onClose
}: ReportGeneratorProps) {
  const { generateReport: generateReportAPI } = useFinancialData();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [reportFormat, setReportFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Dinamik fiyatlandırma değişkenleri
  const [numCompanies, setNumCompanies] = useState(1);
  const [numPeriods, setNumPeriods] = useState(1);
  const [numRatios, setNumRatios] = useState(3); // Varsayılan olarak 3 oran
  const [totalPrice, setTotalPrice] = useState(0.75); // Varsayılan fiyat
  const [requiredCredits, setRequiredCredits] = useState(1); // Varsayılan kredi
  
  // Fiyat değişimini yönet
  const handlePriceChange = (price: number, credits: number) => {
    setTotalPrice(price);
    setRequiredCredits(credits);
  };
  
  const handleGenerate = async () => {
    if (!user) return;
    
    // Admin kullanıcılar için kredi kontrolü yapılmaz
    const isAdmin = user.role === "admin";
    
    // Admin değilse ve yeterli kredisi yoksa işlemi durdur
    if (!isAdmin && (user.credits || 0) < requiredCredits) {
      toast({
        title: "Yetersiz Kredi",
        description: `Rapor oluşturmak için ${requiredCredits} kredi gerekiyor, ancak hesabınızda ${user.credits || 0} kredi bulunmaktadır. Lütfen kredi satın alın.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Generate report on the server
      await generateReportAPI(company.id, financialData.id, reportFormat, {
        numCompanies,
        numPeriods,
        numRatios,
        price: totalPrice
      });
      
      // Generate and download the report on the client side
      const companyInfo = {
        name: company.name,
        code: company.code || "Bilinmiyor",
        sector: company.sector || "Genel"
      };
      
      // Raporu doğrudan indir
      await exportReport(reportFormat as any, companyInfo, financialData);
      
      toast({
        title: "Rapor Oluşturuldu",
        description: isAdmin 
          ? "Rapor başarıyla oluşturuldu." 
          : `Rapor başarıyla oluşturuldu ve ${requiredCredits} kredi kullanıldı.`,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Rapor oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rapor İndir</DialogTitle>
          <DialogDescription>
            Raporu indirmek için format seçin ve indir butonuna tıklayın.
            {user?.role === "admin" 
              ? "Admin olarak rapor oluşturma işlemi ücretsizdir." 
              : "Her indirme işlemi 1 kredi kullanır."}
          </DialogDescription>
        </DialogHeader>
        
        {user?.role !== "admin" && (
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm font-medium text-neutral-700">
              Kalan Krediniz: {user?.credits || 0}
            </div>
          </div>
        )}
        
        <Tabs value={reportFormat} onValueChange={setReportFormat}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="docx">Word</TabsTrigger>
            <TabsTrigger value="xlsx">Excel</TabsTrigger>
            <TabsTrigger value="csv">CSV</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pdf" className="mt-4">
            <div className="flex justify-center items-center py-8 bg-neutral-50 rounded-md border">
              <div className="text-center">
                <FileText className="h-16 w-16 text-red-500 mx-auto" />
                <h3 className="mt-2 font-medium text-neutral-800">PDF Raporu</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  PDF formatı tüm cihazlarda görüntülenebilir ve yazdırılabilir.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="docx" className="mt-4">
            <div className="flex justify-center items-center py-8 bg-neutral-50 rounded-md border">
              <div className="text-center">
                <FileText className="h-16 w-16 text-blue-600 mx-auto" />
                <h3 className="mt-2 font-medium text-neutral-800">Word Raporu</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Word formatı düzenlenebilir bir belge sağlar.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="xlsx" className="mt-4">
            <div className="flex justify-center items-center py-8 bg-neutral-50 rounded-md border">
              <div className="text-center">
                <FileSpreadsheet className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="mt-2 font-medium text-neutral-800">Excel Raporu</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Excel formatı ileri düzey analiz için uygundur.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="csv" className="mt-4">
            <div className="flex justify-center items-center py-8 bg-neutral-50 rounded-md border">
              <div className="text-center">
                <FileSpreadsheet className="h-16 w-16 text-blue-500 mx-auto" />
                <h3 className="mt-2 font-medium text-neutral-800">CSV Raporu</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  CSV formatı diğer sistemlerle uyumlu veri sağlar.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Fiyatlandırma hesaplayıcı */}
        <div className="mt-4">
          <h3 className="font-medium text-base mb-2">Fiyatlandırma</h3>
          <PriceCalculator 
            onPriceChange={handlePriceChange}
            initialCompanies={numCompanies}
            initialPeriods={numPeriods}
            initialRatios={numRatios}
          />
          
          {!user?.role || user.role !== "admin" ? (
            <Alert variant="default" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bu rapor için {requiredCredits} kredi gerekecek.
                {user?.credits && user.credits < requiredCredits ? 
                  ` Hesabınızda yeterli kredi bulunmuyor (${user.credits}/${requiredCredits}).` : 
                  ''}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            İptal
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || (!user?.role || user.role !== "admin") && (user?.credits || 0) < requiredCredits}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {user?.role === "admin" ? "İndir" : `İndir (${requiredCredits} Kredi)`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
