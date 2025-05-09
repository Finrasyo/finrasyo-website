import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface YearSelectorProps {
  onSelectYears: (years: number[]) => void;
  initialSelectedYears?: number[];
  yearCount?: number; // Son kaç yılın gösterileceği (varsayılan: 5)
}

export default function YearSelector({
  onSelectYears,
  initialSelectedYears = [],
  yearCount = 5
}: YearSelectorProps) {
  const [selectedYears, setSelectedYears] = useState<number[]>(initialSelectedYears);
  
  // Mevcut yıldan başlayarak seçilebilecek yılları hesapla
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: yearCount }, (_, i) => currentYear - i);
  
  // Başlangıçta seçili yıllar varsa kullan
  useEffect(() => {
    if (initialSelectedYears && initialSelectedYears.length > 0) {
      setSelectedYears(initialSelectedYears);
    }
  }, [initialSelectedYears]);
  
  // Seçim değişikliklerini parent'a bildir
  useEffect(() => {
    onSelectYears(selectedYears);
  }, [selectedYears, onSelectYears]);
  
  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {availableYears.map(year => (
          <Card key={year} className="cursor-pointer hover:bg-muted/50">
            <CardContent 
              className="p-4 flex items-center space-x-2"
              onClick={() => toggleYear(year)}
            >
              <Checkbox 
                checked={selectedYears.includes(year)} 
                onCheckedChange={() => toggleYear(year)}
                id={`year-${year}`}
              />
              <Label
                htmlFor={`year-${year}`}
                className="cursor-pointer flex-grow"
              >
                {year}
              </Label>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-2 text-sm text-muted-foreground">
        Seçilen dönemler: {selectedYears.length > 0 
          ? selectedYears.sort((a, b) => b - a).join(', ') 
          : "Henüz dönem seçilmedi"}
      </div>
    </div>
  );
}