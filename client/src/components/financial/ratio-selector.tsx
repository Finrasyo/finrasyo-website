import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Finansal Oran Kategorileri ve Tanımları
interface FinancialRatio {
  id: string;
  name: string;
  description: string;
  formula: string;
}

interface RatioCategory {
  id: string;
  name: string;
  ratios: FinancialRatio[];
}

// Geçici olarak finansal oranları buraya tanımlıyoruz
// Normalde lib/financial-ratios.ts'den içe aktarılacak
const financialRatioCategories: RatioCategory[] = [
  {
    id: "liquidity",
    name: "Likidite",
    ratios: [
      {
        id: "currentRatio",
        name: "Cari Oran",
        description: "Dönen varlıkların kısa vadeli borçları karşılama oranı",
        formula: "Dönen Varlıklar / Kısa Vadeli Yükümlülükler"
      },
      {
        id: "quickRatio",
        name: "Asit-Test Oranı",
        description: "Likiditeyi ölçen, stoklardan arındırılmış oran",
        formula: "(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler"
      },
      {
        id: "cashRatio",
        name: "Nakit Oranı",
        description: "Nakit ve benzeri varlıkların kısa vadeli borçları karşılama oranı",
        formula: "Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler"
      }
    ]
  },
  {
    id: "leverage",
    name: "Finansal Kaldıraç",
    ratios: [
      {
        id: "debtRatio",
        name: "Borç Oranı",
        description: "Toplam borçların toplam varlıklara oranı",
        formula: "Toplam Borçlar / Toplam Varlıklar"
      },
      {
        id: "debtToEquity",
        name: "Borç/Özsermaye Oranı",
        description: "Şirketin borçlarının öz sermayeye oranı",
        formula: "Toplam Borçlar / Özkaynaklar"
      }
    ]
  },
  {
    id: "activity",
    name: "Faaliyet",
    ratios: [
      {
        id: "assetTurnover",
        name: "Varlık Devir Hızı",
        description: "Varlıkların ne kadar etkin kullanıldığını gösteren oran",
        formula: "Net Satışlar / Ortalama Toplam Varlıklar"
      },
      {
        id: "receivablesTurnover",
        name: "Alacak Devir Hızı",
        description: "Şirketin alacaklarını tahsil etme oranı",
        formula: "Net Satışlar / Ortalama Ticari Alacaklar"
      }
    ]
  },
  {
    id: "profitability",
    name: "Karlılık",
    ratios: [
      {
        id: "grossProfitMargin",
        name: "Brüt Kar Marjı",
        description: "Brüt karın net satışlara oranı",
        formula: "Brüt Kar / Net Satışlar"
      },
      {
        id: "netProfitMargin",
        name: "Net Kar Marjı",
        description: "Net karın net satışlara oranı",
        formula: "Net Kar / Net Satışlar"
      }
    ]
  }
];

interface RatioSelectorProps {
  onSelectRatios: (ratios: string[]) => void;
  initialSelectedRatios?: string[];
}

export default function RatioSelector({
  onSelectRatios,
  initialSelectedRatios = []
}: RatioSelectorProps) {
  const [selectedRatios, setSelectedRatios] = useState<string[]>(initialSelectedRatios);
  
  useEffect(() => {
    // Seçilen oranları ana bileşene bildir
    onSelectRatios(selectedRatios);
  }, [selectedRatios, onSelectRatios]);
  
  const handleRatioSelect = (ratioId: string) => {
    if (selectedRatios.includes(ratioId)) {
      setSelectedRatios(selectedRatios.filter(r => r !== ratioId));
    } else {
      setSelectedRatios([...selectedRatios, ratioId]);
    }
  };
  
  const handleSelectAllInCategory = (categoryRatios: string[]) => {
    // Kategori içindeki tüm oranları seç
    const newSelectedRatios = [...selectedRatios];
    
    categoryRatios.forEach(ratioId => {
      if (!newSelectedRatios.includes(ratioId)) {
        newSelectedRatios.push(ratioId);
      }
    });
    
    setSelectedRatios(newSelectedRatios);
  };
  
  const handleUnselectAllInCategory = (categoryRatios: string[]) => {
    // Kategori içindeki tüm oranları kaldır
    setSelectedRatios(selectedRatios.filter(ratioId => !categoryRatios.includes(ratioId)));
  };
  
  // Kategori için seçim durumunu hesapla (tümü, kısmen, hiçbiri)
  const getCategorySelectionStatus = (categoryRatios: string[]) => {
    const selectedCount = categoryRatios.filter(ratio => selectedRatios.includes(ratio)).length;
    
    if (selectedCount === 0) return "none";
    if (selectedCount === categoryRatios.length) return "all";
    return "partial";
  };
  
  return (
    <div>
      <Tabs defaultValue="liquidity" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="liquidity">Likidite</TabsTrigger>
          <TabsTrigger value="leverage">Kaldıraç</TabsTrigger>
          <TabsTrigger value="activity">Faaliyet</TabsTrigger>
          <TabsTrigger value="profitability">Karlılık</TabsTrigger>
        </TabsList>
        
        {financialRatioCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{category.name} Oranları</h3>
              <div className="flex gap-2">
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => handleSelectAllInCategory(category.ratios.map(r => r.id))}
                >
                  Tümünü Seç
                </button>
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => handleUnselectAllInCategory(category.ratios.map(r => r.id))}
                >
                  Hiçbirini Seçme
                </button>
              </div>
            </div>
            
            <div className="space-y-2 border rounded-md p-3">
              {getCategorySelectionStatus(category.ratios.map(r => r.id)) === "all" && (
                <div className="bg-green-50 text-green-700 text-sm p-2 rounded-md mb-4">
                  Bu kategorideki tüm oranlar seçildi.
                </div>
              )}
              
              {category.ratios.map((ratio) => (
                <div
                  key={ratio.id}
                  className="flex items-start space-x-2 p-2 border-b last:border-0 hover:bg-neutral-50 cursor-pointer"
                  onClick={() => handleRatioSelect(ratio.id)}
                >
                  <Checkbox
                    id={`ratio-${ratio.id}`}
                    checked={selectedRatios.includes(ratio.id)}
                    onCheckedChange={() => handleRatioSelect(ratio.id)}
                    className="mt-1"
                  />
                  <div>
                    <label
                      htmlFor={`ratio-${ratio.id}`}
                      className="font-medium text-sm cursor-pointer"
                    >
                      {ratio.name}
                    </label>
                    <p className="text-xs text-neutral-500">{ratio.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-6">
        <h3 className="font-medium mb-2">Seçilen Oranlar ({selectedRatios.length})</h3>
        {selectedRatios.length === 0 ? (
          <div className="text-neutral-500 text-sm">Henüz oran seçilmedi</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedRatios.map((ratioId) => {
              // Oran bilgilerini bul
              let ratio;
              for (const category of financialRatioCategories) {
                const found = category.ratios.find(r => r.id === ratioId);
                if (found) {
                  ratio = found;
                  break;
                }
              }
              
              return ratio ? (
                <div
                  key={ratioId}
                  className="bg-primary-50 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {ratio.name}
                  <button
                    className="ml-2 hover:text-primary-900"
                    onClick={() => handleRatioSelect(ratioId)}
                  >
                    &times;
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}