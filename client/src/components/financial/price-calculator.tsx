import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/use-auth";

interface PriceCalculatorProps {
  onPriceChange: (price: number, credits: number) => void;
  initialCompanies: number;
  initialPeriods: number;
  initialRatios: number;
  pricePerUnit: number;
}

export function PriceCalculator({
  onPriceChange,
  initialCompanies,
  initialPeriods,
  initialRatios,
  pricePerUnit
}: PriceCalculatorProps) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<number>(initialCompanies);
  const [periods, setPeriods] = useState<number>(initialPeriods);
  const [ratios, setRatios] = useState<number>(initialRatios);
  const [price, setPrice] = useState<number>(0);
  const [credits, setCredits] = useState<number>(0);
  
  // Fiyat hesapla
  useEffect(() => {
    const calculatedPrice = companies * periods * ratios * pricePerUnit;
    const calculatedCredits = Math.ceil(calculatedPrice);
    
    setPrice(calculatedPrice);
    setCredits(calculatedCredits);
    onPriceChange(calculatedPrice, calculatedCredits);
  }, [companies, periods, ratios, pricePerUnit, onPriceChange]);
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Şirket Sayısı: {companies}</Label>
          <Slider
            value={[companies]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setCompanies(value[0])}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Dönem Sayısı: {periods}</Label>
          <Slider
            value={[periods]}
            min={1}
            max={5}
            step={1}
            onValueChange={(value) => setPeriods(value[0])}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Oran Sayısı: {ratios}</Label>
          <Slider
            value={[ratios]}
            min={1}
            max={16}
            step={1}
            onValueChange={(value) => setRatios(value[0])}
            className="mt-2"
          />
        </div>
      </div>
      
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Label>Formül</Label>
              <div className="text-sm text-muted-foreground mt-1">
                <code className="bg-muted px-1 py-0.5 rounded">
                  Şirketler × Dönemler × Oranlar × {pricePerUnit.toFixed(2)}₺
                </code>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Toplam Fiyat</Label>
                <Input 
                  value={`${price.toFixed(2)} ₺`} 
                  className="text-right font-medium" 
                  readOnly 
                />
              </div>
              
              <div className="space-y-1">
                <Label>Gerekli Kredi</Label>
                <Input 
                  value={credits.toString()} 
                  className="text-right font-medium" 
                  readOnly 
                />
              </div>
            </div>
            
            {user && (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mevcut Krediniz:</span>
                <span className="font-medium">
                  {user.credits} {user.credits >= credits ? (
                    <span className="text-green-600 text-xs ml-1">(Yeterli)</span>
                  ) : (
                    <span className="text-red-600 text-xs ml-1">(Yetersiz)</span>
                  )}
                </span>
              </div>
            )}
            
            {(user?.role === "admin") && (
              <div className="rounded-md bg-blue-50 p-3 mt-2">
                <div className="flex">
                  <p className="text-sm text-blue-700">
                    Admin kullanıcı olduğunuz için ödeme yapmanız gerekmez.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}