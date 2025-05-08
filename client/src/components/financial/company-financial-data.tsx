import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChevronUp, 
  ChevronDown, 
  AlertTriangle, 
  File, 
  BarChart4, 
  PieChart 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CompanyFinancialDataProps {
  companyCode: string;
  companyName: string;
}

interface FinancialData {
  currentPrice?: { value: number; source: string };
  priceChange?: { value: string; source: string };
  financialData?: any;
  keyStatistics?: any;
  balanceSheet?: any[];
  incomeStatement?: any[];
  cashflowStatement?: any[];
  metrics?: Record<string, string>;
  lastUpdated?: string;
  sector?: string;
}

export default function CompanyFinancialData({ 
  companyCode, 
  companyName 
}: CompanyFinancialDataProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("genel");
  const { toast } = useToast();

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiRequest("GET", `/api/company-financials/${companyCode}`);
        
        if (!response.ok) {
          throw new Error("Finansal veriler alınamadı");
        }
        
        const data = await response.json();
        setFinancialData(data);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        setError("Finansal veriler yüklenirken bir hata oluştu.");
        
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Finansal veriler yüklenirken bir hata oluştu.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (companyCode) {
      fetchFinancialData();
    }
  }, [companyCode, toast]);

  // Finansal metrik format fonksiyonu
  const formatMetric = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return "N/A";
    
    if (typeof value === "number") {
      // 1000000 -> 1M, 1000 -> 1K
      if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(2) + "M";
      } else if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(2) + "K";
      }
      return value.toFixed(2);
    }
    
    return value.toString();
  };

  // Yüzde değişimi renderla (+ yeşil yukarı, - kırmızı aşağı)
  const renderPercentChange = (value: string | undefined) => {
    if (!value) return null;
    
    const isPositive = !value.includes("-");
    const className = isPositive ? "text-green-600" : "text-red-600";
    const Icon = isPositive ? ChevronUp : ChevronDown;
    
    return (
      <div className={`flex items-center ${className}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span>{value.replace("-", "")}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Hata</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{companyName} ({companyCode})</CardTitle>
            <CardDescription>
              {financialData?.sector || "Finansal Veriler"}
              {financialData?.lastUpdated && ` • Son Güncelleme: ${financialData.lastUpdated}`}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {financialData?.currentPrice?.value ? `₺${financialData.currentPrice.value.toFixed(2)}` : "N/A"}
            </div>
            {renderPercentChange(financialData?.priceChange?.value)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="genel" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-4 overflow-auto">
            <TabsTrigger value="genel">
              <File className="h-4 w-4 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="oranlar">
              <BarChart4 className="h-4 w-4 mr-2" />
              Oran Analizleri
            </TabsTrigger>
            <TabsTrigger value="gelir-tablosu">
              <PieChart className="h-4 w-4 mr-2" />
              Gelir Tablosu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="genel" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Şirket Özeti</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metrik</TableHead>
                    <TableHead>Değer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData?.keyStatistics ? (
                    Object.entries(financialData.keyStatistics)
                      .slice(0, 10) // İlk 10 istatistiği göster
                      .map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{formatMetric(value as any)}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        İstatistik bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="oranlar" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Finansal Oranlar</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oran</TableHead>
                    <TableHead>Değer</TableHead>
                    <TableHead>Yorumu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData?.metrics ? (
                    Object.entries(financialData.metrics).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{value}</TableCell>
                        <TableCell>
                          {/* Finansal oranları yorumla */}
                          {key.includes("Cari Oran") 
                            ? parseFloat(value as string) > 2 
                              ? "Çok iyi" 
                              : parseFloat(value as string) > 1 
                                ? "İyi" 
                                : "Dikkat edilmeli"
                            : ""}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Finansal oranlar bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="gelir-tablosu" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Gelir Tablosu</h3>
              {financialData?.incomeStatement && financialData.incomeStatement.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kalem</TableHead>
                      <TableHead>Değer (₺)</TableHead>
                      <TableHead>Değişim (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(financialData.incomeStatement[0]).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{formatMetric(value as any)}</TableCell>
                        <TableCell>
                          {financialData.incomeStatement && financialData.incomeStatement.length > 1
                            ? renderPercentChange(
                                calculatePercentChange(
                                  value as any,
                                  financialData.incomeStatement[1][key] as any
                                )
                              )
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Gelir tablosu verisi bulunamadı
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Yüzde değişimi hesapla
function calculatePercentChange(current: number, previous: number): string {
  if (!current || !previous || isNaN(current) || isNaN(previous)) return "N/A";
  
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
}