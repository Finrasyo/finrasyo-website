import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { financialRatioCategories, type FinancialRatio } from "@/lib/financial-ratios";

interface RatioSelectorProps {
  onSelectRatios: (ratios: string[]) => void;
  initialSelectedRatios?: string[];
}

export default function RatioSelector({
  onSelectRatios,
  initialSelectedRatios = []
}: RatioSelectorProps) {
  const [selectedRatios, setSelectedRatios] = useState<string[]>(initialSelectedRatios);
  const [currentTab, setCurrentTab] = useState("all");
  
  // Başlangıçta seçili oranlar varsa kullan
  useEffect(() => {
    if (initialSelectedRatios && initialSelectedRatios.length > 0) {
      setSelectedRatios(initialSelectedRatios);
    }
  }, [initialSelectedRatios]);
  
  // Seçim değişikliklerini parent'a bildir
  useEffect(() => {
    onSelectRatios(selectedRatios);
  }, [selectedRatios, onSelectRatios]);
  
  const toggleRatio = (ratioId: string) => {
    if (selectedRatios.includes(ratioId)) {
      setSelectedRatios(selectedRatios.filter(id => id !== ratioId));
    } else {
      setSelectedRatios([...selectedRatios, ratioId]);
    }
  };
  
  const handleSelectAll = () => {
    const allRatioIds: string[] = [];
    
    // Mevcut sekmeye göre seçim yap
    if (currentTab === "all") {
      // Tüm oranları seç
      financialRatioCategories.forEach(category => {
        category.ratios.forEach(ratio => {
          allRatioIds.push(ratio.id);
        });
      });
    } else {
      // Sadece mevcut kategoriyi seç
      const category = financialRatioCategories.find(c => c.id === currentTab);
      if (category) {
        category.ratios.forEach(ratio => {
          allRatioIds.push(ratio.id);
        });
      }
    }
    
    setSelectedRatios(allRatioIds);
  };
  
  const handleUnselectAll = () => {
    if (currentTab === "all") {
      // Tümünü kaldır
      setSelectedRatios([]);
    } else {
      // Sadece mevcut kategoridekileri kaldır
      const category = financialRatioCategories.find(c => c.id === currentTab);
      if (category) {
        const categoryRatioIds = category.ratios.map(ratio => ratio.id);
        setSelectedRatios(selectedRatios.filter(id => !categoryRatioIds.includes(id)));
      }
    }
  };
  
  // Oran kartları oluştur
  const renderRatioCards = (ratios: FinancialRatio[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ratios.map(ratio => (
          <Card 
            key={ratio.id} 
            className={`cursor-pointer hover:bg-muted/50 ${
              selectedRatios.includes(ratio.id) ? "border-primary" : ""
            }`}
          >
            <CardContent className="p-4" onClick={() => toggleRatio(ratio.id)}>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  checked={selectedRatios.includes(ratio.id)} 
                  onCheckedChange={() => toggleRatio(ratio.id)}
                  id={`ratio-${ratio.id}`}
                  className="mt-1"
                />
                <div className="space-y-1 flex-grow">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`ratio-${ratio.id}`}
                      className="cursor-pointer font-medium"
                    >
                      {ratio.name}
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{ratio.description}</p>
                          <div className="mt-2 pt-2 border-t text-xs">
                            <code>{ratio.formula}</code>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ratio.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center">
        <div className="mb-2">
          <Badge variant="outline" className="mr-2">
            Seçili: {selectedRatios.length}
          </Badge>
          
          <span className="text-sm text-muted-foreground">
            Toplam: {financialRatioCategories.reduce((acc, cat) => acc + cat.ratios.length, 0)}
          </span>
        </div>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
          >
            Tümünü Seç
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUnselectAll}
          >
            Seçimi Temizle
          </Button>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          {financialRatioCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="pt-4">
          <div className="space-y-8">
            {financialRatioCategories.map(category => (
              <div key={category.id} className="space-y-3">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                {renderRatioCards(category.ratios)}
              </div>
            ))}
          </div>
        </TabsContent>
        
        {financialRatioCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="pt-4">
            {renderRatioCards(category.ratios)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}