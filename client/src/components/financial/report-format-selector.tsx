import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table2, FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ReportFormat = "pdf" | "word" | "excel" | "csv";

// Rapor formatları hakkında bilgiler
export const formatInfo = {
  pdf: {
    name: "PDF Dosyası",
    description: "Profesyonel görünümlü, yazdırılabilir PDF raporu",
    icon: <FileText className="h-5 w-5 text-red-500" />,
    extension: ".pdf"
  },
  word: {
    name: "Word Dosyası",
    description: "Düzenlenebilir Microsoft Word belgesi",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    extension: ".docx"
  },
  excel: {
    name: "Excel Dosyası",
    description: "Detaylı analiz için Microsoft Excel çalışma sayfası",
    icon: <FileSpreadsheet className="h-5 w-5 text-green-600" />,
    extension: ".xlsx"
  },
  csv: {
    name: "CSV Dosyası",
    description: "Tüm sistemlerle uyumlu CSV veri dosyası",
    icon: <Table2 className="h-5 w-5 text-neutral-600" />,
    extension: ".csv"
  }
};

interface ReportFormatSelectorProps {
  selectedFormat: ReportFormat;
  onFormatSelect: (format: ReportFormat) => void;
  showDownloadButton?: boolean;
  onDownload?: () => void;
  isDownloading?: boolean;
  creditsRequired?: number;
  userCredits?: number;
}

export default function ReportFormatSelector({
  selectedFormat,
  onFormatSelect,
  showDownloadButton = false,
  onDownload,
  isDownloading = false,
  creditsRequired = 1,
  userCredits = 0
}: ReportFormatSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <FileDown className="mr-2 h-5 w-5" />
          Rapor Türü
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedFormat} 
          onValueChange={(value) => onFormatSelect(value as ReportFormat)}
          className="space-y-3"
        >
          {Object.entries(formatInfo).map(([format, info]) => (
            <div key={format} className="flex items-center space-x-2">
              <RadioGroupItem value={format} id={`format-${format}`} />
              <Label 
                htmlFor={`format-${format}`} 
                className="flex items-center cursor-pointer"
              >
                <span className="mr-2">{info.icon}</span>
                <div className="grid gap-0.5 leading-none">
                  <span className="text-sm font-medium">{info.name}</span>
                  <span className="text-xs text-neutral-500">
                    {info.description}
                  </span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {showDownloadButton && (
          <div className="mt-6 space-y-2">
            <Button 
              className="w-full" 
              onClick={onDownload}
              disabled={isDownloading || userCredits < creditsRequired}
            >
              {isDownloading ? (
                <>
                  <FileDown className="mr-2 h-4 w-4 animate-pulse" />
                  İndiriliyor...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Raporu İndir {formatInfo[selectedFormat].extension}
                </>
              )}
            </Button>
            
            <div className="flex justify-between text-xs text-neutral-500">
              <span>
                Bu işlem {creditsRequired} kredi gerektirir
              </span>
              <span className={userCredits < creditsRequired ? "text-red-500" : "text-green-600"}>
                Mevcut kredi: {userCredits}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}