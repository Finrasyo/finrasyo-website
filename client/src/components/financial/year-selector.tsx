import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  
  // 2000'den günümüze kadar olan yılları hesapla
  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const yearRange = currentYear - startYear + 1;
  const availableYears = Array.from({ length: yearRange }, (_, i) => currentYear - i);
  
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
  
  // Tüm yılları gruplara böl
  const groupedYears = [
    { 
      title: "Son Yıllar", 
      years: availableYears.filter(year => year >= 2015 && year <= currentYear) 
    },
    { 
      title: "2014-2010", 
      years: availableYears.filter(year => year >= 2010 && year < 2015) 
    },
    { 
      title: "2009-2005", 
      years: availableYears.filter(year => year >= 2005 && year < 2010) 
    },
    { 
      title: "2004-2000", 
      years: availableYears.filter(year => year >= 2000 && year < 2005) 
    }
  ];
  
  // Tüm yılları seç/kaldır
  const handleSelectAllYears = () => {
    if (selectedYears.length === availableYears.length) {
      setSelectedYears([]);
    } else {
      setSelectedYears([...availableYears]);
    }
  };
  
  // Bir gruptaki tüm yılları seç/kaldır
  const handleSelectYearGroup = (years: number[]) => {
    const allSelected = years.every(year => selectedYears.includes(year));
    
    if (allSelected) {
      // Gruptaki tüm yılları kaldır
      setSelectedYears(selectedYears.filter(year => !years.includes(year)));
    } else {
      // Gruptaki eksik yılları ekle
      const yearsToAdd = years.filter(year => !selectedYears.includes(year));
      setSelectedYears([...selectedYears, ...yearsToAdd]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tüm yılları seç/kaldır */}
      <div className="flex items-center space-x-2 border-b pb-2">
        <Checkbox 
          id="select-all-years" 
          checked={selectedYears.length === availableYears.length}
          onCheckedChange={handleSelectAllYears}
        />
        <Label htmlFor="select-all-years" className="font-bold">Tüm Yılları Seç / Kaldır</Label>
      </div>
      
      {/* Yıl grupları */}
      {groupedYears.map((group, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{group.title}</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleSelectYearGroup(group.years)}
              className="h-6 text-xs"
            >
              {group.years.every(year => selectedYears.includes(year)) 
                ? "Tümünü Kaldır" 
                : "Tümünü Seç"}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {group.years.map(year => (
              <Card key={year} className="cursor-pointer hover:bg-muted/50">
                <CardContent 
                  className="p-2 flex items-center space-x-2"
                  onClick={() => toggleYear(year)}
                >
                  <Checkbox 
                    checked={selectedYears.includes(year)} 
                    onCheckedChange={() => toggleYear(year)}
                    id={`year-${year}`}
                  />
                  <Label
                    htmlFor={`year-${year}`}
                    className="cursor-pointer flex-grow text-sm"
                  >
                    {year}
                  </Label>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-2 text-sm text-muted-foreground">
        Seçilen dönemler: {selectedYears.length > 0 
          ? selectedYears.sort((a, b) => b - a).join(', ') 
          : "Henüz dönem seçilmedi"}
      </div>
    </div>
  );
}