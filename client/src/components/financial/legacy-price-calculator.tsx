import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  initialRatios = 3,
  pricePerUnit = 0.25
}: PriceCalculatorProps) {
  const [numCompanies, setNumCompanies] = useState(initialCompanies);
  const [numPeriods, setNumPeriods] = useState(initialPeriods);
  const [numRatios, setNumRatios] = useState(initialRatios);
  
  // Fiyat hesaplama
  useEffect(() => {
    // Dinamik fiyatlama modeli: Şirketler × Dönemler × Oranlar × 0.25₺
    const price = numCompanies * numPeriods * numRatios * pricePerUnit;
    const creditAmount = Math.ceil(price);
    
    onPriceChange(price, creditAmount);
  }, [numCompanies, numPeriods, numRatios, pricePerUnit, onPriceChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companies">Şirket Sayısı</Label>
          <Select 
            value={numCompanies.toString()} 
            onValueChange={(value) => setNumCompanies(parseInt(value))}
          >
            <SelectTrigger id="companies">
              <SelectValue placeholder="Şirket sayısı seçin" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Şirket
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="periods">Dönem Sayısı</Label>
          <Select 
            value={numPeriods.toString()} 
            onValueChange={(value) => setNumPeriods(parseInt(value))}
          >
            <SelectTrigger id="periods">
              <SelectValue placeholder="Dönem sayısı seçin" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Dönem
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ratios">Oran Sayısı</Label>
        <Select 
          value={numRatios.toString()} 
          onValueChange={(value) => setNumRatios(parseInt(value))}
        >
          <SelectTrigger id="ratios">
            <SelectValue placeholder="Oran sayısı seçin" />
          </SelectTrigger>
          <SelectContent>
            {[3, 5, 8, 10].map(num => (
              <SelectItem key={num} value={num.toString()}>
                {num} Oran
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="pt-4 border-t mt-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Fiyatlandırma:</span>
          <span className="font-medium">
            {numCompanies} × {numPeriods} × {numRatios} × {pricePerUnit} ₺
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-neutral-600">Toplam Fiyat:</span>
          <span className="font-bold text-primary">
            {(numCompanies * numPeriods * numRatios * pricePerUnit).toFixed(2)} ₺
          </span>
        </div>
      </div>
    </div>
  );
}