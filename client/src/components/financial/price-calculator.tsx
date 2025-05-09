import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

interface PriceCalculatorProps {
  companiesCount: number;
  periodsCount: number;
  ratiosCount: number;
  pricePerUnit?: number;
  currency?: string;
  onChange?: (price: number) => void;
}

export default function PriceCalculator({
  companiesCount,
  periodsCount,
  ratiosCount,
  pricePerUnit = 0.25,
  currency = "₺",
  onChange
}: PriceCalculatorProps) {
  const [totalPrice, setTotalPrice] = useState(0);

  // Fiyat hesaplama
  useEffect(() => {
    // Dinamik fiyatlama modeli: Şirketler × Dönemler × Oranlar × 0.25₺
    const price = companiesCount * periodsCount * ratiosCount * pricePerUnit;
    setTotalPrice(price);
    
    // Fiyat değiştiğinde callback fonksiyonunu çağır
    if (onChange) {
      onChange(price);
    }
  }, [companiesCount, periodsCount, ratiosCount, pricePerUnit, onChange]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          Fiyat Hesaplama
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-neutral-600">Seçilen Şirket Sayısı:</span>
            <span className="font-medium text-right">{companiesCount}</span>
            
            <span className="text-neutral-600">Seçilen Dönem Sayısı:</span>
            <span className="font-medium text-right">{periodsCount}</span>
            
            <span className="text-neutral-600">Seçilen Oran Sayısı:</span>
            <span className="font-medium text-right">{ratiosCount}</span>
            
            <span className="text-neutral-600">Birim Fiyat:</span>
            <span className="font-medium text-right">{pricePerUnit} {currency}</span>
          </div>
          
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center">
              <span className="text-neutral-800 font-medium">Toplam Fiyat:</span>
              <span className="text-lg font-bold text-primary">
                {totalPrice.toFixed(2)} {currency}
              </span>
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Hesaplama: {companiesCount} şirket × {periodsCount} dönem × {ratiosCount} oran × {pricePerUnit} {currency}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}