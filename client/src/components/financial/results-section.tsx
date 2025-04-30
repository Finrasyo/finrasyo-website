import { useState } from "react";
import { useFinancialData } from "@/hooks/use-financial-data";
import { useToast } from "@/hooks/use-toast";
import { Company, FinancialData } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronDown } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";
import { generateRatioAnalysis } from "@/lib/financial-calculations";
import RatioCard from "./ratio-card";
import ReportGenerator from "./report-generator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResultsSectionProps {
  financialData: FinancialData;
  company: Company;
}

export default function ResultsSection({ financialData, company }: ResultsSectionProps) {
  const { toast } = useToast();
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  
  const analysis = generateRatioAnalysis(
    financialData.currentRatio,
    financialData.liquidityRatio,
    financialData.acidTestRatio,
    company.name
  );
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Hesaplanan Finansal Oranlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Ratio Card */}
            <RatioCard
              title="Cari Oran"
              value={financialData.currentRatio}
              type="currentRatio"
              formula="Dönen Varlıklar / Kısa Vadeli Yükümlülükler"
              formulaValues={`${formatNumber(financialData.totalCurrentAssets)} ₺ / ${formatNumber(financialData.totalCurrentLiabilities)} ₺`}
            />
            
            {/* Liquidity Ratio Card */}
            <RatioCard
              title="Likidite Oranı"
              value={financialData.liquidityRatio}
              type="liquidityRatio"
              formula="(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler"
              formulaValues={`(${formatNumber(financialData.totalCurrentAssets)} ₺ - ${formatNumber(financialData.inventory)} ₺) / ${formatNumber(financialData.totalCurrentLiabilities)} ₺`}
            />
            
            {/* Acid-Test Ratio Card */}
            <RatioCard
              title="Asit-Test Oranı"
              value={financialData.acidTestRatio}
              type="acidTestRatio"
              formula="Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler"
              formulaValues={`${formatNumber(financialData.cashAndEquivalents)} ₺ / ${formatNumber(financialData.totalCurrentLiabilities)} ₺`}
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-semibold text-neutral-800 mb-4">Oran Yorumu ve Özet</h3>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-700" dangerouslySetInnerHTML={{ __html: analysis }}></p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div>
              <span className="text-sm text-neutral-600">
                Rapor Hazırlama Tarihi: {formatDate(new Date())}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" /> Yazdır
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center">
                    <Download className="mr-2 h-4 w-4" /> İndir <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowReportGenerator(true)}>
                    PDF olarak indir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowReportGenerator(true)}>
                    Word belgesi olarak indir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowReportGenerator(true)}>
                    Excel olarak indir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowReportGenerator(true)}>
                    CSV olarak indir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showReportGenerator && (
        <ReportGenerator
          financialData={financialData}
          company={company}
          isOpen={showReportGenerator}
          onClose={() => setShowReportGenerator(false)}
        />
      )}
    </>
  );
}
