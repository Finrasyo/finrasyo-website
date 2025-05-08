import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface PriceCalculatorProps {
  onPriceChange?: (totalPrice: number, requiredCredits: number) => void;
  initialCompanies?: number;
  initialPeriods?: number;
  initialRatios?: number;
}

export function PriceCalculator({
  onPriceChange,
  initialCompanies = 1,
  initialPeriods = 1,
  initialRatios = 1
}: PriceCalculatorProps) {
  const [numCompanies, setNumCompanies] = useState(initialCompanies);
  const [numPeriods, setNumPeriods] = useState(initialPeriods);
  const [numRatios, setNumRatios] = useState(initialRatios);
  
  const PRICE_PER_UNIT = 0.25; // TL cinsinden birim fiyatı
  
  // Toplam fiyatı hesapla
  const totalPrice = numCompanies * numPeriods * numRatios * PRICE_PER_UNIT;
  
  // Gerekli kredi sayısını hesapla (her 1 TL için 1 kredi)
  const requiredCredits = Math.ceil(totalPrice);
  
  useEffect(() => {
    if (onPriceChange) {
      onPriceChange(totalPrice, requiredCredits);
    }
  }, [totalPrice, requiredCredits, onPriceChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rapor Fiyat Hesaplayıcı</CardTitle>
        <CardDescription>
          Seçilen parametrelere göre fiyat hesaplanır
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="companies">Şirket Sayısı: {numCompanies}</Label>
            <Input
              id="companies"
              type="number"
              min={1}
              max={100}
              value={numCompanies}
              onChange={(e) => setNumCompanies(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
          <Slider
            value={[numCompanies]}
            min={1}
            max={100}
            step={1}
            onValueChange={(value) => setNumCompanies(value[0])}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="periods">Dönem Sayısı: {numPeriods}</Label>
            <Input
              id="periods"
              type="number"
              min={1}
              max={10}
              value={numPeriods}
              onChange={(e) => setNumPeriods(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
          <Slider
            value={[numPeriods]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setNumPeriods(value[0])}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ratios">Oran Sayısı: {numRatios}</Label>
            <Input
              id="ratios"
              type="number"
              min={1}
              max={16}
              value={numRatios}
              onChange={(e) => setNumRatios(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
          <Slider
            value={[numRatios]}
            min={1}
            max={16}
            step={1}
            onValueChange={(value) => setNumRatios(value[0])}
          />
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Formül:</h4>
              <p className="text-sm text-muted-foreground">
                {numCompanies} şirket × {numPeriods} dönem × {numRatios} oran × 0.25₺
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold">{totalPrice.toFixed(2)}₺</h3>
              <p className="text-sm text-muted-foreground">Gereken kredi: {requiredCredits}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}