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
  showPrepareButton?: boolean;
  onPrepare?: () => void;
  isPreparing?: boolean;
  price?: number;
  currency?: string;
}

export default function ReportFormatSelector({
  selectedFormat,
  onFormatSelect,
  showPrepareButton = false,
  onPrepare,
  isPreparing = false,
  price = 25,
  currency = "₺"
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
        
        {showPrepareButton && (
          <div className="mt-6 space-y-2">
            <Button 
              className="w-full" 
              onClick={onPrepare}
              disabled={isPreparing}
            >
              {isPreparing ? (
                <>
                  <FileDown className="mr-2 h-4 w-4 animate-pulse" />
                  Hazırlanıyor...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  HAZIRLA
                </>
              )}
            </Button>
            
            <div className="flex justify-between text-xs text-neutral-500">
              <span>
                Bu işlem ücretlidir
              </span>
              <span className="font-medium text-primary">
                Ücret: {price} {currency}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}