import { useState, useEffect } from "react";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileDown, RefreshCw, BarChart3, FileText } from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import * as ratios from "@/lib/financial-ratios";

interface CompanyFinancialDataProps {
  companyCode: string;
  companyName: string;
}

interface FinancialData {
  stockCode: string;
  companyName: string;
  currentPrice: {
    value: number;
    source: string;
  };
  priceChange: {
    value: string;
    source: string;
  };
  financialData: any;
  keyStatistics: any;
  balanceSheet: any[];
  incomeStatement: any[];
  cashflowStatement: any[];
  metrics: Record<string, string>;
  lastUpdated: string;
  sector: string;
}

export default function CompanyFinancialData({ companyCode, companyName }: CompanyFinancialDataProps) {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [calculatedRatios, setCalculatedRatios] = useState<Record<string, number | null>>({});
  
  // Şirket verilerini getir
  const fetchCompanyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Not: Gerçek bir API'den veri almak yerine, JSON dosyasını okuyacağız
      // Ama bu hızlı prototip için yapay bir API çağrısı benzeri gecikme ekliyoruz
      // Gerçek uygulamada bu kısım API çağrısı olacak
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Statik JSON dosyasından veri oku (normalde bir API'den gelecek)
      const response = await axios.get(`/api/company-financials/${companyCode}`);
      
      // API yanıtını kontrol et
      if (response.status !== 200) {
        throw new Error("Veri alınamadı");
      }
      
      const financialData = response.data;
      setData(financialData);
      
      // Finansal oranları hesapla
      if (financialData && financialData.balanceSheet && financialData.balanceSheet.length > 0) {
        calculateFinancialRatios(financialData);
      }
    } catch (err) {
      console.error("Veri alma hatası:", err);
      setError("Şirket finansal verileri alınamadı. Lütfen daha sonra tekrar deneyin.");
      
      // Test için veri oluştur - sadece geliştirme/demo amaçlı
      generateDummyData();
    } finally {
      setLoading(false);
    }
  };
  
  // Geliştirme/demo amaçlı test verisi oluştur
  // Gerçek uygulamada bu fonksiyon kaldırılacak
  const generateDummyData = () => {
    const dummyData: FinancialData = {
      stockCode: companyCode,
      companyName: companyName,
      currentPrice: {
        value: 42.5,
        source: "Test"
      },
      priceChange: {
        value: "+0.25 (0.59%)",
        source: "Test"
      },
      financialData: {
        totalCash: 1500000000,
        totalDebt: 950000000,
        operatingCashflow: 650000000,
        returnOnAssets: 0.12,
        returnOnEquity: 0.18,
        grossMargins: 0.42,
        profitMargins: 0.15
      },
      keyStatistics: {
        enterpriseValue: 10500000000,
        marketCap: 8500000000,
        pegRatio: 1.2,
        priceToBook: 2.1,
        enterpriseToRevenue: 3.2,
        enterpriseToEbitda: 8.5,
        forwardPE: 12.5,
        trailingPE: 14.2
      },
      balanceSheet: [
        {
          endDate: { raw: 1640908800, fmt: "31/12/2021" },
          cash: { raw: 850000000, fmt: "850.000.000 ₺" },
          shortTermInvestments: { raw: 270000000, fmt: "270.000.000 ₺" },
          netReceivables: { raw: 520000000, fmt: "520.000.000 ₺" },
          inventory: { raw: 340000000, fmt: "340.000.000 ₺" },
          totalCurrentAssets: { raw: 2100000000, fmt: "2.100.000.000 ₺" },
          propertyPlantEquipment: { raw: 4200000000, fmt: "4.200.000.000 ₺" },
          totalAssets: { raw: 7500000000, fmt: "7.500.000.000 ₺" },
          accountsPayable: { raw: 320000000, fmt: "320.000.000 ₺" },
          shortLongTermDebt: { raw: 180000000, fmt: "180.000.000 ₺" },
          totalCurrentLiabilities: { raw: 900000000, fmt: "900.000.000 ₺" },
          longTermDebt: { raw: 1650000000, fmt: "1.650.000.000 ₺" },
          totalLiabilities: { raw: 3200000000, fmt: "3.200.000.000 ₺" },
          totalStockholderEquity: { raw: 4300000000, fmt: "4.300.000.000 ₺" }
        },
        {
          endDate: { raw: 1609459200, fmt: "31/12/2020" },
          cash: { raw: 750000000, fmt: "750.000.000 ₺" },
          shortTermInvestments: { raw: 220000000, fmt: "220.000.000 ₺" },
          netReceivables: { raw: 480000000, fmt: "480.000.000 ₺" },
          inventory: { raw: 310000000, fmt: "310.000.000 ₺" },
          totalCurrentAssets: { raw: 1900000000, fmt: "1.900.000.000 ₺" },
          propertyPlantEquipment: { raw: 3900000000, fmt: "3.900.000.000 ₺" },
          totalAssets: { raw: 6800000000, fmt: "6.800.000.000 ₺" },
          accountsPayable: { raw: 290000000, fmt: "290.000.000 ₺" },
          shortLongTermDebt: { raw: 160000000, fmt: "160.000.000 ₺" },
          totalCurrentLiabilities: { raw: 820000000, fmt: "820.000.000 ₺" },
          longTermDebt: { raw: 1550000000, fmt: "1.550.000.000 ₺" },
          totalLiabilities: { raw: 2950000000, fmt: "2.950.000.000 ₺" },
          totalStockholderEquity: { raw: 3850000000, fmt: "3.850.000.000 ₺" }
        }
      ],
      incomeStatement: [
        {
          endDate: { raw: 1640908800, fmt: "31/12/2021" },
          totalRevenue: { raw: 3200000000, fmt: "3.200.000.000 ₺" },
          costOfRevenue: { raw: 1850000000, fmt: "1.850.000.000 ₺" },
          grossProfit: { raw: 1350000000, fmt: "1.350.000.000 ₺" },
          operatingIncome: { raw: 850000000, fmt: "850.000.000 ₺" },
          interestExpense: { raw: 120000000, fmt: "120.000.000 ₺" },
          incomeBeforeTax: { raw: 730000000, fmt: "730.000.000 ₺" },
          incomeTaxExpense: { raw: 240000000, fmt: "240.000.000 ₺" },
          netIncomeFromContinuingOperations: { raw: 490000000, fmt: "490.000.000 ₺" },
          netIncome: { raw: 490000000, fmt: "490.000.000 ₺" }
        },
        {
          endDate: { raw: 1609459200, fmt: "31/12/2020" },
          totalRevenue: { raw: 2900000000, fmt: "2.900.000.000 ₺" },
          costOfRevenue: { raw: 1700000000, fmt: "1.700.000.000 ₺" },
          grossProfit: { raw: 1200000000, fmt: "1.200.000.000 ₺" },
          operatingIncome: { raw: 750000000, fmt: "750.000.000 ₺" },
          interestExpense: { raw: 110000000, fmt: "110.000.000 ₺" },
          incomeBeforeTax: { raw: 640000000, fmt: "640.000.000 ₺" },
          incomeTaxExpense: { raw: 210000000, fmt: "210.000.000 ₺" },
          netIncomeFromContinuingOperations: { raw: 430000000, fmt: "430.000.000 ₺" },
          netIncome: { raw: 430000000, fmt: "430.000.000 ₺" }
        }
      ],
      cashflowStatement: [
        {
          endDate: { raw: 1640908800, fmt: "31/12/2021" },
          netIncome: { raw: 490000000, fmt: "490.000.000 ₺" },
          depreciation: { raw: 280000000, fmt: "280.000.000 ₺" },
          changeToAccountReceivables: { raw: -40000000, fmt: "-40.000.000 ₺" },
          changeToInventory: { raw: -30000000, fmt: "-30.000.000 ₺" },
          changeToOperatingActivities: { raw: 65000000, fmt: "65.000.000 ₺" },
          totalCashFromOperatingActivities: { raw: 680000000, fmt: "680.000.000 ₺" },
          capitalExpenditures: { raw: -520000000, fmt: "-520.000.000 ₺" },
          totalCashFromInvestingActivities: { raw: -550000000, fmt: "-550.000.000 ₺" },
          netBorrowings: { raw: 120000000, fmt: "120.000.000 ₺" },
          dividendsPaid: { raw: -150000000, fmt: "-150.000.000 ₺" },
          totalCashFromFinancingActivities: { raw: -30000000, fmt: "-30.000.000 ₺" },
          changeInCash: { raw: 100000000, fmt: "100.000.000 ₺" }
        },
        {
          endDate: { raw: 1609459200, fmt: "31/12/2020" },
          netIncome: { raw: 430000000, fmt: "430.000.000 ₺" },
          depreciation: { raw: 260000000, fmt: "260.000.000 ₺" },
          changeToAccountReceivables: { raw: -35000000, fmt: "-35.000.000 ₺" },
          changeToInventory: { raw: -25000000, fmt: "-25.000.000 ₺" },
          changeToOperatingActivities: { raw: 60000000, fmt: "60.000.000 ₺" },
          totalCashFromOperatingActivities: { raw: 620000000, fmt: "620.000.000 ₺" },
          capitalExpenditures: { raw: -480000000, fmt: "-480.000.000 ₺" },
          totalCashFromInvestingActivities: { raw: -510000000, fmt: "-510.000.000 ₺" },
          netBorrowings: { raw: 150000000, fmt: "150.000.000 ₺" },
          dividendsPaid: { raw: -120000000, fmt: "-120.000.000 ₺" },
          totalCashFromFinancingActivities: { raw: 30000000, fmt: "30.000.000 ₺" },
          changeInCash: { raw: 140000000, fmt: "140.000.000 ₺" }
        }
      ],
      metrics: {
        "P/E Ratio": "14.2",
        "Market Cap": "8.5B ₺",
        "Dividend Yield": "2.5%",
        "Beta": "1.2",
        "52-Week Range": "35.20 ₺ - 47.80 ₺",
        "Average Volume": "2.3M",
        "EPS": "2.99 ₺"
      },
      lastUpdated: new Date().toISOString(),
      sector: "Teknoloji"
    };
    
    setData(dummyData);
    calculateFinancialRatios(dummyData);
  };
  
  // Finansal oranları hesapla
  const calculateFinancialRatios = (financialData: FinancialData) => {
    try {
      // En son bilanço verisini al
      const balanceSheet = financialData.balanceSheet[0];
      const incomeStatement = financialData.incomeStatement[0];
      
      if (!balanceSheet || !incomeStatement) {
        console.warn("Oran hesaplaması için gerekli veriler eksik");
        return;
      }
      
      // Bilanço kalemlerini çıkart
      const currentAssets = balanceSheet.totalCurrentAssets?.raw || 0;
      const cash = balanceSheet.cash?.raw || 0;
      const shortTermInvestments = balanceSheet.shortTermInvestments?.raw || 0;
      const receivables = balanceSheet.netReceivables?.raw || 0;
      const inventory = balanceSheet.inventory?.raw || 0;
      const totalAssets = balanceSheet.totalAssets?.raw || 0;
      const currentLiabilities = balanceSheet.totalCurrentLiabilities?.raw || 0;
      const totalLiabilities = balanceSheet.totalLiabilities?.raw || 0;
      const equity = balanceSheet.totalStockholderEquity?.raw || 0;
      
      // Gelir tablosu kalemlerini çıkart
      const revenue = incomeStatement.totalRevenue?.raw || 0;
      const costOfRevenue = incomeStatement.costOfRevenue?.raw || 0;
      const grossProfit = incomeStatement.grossProfit?.raw || 0;
      const operatingIncome = incomeStatement.operatingIncome?.raw || 0;
      const interestExpense = incomeStatement.interestExpense?.raw || 0;
      const netIncome = incomeStatement.netIncome?.raw || 0;
      
      // Finansal oranları hesapla
      const ratiosData: Record<string, number | null> = {
        // Likidite Oranları
        currentRatio: ratios.calculateCurrentRatio(currentAssets, currentLiabilities),
        liquidityRatio: ratios.calculateLiquidityRatio(currentAssets, inventory, currentLiabilities),
        acidTestRatio: ratios.calculateAcidTestRatio(cash, shortTermInvestments, receivables, currentLiabilities),
        cashRatio: ratios.calculateCashRatio(cash, shortTermInvestments, currentLiabilities),
        
        // Finansal Yapı Oranları
        debtRatio: ratios.calculateDebtRatio(totalLiabilities, totalAssets),
        equityRatio: ratios.calculateEquityRatio(equity, totalAssets),
        debtToEquityRatio: ratios.calculateDebtToEquityRatio(totalLiabilities, equity),
        interestCoverageRatio: ratios.calculateInterestCoverageRatio(operatingIncome, interestExpense),
        
        // Kârlılık Oranları
        grossProfitMargin: ratios.calculateGrossProfitMargin(grossProfit, revenue),
        operatingProfitMargin: ratios.calculateOperatingProfitMargin(operatingIncome, revenue),
        netProfitMargin: ratios.calculateNetProfitMargin(netIncome, revenue),
        returnOnAssets: ratios.calculateReturnOnAssets(netIncome, totalAssets),
        returnOnEquity: ratios.calculateReturnOnEquity(netIncome, equity)
      };
      
      setCalculatedRatios(ratiosData);
    } catch (err) {
      console.error("Oran hesaplama hatası:", err);
    }
  };
  
  // Komponent yüklendiğinde veriyi getir
  useEffect(() => {
    if (companyCode) {
      fetchCompanyData();
    }
  }, [companyCode]);
  
  // Yükleme durumunda Skeleton görüntüle
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  
  // Hata durumunda uyarı mesajı göster
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Hata</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  // Veri yoksa uyarı mesajı göster
  if (!data) {
    return (
      <Alert>
        <AlertTitle>Veri Bulunamadı</AlertTitle>
        <AlertDescription>
          Bu şirket için finansal veri bulunamadı. Lütfen başka bir şirket seçin veya daha sonra tekrar deneyin.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Tarihi formatlama yardımcı fonksiyonu
  const formatDateStr = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Veri varsa finansal bilgileri görüntüle
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{data.companyName} ({data.stockCode})</h2>
          <p className="text-muted-foreground">Sektör: {data.sector}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">{formatCurrency(data.currentPrice.value)}</span>
          <span className={`text-sm ${data.priceChange.value.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {data.priceChange.value}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Son güncelleme: {formatDateStr(data.lastUpdated)}
        </p>
        <Button variant="outline" size="sm" onClick={fetchCompanyData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Verileri Güncelle
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:grid-cols-5 w-full">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="financials">Finansal Tablolar</TabsTrigger>
          <TabsTrigger value="ratios">Finansal Oranlar</TabsTrigger>
          <TabsTrigger value="statistics">İstatistikler</TabsTrigger>
          <TabsTrigger value="reports" className="hidden md:block">Raporlar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Piyasa Değeri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.keyStatistics?.marketCap?.raw || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">F/K Oranı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.keyStatistics?.trailingPE?.fmt || data.metrics?.["P/E Ratio"] || "N/A"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Net Kâr Marjı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.financialData?.profitMargins?.raw * 100 || 0)}%
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Finansal Özet</CardTitle>
              <CardDescription>
                {data.companyName} şirketinin temel finansal göstergeleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Likidite</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Cari Oran:</div>
                    <div className="font-medium">{formatNumber(calculatedRatios.currentRatio || 0)}</div>
                    
                    <div>Likidite Oranı:</div>
                    <div className="font-medium">{formatNumber(calculatedRatios.liquidityRatio || 0)}</div>
                    
                    <div>Asit-Test Oranı:</div>
                    <div className="font-medium">{formatNumber(calculatedRatios.acidTestRatio || 0)}</div>
                  </div>
                  
                  <h3 className="font-semibold">Finansal Yapı</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Borç Oranı:</div>
                    <div className="font-medium">{formatNumber(calculatedRatios.debtRatio || 0)}</div>
                    
                    <div>Borç/Özsermaye:</div>
                    <div className="font-medium">{formatNumber(calculatedRatios.debtToEquityRatio || 0)}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Kârlılık</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Brüt Kâr Marjı:</div>
                    <div className="font-medium">{formatNumber((calculatedRatios.grossProfitMargin || 0) * 100)}%</div>
                    
                    <div>Faaliyet Kâr Marjı:</div>
                    <div className="font-medium">{formatNumber((calculatedRatios.operatingProfitMargin || 0) * 100)}%</div>
                    
                    <div>Net Kâr Marjı:</div>
                    <div className="font-medium">{formatNumber((calculatedRatios.netProfitMargin || 0) * 100)}%</div>
                    
                    <div>ROE:</div>
                    <div className="font-medium">{formatNumber((calculatedRatios.returnOnEquity || 0) * 100)}%</div>
                    
                    <div>ROA:</div>
                    <div className="font-medium">{formatNumber((calculatedRatios.returnOnAssets || 0) * 100)}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financials" className="space-y-4">
          <Tabs defaultValue="balanceSheet">
            <TabsList>
              <TabsTrigger value="balanceSheet">Bilanço</TabsTrigger>
              <TabsTrigger value="incomeStatement">Gelir Tablosu</TabsTrigger>
              <TabsTrigger value="cashFlow">Nakit Akış Tablosu</TabsTrigger>
            </TabsList>
            
            {/* Bilanço */}
            <TabsContent value="balanceSheet" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bilanço</CardTitle>
                  <CardDescription>Son iki döneme ait bilanço verileri</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kalem</TableHead>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableHead key={i} className="text-right">
                            {sheet.endDate?.fmt || ""}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Nakit ve Nakit Benzerleri</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right">
                            {sheet.cash?.fmt || formatCurrency(sheet.cash?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Kısa Vadeli Yatırımlar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right">
                            {sheet.shortTermInvestments?.fmt || formatCurrency(sheet.shortTermInvestments?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Ticari Alacaklar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right">
                            {sheet.netReceivables?.fmt || formatCurrency(sheet.netReceivables?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Stoklar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right">
                            {sheet.inventory?.fmt || formatCurrency(sheet.inventory?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Toplam Dönen Varlıklar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {sheet.totalCurrentAssets?.fmt || formatCurrency(sheet.totalCurrentAssets?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Maddi Duran Varlıklar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right">
                            {sheet.propertyPlantEquipment?.fmt || formatCurrency(sheet.propertyPlantEquipment?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Toplam Varlıklar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {sheet.totalAssets?.fmt || formatCurrency(sheet.totalAssets?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Ticari Borçlar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right">
                            {sheet.accountsPayable?.fmt || formatCurrency(sheet.accountsPayable?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Kısa Vadeli Borçlar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right">
                            {sheet.shortLongTermDebt?.fmt || formatCurrency(sheet.shortLongTermDebt?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Toplam Kısa Vadeli Yükümlülükler</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {sheet.totalCurrentLiabilities?.fmt || formatCurrency(sheet.totalCurrentLiabilities?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Uzun Vadeli Borçlar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right">
                            {sheet.longTermDebt?.fmt || formatCurrency(sheet.longTermDebt?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Toplam Yükümlülükler</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {sheet.totalLiabilities?.fmt || formatCurrency(sheet.totalLiabilities?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Toplam Özkaynaklar</TableCell>
                        {data.balanceSheet.map((sheet, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {sheet.totalStockholderEquity?.fmt || formatCurrency(sheet.totalStockholderEquity?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Gelir Tablosu */}
            <TabsContent value="incomeStatement" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gelir Tablosu</CardTitle>
                  <CardDescription>Son iki döneme ait gelir tablosu verileri</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kalem</TableHead>
                        {data.incomeStatement.map((statement, i) => (
                          <TableHead key={i} className="text-right">
                            {statement.endDate?.fmt || ""}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Toplam Gelir</TableCell>
                        {data.incomeStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.totalRevenue?.fmt || formatCurrency(statement.totalRevenue?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Satışların Maliyeti</TableCell>
                        {data.incomeStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.costOfRevenue?.fmt || formatCurrency(statement.costOfRevenue?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Brüt Kâr</TableCell>
                        {data.incomeStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {statement.grossProfit?.fmt || formatCurrency(statement.grossProfit?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Faaliyet Kârı</TableCell>
                        {data.incomeStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.operatingIncome?.fmt || formatCurrency(statement.operatingIncome?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Faiz Giderleri</TableCell>
                        {data.incomeStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.interestExpense?.fmt || formatCurrency(statement.interestExpense?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Vergi Öncesi Kâr</TableCell>
                        {data.incomeStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.incomeBeforeTax?.fmt || formatCurrency(statement.incomeBeforeTax?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Vergi Gideri</TableCell>
                        {data.incomeStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.incomeTaxExpense?.fmt || formatCurrency(statement.incomeTaxExpense?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Net Kâr</TableCell>
                        {data.incomeStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {statement.netIncome?.fmt || formatCurrency(statement.netIncome?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Nakit Akış Tablosu */}
            <TabsContent value="cashFlow" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nakit Akış Tablosu</CardTitle>
                  <CardDescription>Son iki döneme ait nakit akış tablosu verileri</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kalem</TableHead>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableHead key={i} className="text-right">
                            {statement.endDate?.fmt || ""}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Net Gelir</TableCell>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.netIncome?.fmt || formatCurrency(statement.netIncome?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Amortisman</TableCell>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.depreciation?.fmt || formatCurrency(statement.depreciation?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">İşletme Faaliyetlerinden Nakit Akışı</TableCell>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {statement.totalCashFromOperatingActivities?.fmt || formatCurrency(statement.totalCashFromOperatingActivities?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Sermaye Harcamaları</TableCell>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.capitalExpenditures?.fmt || formatCurrency(statement.capitalExpenditures?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Yatırım Faaliyetlerinden Nakit Akışı</TableCell>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {statement.totalCashFromInvestingActivities?.fmt || formatCurrency(statement.totalCashFromInvestingActivities?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Ödenen Temettüler</TableCell>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right">
                            {statement.dividendsPaid?.fmt || formatCurrency(statement.dividendsPaid?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Finansman Faaliyetlerinden Nakit Akışı</TableCell>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {statement.totalCashFromFinancingActivities?.fmt || formatCurrency(statement.totalCashFromFinancingActivities?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Nakit Değişimi</TableCell>
                        {data.cashflowStatement.map((statement, i) => (
                          <TableCell key={i} className="text-right font-semibold">
                            {statement.changeInCash?.fmt || formatCurrency(statement.changeInCash?.raw || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="ratios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Finansal Oranlar</CardTitle>
              <CardDescription>
                {data.companyName} şirketinin hesaplanmış finansal oranları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Likidite Oranları</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Oran</TableHead>
                        <TableHead>Değer</TableHead>
                        <TableHead>Değerlendirme</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Cari Oran</TableCell>
                        <TableCell>{formatNumber(calculatedRatios.currentRatio || 0)}</TableCell>
                        <TableCell>{ratios.evaluateCurrentRatio(calculatedRatios.currentRatio || 0)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Likidite Oranı</TableCell>
                        <TableCell>{formatNumber(calculatedRatios.liquidityRatio || 0)}</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Asit-Test Oranı</TableCell>
                        <TableCell>{formatNumber(calculatedRatios.acidTestRatio || 0)}</TableCell>
                        <TableCell>{ratios.evaluateAcidTestRatio(calculatedRatios.acidTestRatio || 0)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nakit Oranı</TableCell>
                        <TableCell>{formatNumber(calculatedRatios.cashRatio || 0)}</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <h3 className="font-semibold text-lg mt-4">Finansal Yapı Oranları</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Oran</TableHead>
                        <TableHead>Değer</TableHead>
                        <TableHead>Değerlendirme</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Borç Oranı</TableCell>
                        <TableCell>{formatNumber(calculatedRatios.debtRatio || 0)}</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Özsermaye Oranı</TableCell>
                        <TableCell>{formatNumber(calculatedRatios.equityRatio || 0)}</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Borç/Özsermaye Oranı</TableCell>
                        <TableCell>{formatNumber(calculatedRatios.debtToEquityRatio || 0)}</TableCell>
                        <TableCell>{ratios.evaluateDebtToEquityRatio(calculatedRatios.debtToEquityRatio || 0)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Faiz Karşılama Oranı</TableCell>
                        <TableCell>{formatNumber(calculatedRatios.interestCoverageRatio || 0)}</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Kârlılık Oranları</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Oran</TableHead>
                        <TableHead>Değer</TableHead>
                        <TableHead>Değerlendirme</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Brüt Kâr Marjı</TableCell>
                        <TableCell>{formatNumber((calculatedRatios.grossProfitMargin || 0) * 100)}%</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Faaliyet Kâr Marjı</TableCell>
                        <TableCell>{formatNumber((calculatedRatios.operatingProfitMargin || 0) * 100)}%</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Net Kâr Marjı</TableCell>
                        <TableCell>{formatNumber((calculatedRatios.netProfitMargin || 0) * 100)}%</TableCell>
                        <TableCell>{ratios.evaluateNetProfitMargin(calculatedRatios.netProfitMargin || 0)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Özkaynak Kârlılığı (ROE)</TableCell>
                        <TableCell>{formatNumber((calculatedRatios.returnOnEquity || 0) * 100)}%</TableCell>
                        <TableCell>{ratios.evaluateReturnOnEquity(calculatedRatios.returnOnEquity || 0)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Varlık Kârlılığı (ROA)</TableCell>
                        <TableCell>{formatNumber((calculatedRatios.returnOnAssets || 0) * 100)}%</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <div className="flex justify-end mt-6 space-x-2">
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" /> Oran Karşılaştırması
                    </Button>
                    <Button>
                      <Download className="h-4 w-4 mr-2" /> Rapor İndir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Piyasa İstatistikleri</CardTitle>
              <CardDescription>
                {data.companyName} şirketinin temel piyasa göstergeleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gösterge</TableHead>
                        <TableHead className="text-right">Değer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Piyasa Değeri</TableCell>
                        <TableCell className="text-right">
                          {data.keyStatistics?.marketCap?.fmt || data.metrics?.["Market Cap"] || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>F/K Oranı (Trailing)</TableCell>
                        <TableCell className="text-right">
                          {data.keyStatistics?.trailingPE?.fmt || data.metrics?.["P/E Ratio"] || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>F/K Oranı (Forward)</TableCell>
                        <TableCell className="text-right">
                          {data.keyStatistics?.forwardPE?.fmt || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>PEG Oranı</TableCell>
                        <TableCell className="text-right">
                          {data.keyStatistics?.pegRatio?.fmt || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Fiyat/Defter Değeri</TableCell>
                        <TableCell className="text-right">
                          {data.keyStatistics?.priceToBook?.fmt || "N/A"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gösterge</TableHead>
                        <TableHead className="text-right">Değer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>52 Haftalık Aralık</TableCell>
                        <TableCell className="text-right">
                          {data.metrics?.["52-Week Range"] || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Temettü Verimi</TableCell>
                        <TableCell className="text-right">
                          {data.metrics?.["Dividend Yield"] || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Beta</TableCell>
                        <TableCell className="text-right">
                          {data.metrics?.["Beta"] || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hisse Başına Kazanç (EPS)</TableCell>
                        <TableCell className="text-right">
                          {data.metrics?.["EPS"] || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Ortalama İşlem Hacmi</TableCell>
                        <TableCell className="text-right">
                          {data.metrics?.["Average Volume"] || "N/A"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raporlar</CardTitle>
              <CardDescription>
                {data.companyName} şirketi için hazırlanan raporlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Finansal Analiz Raporu</CardTitle>
                      <CardDescription>En son finansal verilere göre</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Şirketin likidite, kârlılık ve finansal yapı analizlerini içeren kapsamlı rapor.
                      </p>
                    </CardContent>
                    <div className="px-6 pb-4">
                      <Button className="w-full">
                        <FileDown className="h-4 w-4 mr-2" /> PDF İndir
                      </Button>
                    </div>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Oran Analizi Raporu</CardTitle>
                      <CardDescription>Sektör karşılaştırmalı</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Şirketin finansal oranlarının sektör ortalamaları ile karşılaştırmalı analizi.
                      </p>
                    </CardContent>
                    <div className="px-6 pb-4">
                      <Button className="w-full" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" /> Excel İndir
                      </Button>
                    </div>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Yıllık Değerlendirme</CardTitle>
                      <CardDescription>Son 5 yıllık performans</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Şirketin son 5 yıldaki finansal performansının trend analizi.
                      </p>
                    </CardContent>
                    <div className="px-6 pb-4">
                      <Button className="w-full" variant="outline">
                        <FileText className="h-4 w-4 mr-2" /> Word İndir
                      </Button>
                    </div>
                  </Card>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    Özel Rapor Oluştur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}