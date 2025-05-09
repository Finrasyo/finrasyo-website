import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock } from "lucide-react";

interface YearSelectorProps {
  onSelectYears: (years: number[]) => void;
  initialSelectedYears?: number[];
  yearCount?: number;
}

export default function YearSelector({
  onSelectYears,
  initialSelectedYears = [],
  yearCount = 5
}: YearSelectorProps) {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>(initialSelectedYears);
  
  // Mevcut yıldan başlayarak son N yılı oluştur
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let i = 0; i < yearCount; i++) {
      yearList.push(currentYear - i);
    }
    setYears(yearList);
  }, [yearCount]);
  
  useEffect(() => {
    // Seçilen yılları ana bileşene bildir
    onSelectYears(selectedYears);
  }, [selectedYears, onSelectYears]);
  
  const handleYearSelect = (year: number) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };
  
  const removeSelectedYear = (year: number) => {
    setSelectedYears(selectedYears.filter(y => y !== year));
  };
  
  return (
    <div>
      <div className="space-y-2">
        {years.map((year) => (
          <div 
            key={year}
            className="flex items-center space-x-2 p-2 border-b last:border-0 hover:bg-neutral-50 cursor-pointer"
            onClick={() => handleYearSelect(year)}
          >
            <Checkbox 
              id={`year-${year}`}
              checked={selectedYears.includes(year)}
              onCheckedChange={() => handleYearSelect(year)}
            />
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-neutral-500" />
              <label 
                htmlFor={`year-${year}`}
                className="font-medium text-sm cursor-pointer"
              >
                {year} Mali Yılı
              </label>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Seçilen Dönemler ({selectedYears.length})</h3>
        {selectedYears.length === 0 ? (
          <div className="text-neutral-500 text-sm">Henüz dönem seçilmedi</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedYears.sort((a, b) => b - a).map((year) => (
              <div 
                key={year}
                className="bg-primary-50 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {year}
                <button 
                  className="ml-2 hover:text-primary-900"
                  onClick={() => removeSelectedYear(year)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}