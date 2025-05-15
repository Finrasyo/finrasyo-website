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
  
  // Tüm yılları 4 gruba böleriz
  const yearGroups = [];
  // 2026-2015
  const recentYears = availableYears.filter(year => year >= 2015 && year <= currentYear);
  // 2014-2010
  const previousDecade = availableYears.filter(year => year >= 2010 && year < 2015);
  // 2009-2005
  const olderDecade = availableYears.filter(year => year >= 2005 && year < 2010);
  // 2004-2000
  const oldestYears = availableYears.filter(year => year >= 2000 && year < 2005);

  return (
    <div className="space-y-6">
      {/* Son yıllar (2025-2015) */}
      <div>
        <h3 className="text-sm font-medium mb-2">Son Yıllar</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {recentYears.map(year => (
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

      {/* 2014-2010 */}
      <div>
        <h3 className="text-sm font-medium mb-2">2014-2010</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {previousDecade.map(year => (
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

      {/* 2009-2005 */}
      <div>
        <h3 className="text-sm font-medium mb-2">2009-2005</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {olderDecade.map(year => (
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

      {/* 2004-2000 */}
      <div>
        <h3 className="text-sm font-medium mb-2">2004-2000</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {oldestYears.map(year => (
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
      
      <div className="mt-2 text-sm text-muted-foreground">
        Seçilen dönemler: {selectedYears.length > 0 
          ? selectedYears.sort((a, b) => b - a).join(', ') 
          : "Henüz dönem seçilmedi"}
      </div>
    </div>
  );
}