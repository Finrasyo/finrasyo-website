import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FinancialData } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, calculatePercentageChange } from "@/lib/utils";
import { Download, ArrowUp, ArrowDown, Loader2, AlertCircle } from "lucide-react";

interface HistoricalDataProps {
  companyId: number;
  companyName: string;
}

export default function HistoricalData({ companyId, companyName }: HistoricalDataProps) {
  const [_, navigate] = useLocation();
  const [yearRange, setYearRange] = useState<string>("3");
  
  const {
    data: financialData = [],
    isLoading,
    error
  } = useQuery<FinancialData[]>({
    queryKey: [`/api/companies/${companyId}/financial-data`],
    enabled: !isNaN(companyId),
  });
  
  // Sort data by year in descending order
  const sortedData = [...financialData].sort((a, b) => b.year - a.year);
  
  // Limit data by selected year range
  const limitedData = yearRange === "all" 
    ? sortedData 
    : sortedData.slice(0, parseInt(yearRange));
  
  const handleRowClick = (dataId: number) => {
    navigate(`/analysis/${companyId}?data=${dataId}`);
  };
  
  const getChangeIndicator = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    
    const percentChange = calculatePercentageChange(current, previous);
    const isPositive = percentChange > 0;
    
    return (
      <span className={`inline-flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowUp className="mr-1 h-3 w-3" />
        ) : (
          <ArrowDown className="mr-1 h-3 w-3" />
        )}
        %{Math.abs(percentChange).toFixed(1)}
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geçmiş Dönem Karşılaştırması</CardTitle>
          <CardDescription>Veriler yükleniyor...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geçmiş Dönem Karşılaştırması</CardTitle>
          <CardDescription>Bir hata oluştu</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="mt-4 text-destructive">Finansal veriler yüklenirken bir hata oluştu.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (financialData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geçmiş Dönem Karşılaştırması</CardTitle>
          <CardDescription>Henüz veri bulunmamaktadır</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-neutral-600">
            {companyName} için henüz finansal analiz yapılmamış.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => navigate(`/analysis/${companyId}`)}
          >
            İlk Analizi Oluştur
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Geçmiş Dönem Karşılaştırması</CardTitle>
          <CardDescription>Son yılların finansal oran karşılaştırması</CardDescription>
        </div>
        <div className="mt-4 sm:mt-0">
          <Select value={yearRange} onValueChange={setYearRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Dönem Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Son 3 yıl</SelectItem>
              <SelectItem value="5">Son 5 yıl</SelectItem>
              <SelectItem value="all">Tüm geçmiş</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dönem</TableHead>
                  <TableHead>Cari Oran</TableHead>
                  <TableHead>Likidite Oranı</TableHead>
                  <TableHead>Asit-Test Oranı</TableHead>
                  <TableHead>Değişim</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limitedData.map((data, index) => {
                  const previousYear = limitedData[index + 1];
                  const percentChange = previousYear 
                    ? calculatePercentageChange(data.currentRatio, previousYear.currentRatio)
                    : 0;
                  
                  return (
                    <TableRow 
                      key={data.id}
                      className="cursor-pointer hover:bg-neutral-50"
                      onClick={() => handleRowClick(data.id)}
                    >
                      <TableCell className="font-medium">
                        {data.year}
                      </TableCell>
                      <TableCell>
                        {data.currentRatio.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {data.liquidityRatio.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {data.acidTestRatio.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getChangeIndicator(data.currentRatio, previousYear?.currentRatio)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/analysis/${companyId}?data=${data.id}`);
                        }}>
                          <Download className="h-4 w-4 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
