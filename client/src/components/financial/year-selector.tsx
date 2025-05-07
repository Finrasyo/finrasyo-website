import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// Mevcut yılı alma
const currentYear = new Date().getFullYear();

// Son 10 yıl için seçenek oluşturma
const generateYearOptions = () => {
  return Array.from({ length: 10 }, (_, i) => currentYear - i);
};

interface YearSelectorProps {
  selectedYears: number[];
  onYearSelect: (years: number[]) => void;
  maxSelections?: number;
}

export default function YearSelector({
  selectedYears,
  onYearSelect,
  maxSelections = 5
}: YearSelectorProps) {
  const [yearOptions, setYearOptions] = useState<number[]>(generateYearOptions());
  const [startIndex, setStartIndex] = useState(0);
  const displayCount = 5; // Bir seferde gösterilecek yıl sayısı

  const handleYearToggle = (year: number) => {
    if (selectedYears.includes(year)) {
      // Eğer yıl zaten seçiliyse, seçimden kaldır
      onYearSelect(selectedYears.filter(y => y !== year));
    } else {
      // Eğer maksimum seçim sayısına ulaşıldıysa en eski seçimi kaldır
      if (selectedYears.length >= maxSelections) {
        onYearSelect([...selectedYears.slice(1), year]);
      } else {
        // Yeni yılı ekle
        onYearSelect([...selectedYears, year]);
      }
    }
  };

  const handleNext = () => {
    if (startIndex + displayCount < yearOptions.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const visibleYears = yearOptions.slice(startIndex, startIndex + displayCount);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Dönem Seçimi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev}
            disabled={startIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {visibleYears.map(year => (
              <Badge 
                key={year} 
                variant={selectedYears.includes(year) ? "default" : "outline"} 
                className="cursor-pointer transition-all text-md rounded-full px-3 py-1"
                onClick={() => handleYearToggle(year)}
              >
                {year}
              </Badge>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={startIndex + displayCount >= yearOptions.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedYears.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-neutral-500 mb-2">Seçilen dönemler:</p>
            <div className="flex flex-wrap gap-2">
              {selectedYears.map(year => (
                <Badge key={year} variant="secondary" className="rounded-full px-2">
                  {year}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}