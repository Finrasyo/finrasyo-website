import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Report, Company } from "@shared/schema";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { formatDate } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  File, 
  Loader2,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { downloadReport, generateReport } from "@/lib/report-generation";

export default function ReportsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    company: { name: string; code: string | null; sector: string | null; id?: number };
    financialData: any;
    report?: Report;
  } | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<string>("pdf");
  
  const { 
    data: reports = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["/api/reports"],
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
  
  // Hata durumunu ele al
  useEffect(() => {
    if (error) {
      console.error("Raporlar yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Raporlar yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const getCompanyMap = async (reports: Report[]) => {
    // Benzersiz şirket ID'lerini al
    const companyIds = Array.from(new Set(reports.map(report => report.companyId)));
    
    // Fetch each company
    const companies: Record<number, Company> = {};
    
    for (const id of companyIds) {
      try {
        const res = await apiRequest("GET", `/api/companies/${id}`);
        const company = await res.json();
        companies[id] = company;
      } catch (error) {
        console.error(`Error fetching company ${id}:`, error);
      }
    }
    
    return companies;
  };

  const { 
    data: companyMap = {},
    isLoading: isLoadingCompanies 
  } = useQuery<Record<number, Company>>({
    queryKey: ["company-map"],
    queryFn: () => getCompanyMap(reports as Report[]),
    enabled: Array.isArray(reports) && reports.length > 0
  });

  // Type-safe filtreleme
  const filteredReports = Array.isArray(reports) 
    ? reports.filter(report => {
        const companyName = companyMap[report.companyId]?.name || "";
        return companyName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  const handleViewReport = async (report: Report) => {
    try {
      // Önce rapor verilerini yükle
      console.log("Rapor görüntüleme başlatılıyor:", report);
      
      const res = await apiRequest("GET", `/api/reports/${report.id}`);
      if (!res.ok) {
        throw new Error(`Rapor verileri yüklenemedi: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("Rapor verileri alındı:", data);
      
      if (!data || !data.company || !data.financialData) {
        throw new Error("Rapor verileri eksik veya hatalı");
      }
      
      // Şirket ve finansal verilerin eksiksiz olduğundan emin ol
      const reportData = {
        company: {
          name: data.company.name || "Bilinmeyen Şirket",
          code: data.company.code || null,
          sector: data.company.sector || null,
          id: data.company.id
        },
        financialData: data.financialData,
        report: data.report || report
      };
      
      setSelectedReport(reportData);
      setShowPreview(true);
    } catch (error) {
      console.error("Rapor görüntüleme hatası:", error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Rapor yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedReport) return;
    
    try {
      console.log("Rapor indirme işlemi başlatılıyor:", {
        company: selectedReport.company,
        format: downloadFormat,
        financialData: selectedReport.financialData
      });
      
      console.log("Rapor oluşturma işlemi için verileri hazırlıyorum");
      
      // Tarih formatını oluştur
      const dateStr = new Date().toISOString().split('T')[0];
      const sanitizedCompanyName = selectedReport.company.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Seçilen oranları al
      let selectedRatios: string[] = [];
      if (selectedReport.report) {
        try {
          // TypeScript uyumsuzluğunu gidermek için any kullan
          const reportAny = selectedReport.report as any;
          
          if (reportAny.metadata) {
            const metadata = typeof reportAny.metadata === 'string' 
              ? JSON.parse(reportAny.metadata) 
              : reportAny.metadata;
              
            if (metadata && metadata.ratio_ids && Array.isArray(metadata.ratio_ids)) {
              selectedRatios = metadata.ratio_ids;
              console.log("Seçilen oranlar:", selectedRatios);
            }
          }
        } catch (e) {
          console.warn("Rapor metadata'sı işlenirken hata:", e);
        }
      }
      
      try {
        // Dosya formatına göre uygun modülü yükle ve raporu oluştur
        switch (downloadFormat.toLowerCase()) {
          case "pdf":
            // PDF oluşturma modülünü içe aktar
            const { generatePDFReport, downloadPDFReport } = await import('../lib/pdf-generator');
            
            // Şirket bilgisini düzelt - id alanı için varsayılan değer ata
            const companyPdf = {
              ...selectedReport.company,
              id: selectedReport.company.id || 0
            };
            
            // PDF raporu oluştur
            const pdfBlob = await generatePDFReport(
              companyPdf, 
              selectedReport.financialData,
              selectedRatios
            );
            
            // PDF raporunu indir
            downloadPDFReport(pdfBlob, `${sanitizedCompanyName}_rapor_${dateStr}.pdf`);
            break;
            
          case "excel":
          case "xlsx":
            // Excel oluşturma modülünü içe aktar
            const { generateExcelReport, downloadExcelReport } = await import('../lib/excel-generator');
            
            // Şirket bilgisini düzelt - id alanı için varsayılan değer ata
            const companyExcel = {
              ...selectedReport.company,
              id: selectedReport.company.id || 0
            };
            
            // Excel raporu oluştur (seçilen oranları da ilet)
            const excelBlob = await generateExcelReport(
              companyExcel, 
              selectedReport.financialData,
              selectedRatios
            );
            
            // Excel raporunu indir
            downloadExcelReport(excelBlob, `${sanitizedCompanyName}_rapor_${dateStr}.xlsx`);
            break;
            
          default:
            // Diğer formatlarda rapor oluşturma (csv, vb.)
            const { generateReport, downloadReport } = await import('../components/financial/report-downloader');
            
            // Raporu oluştur
            const companyCsv = {
              ...selectedReport.company,
              id: selectedReport.company.id || 0 // id için varsayılan değer ekle
            };
            
            const result = await generateReport(
              selectedReport.financialData,
              company,
              downloadFormat
            );
            
            console.log("Rapor oluşturuldu, indiriliyor:", result);
            
            // Rapor indirme fonksiyonunu çağır
            downloadReport(result.blob, result.filename);
            break;
        }
        
        console.log(`${downloadFormat.toUpperCase()} raporu başarıyla oluşturuldu ve indirildi`);
      } catch (error) {
        console.error("Rapor oluşturma veya indirme hatası:", error);
        throw error; // Üst catch bloğuna hatayı ilet
      }
      
      toast({
        title: "Başarılı",
        description: "Rapor indirildi.",
      });
    } catch (error) {
      console.error("Rapor indirme hatası:", error);
      
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Rapor indirilemedi. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'xlsx':
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-blue-500" />;
      case 'docx':
      case 'word':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <File className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getReportTypeName = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'xlsx':
      case 'excel':
        return 'Excel';
      case 'csv':
        return 'CSV';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Raporlar</h1>
              <p className="text-neutral-600 mt-1">
                Oluşturduğunuz finansal analiz raporları
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>Tüm Raporlar</CardTitle>
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Şirket adına göre ara..."
                      className="pl-10 w-full md:w-60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        En yeniler
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        En eskiler
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Şirket adına göre
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading || isLoadingCompanies ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="py-10 text-center">
                  <p className="text-destructive">Raporlar yüklenirken bir hata oluştu.</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Tekrar Dene
                  </Button>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="py-10 text-center border rounded-md border-dashed">
                  <FileText className="h-12 w-12 mx-auto text-neutral-300" />
                  <h3 className="mt-4 text-lg font-medium text-neutral-800">Rapor Bulunamadı</h3>
                  {searchQuery ? (
                    <p className="mt-2 text-neutral-600">"{searchQuery}" araması için rapor bulunamadı.</p>
                  ) : (
                    <p className="mt-2 text-neutral-600">Henüz bir rapor oluşturmadınız.</p>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Şirket</TableHead>
                        <TableHead>Raporun Yılı</TableHead>
                        <TableHead>Oluşturulma Tarihi</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {companyMap[report.companyId]?.name || "Bilinmeyen Şirket"}
                          </TableCell>
                          <TableCell>
                            {report.financialYear || "-"}
                          </TableCell>
                          <TableCell>
                            {formatDate(report.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center w-fit gap-1">
                              {getReportTypeIcon(report.type)}
                              {getReportTypeName(report.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewReport(report)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rapor İndir</DialogTitle>
            <DialogDescription>
              Raporu istediğiniz formatta indirebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="mt-4">
              <div className="mb-4">
                <h3 className="font-medium text-neutral-800">
                  {selectedReport?.company?.name || "Şirket"} - 
                  {selectedReport?.financialData?.year || ""} Yılı Finansal Analizi
                </h3>
                <p className="text-sm text-neutral-500">
                  Oluşturulma Tarihi: {formatDate(selectedReport.report?.createdAt || new Date())}
                </p>
              </div>
              
              <Tabs defaultValue="pdf" value={downloadFormat} onValueChange={setDownloadFormat}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                  <TabsTrigger value="xlsx">Excel</TabsTrigger>
                  <TabsTrigger value="csv">CSV</TabsTrigger>
                </TabsList>
                
                <div className="p-4 border rounded-md bg-neutral-50">
                  <div className="flex justify-center items-center">
                    {downloadFormat === 'pdf' && (
                      <FileText className="h-16 w-16 text-red-500" />
                    )}

                    {downloadFormat === 'xlsx' && (
                      <FileSpreadsheet className="h-16 w-16 text-green-600" />
                    )}
                    {downloadFormat === 'csv' && (
                      <FileSpreadsheet className="h-16 w-16 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="text-center mt-2">
                    <p className="text-sm text-neutral-600">
                      {downloadFormat === 'pdf' && 'PDF formatında indirin. Tüm tarayıcılarda açılabilir.'}
  
                      {downloadFormat === 'xlsx' && 'Excel dosyası olarak indirin. Microsoft Excel veya benzeri yazılımlarla düzenlenebilir.'}
                      {downloadFormat === 'csv' && 'CSV (Virgülle Ayrılmış Değerler) formatında indirin. Herhangi bir tablolama yazılımıyla açılabilir.'}
                    </p>
                  </div>
                </div>
              </Tabs>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setShowPreview(false)}
                >
                  İptal
                </Button>
                <Button onClick={handleDownloadReport}>
                  <Download className="mr-2 h-4 w-4" />
                  {downloadFormat.toUpperCase()} İndir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
