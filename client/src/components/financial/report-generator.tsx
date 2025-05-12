import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Download, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportGeneratorProps {
  results: any;
  companies: Array<{code: string, name: string, sector: string}>;
  years: number[];
  onGenerateReport: (format: string) => Promise<void>;
}

export default function ReportGenerator({
  results,
  companies,
  years,
  onGenerateReport
}: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      await onGenerateReport(reportType);
      
      toast({
        title: "Rapor Hazır",
        description: `Raporunuz ${reportType.toUpperCase()} formatında başarıyla oluşturuldu.`,
      });
      
    } catch (error: any) {
      console.error("Rapor oluşturma hatası:", error);
      toast({
        title: "Rapor Oluşturma Hatası",
        description: error.message || "Rapor oluşturulurken bir hata meydana geldi.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const getIconForType = () => {
    switch (reportType) {
      case "pdf":
        return <File className="h-5 w-5" />;
      case "excel":
        return <File className="h-5 w-5" />;
      case "csv":
        return <FileText className="h-5 w-5" />;
      case "word":
        return <File className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rapor Oluştur</CardTitle>
        <CardDescription>
          Analizinizi farklı formatlarda kaydedebilirsiniz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-800 mb-2">Analiz Özeti</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Şirketler:</span> {companies.map(c => c.name).join(', ')}</p>
              <p><span className="font-medium">Dönemler:</span> {years.map(y => y.toString()).join(', ')}</p>
              <p><span className="font-medium">Oran sayısı:</span> {Object.keys(results).length} adet</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="report-type" className="text-sm font-medium">
              Rapor Formatı
            </label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Format seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="word">Word</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rapor oluşturuluyor...
            </>
          ) : (
            <>
              {getIconForType()}
              <span className="ml-2">Rapor Oluştur</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}