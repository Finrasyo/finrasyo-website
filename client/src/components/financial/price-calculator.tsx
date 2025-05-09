import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

interface PriceCalculatorProps {
  onPriceChange: (price: number, credits: number) => void;
  initialCompanies?: number;
  initialPeriods?: number;
  initialRatios?: number;
  pricePerUnit?: number;
}

export function PriceCalculator({
  onPriceChange,
  initialCompanies = 1,
  initialPeriods = 1,
  initialRatios = 1,
  pricePerUnit = 0.25
}: PriceCalculatorProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [periods, setPeriods] = useState(initialPeriods);
  const [ratios, setRatios] = useState(initialRatios);
  const [price, setPrice] = useState(0);
  
  // Fiyat hesapla: Şirket sayısı x Dönem sayısı x Oran sayısı x Birim fiyat
  useEffect(() => {
    const calculatedPrice = companies * periods * ratios * pricePerUnit;
    setPrice(calculatedPrice);
    onPriceChange(calculatedPrice, calculatedPrice); // Kredi miktarı değeri fiyata eşit (1 TL = 1 kredi)
  }, [companies, periods, ratios, pricePerUnit, onPriceChange]);
  
  const handleCompaniesChange = (value: number[]) => {
    setCompanies(value[0]);
  };
  
  const handlePeriodsChange = (value: number[]) => {
    setPeriods(value[0]);
  };
  
  const handleRatiosChange = (value: number[]) => {
    setRatios(value[0]);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5" /> Fiyat Hesaplama
        </CardTitle>
        <CardDescription>
          Seçimlerinize göre ödeyeceğiniz kredi miktarı otomatik hesaplanır
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="companies">Şirket Sayısı: {companies}</Label>
            <Input
              id="companies-input"
              type="number"
              value={companies}
              onChange={(e) => setCompanies(parseInt(e.target.value) || 1)}
              className="w-20 h-8"
              min={1}
              max={10}
            />
          </div>
          <Slider
            id="companies"
            min={1}
            max={10}
            step={1}
            value={[companies]}
            onValueChange={handleCompaniesChange}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="periods">Dönem Sayısı: {periods}</Label>
            <Input
              id="periods-input"
              type="number"
              value={periods}
              onChange={(e) => setPeriods(parseInt(e.target.value) || 1)}
              className="w-20 h-8"
              min={1}
              max={5}
            />
          </div>
          <Slider
            id="periods"
            min={1}
            max={5}
            step={1}
            value={[periods]}
            onValueChange={handlePeriodsChange}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="ratios">Oran Sayısı: {ratios}</Label>
            <Input
              id="ratios-input"
              type="number"
              value={ratios}
              onChange={(e) => setRatios(parseInt(e.target.value) || 1)}
              className="w-20 h-8"
              min={1}
              max={18}
            />
          </div>
          <Slider
            id="ratios"
            min={1}
            max={18}
            step={1}
            value={[ratios]}
            onValueChange={handleRatiosChange}
          />
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <Label>Oran Başına Fiyat</Label>
              <p className="text-sm text-muted-foreground">{pricePerUnit.toFixed(2)} ₺</p>
            </div>
            <div className="text-right">
              <Label>Toplam Fiyat</Label>
              <p className="text-xl font-bold text-primary">{price.toFixed(2)} ₺</p>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            Hesaplama: {companies} şirket × {periods} dönem × {ratios} oran × {pricePerUnit.toFixed(2)} ₺
          </div>
        </div>
      </CardContent>
    </Card>
  );
}