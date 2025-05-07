import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Percent, Calculator, PieChart, BarChart } from "lucide-react";

// Kullanılabilir finansal oranlar
export type RatioType = 
  | "currentRatio"
  | "liquidityRatio" 
  | "acidTestRatio"
  | "debtToEquityRatio"
  | "interestCoverageRatio"
  | "assetTurnoverRatio"
  | "inventoryTurnoverRatio"
  | "returnOnAssetsRatio"
  | "returnOnEquityRatio"
  | "profitMarginRatio";

// Finansal oranlar hakkında bilgiler
export const ratioInfo = {
  currentRatio: {
    name: "Cari Oran",
    description: "Dönen varlıkların kısa vadeli yükümlülüklere bölünmesiyle elde edilir.",
    formula: "Dönen Varlıklar / Kısa Vadeli Yükümlülükler",
    category: "likidite"
  },
  liquidityRatio: {
    name: "Likidite Oranı",
    description: "Stoklar hariç dönen varlıkların kısa vadeli yükümlülüklere bölünmesiyle elde edilir.",
    formula: "(Dönen Varlıklar - Stoklar) / Kısa Vadeli Yükümlülükler",
    category: "likidite"
  },
  acidTestRatio: {
    name: "Asit-Test Oranı",
    description: "Nakit ve nakit benzerlerinin kısa vadeli yükümlülüklere bölünmesiyle elde edilir.",
    formula: "Nakit ve Nakit Benzerleri / Kısa Vadeli Yükümlülükler",
    category: "likidite"
  },
  debtToEquityRatio: {
    name: "Borç/Özkaynak Oranı",
    description: "Toplam borçların özkaynağa bölünmesiyle elde edilir.",
    formula: "Toplam Borç / Özkaynak",
    category: "finansal yapı"
  },
  interestCoverageRatio: {
    name: "Faiz Karşılama Oranı",
    description: "FVÖK'ün faiz giderlerine bölünmesiyle elde edilir.",
    formula: "FVÖK / Faiz Giderleri",
    category: "finansal yapı"
  },
  assetTurnoverRatio: {
    name: "Aktif Devir Hızı",
    description: "Net satışların toplam varlıklara bölünmesiyle elde edilir.",
    formula: "Net Satışlar / Toplam Varlıklar",
    category: "faaliyet"
  },
  inventoryTurnoverRatio: {
    name: "Stok Devir Hızı",
    description: "Satılan malların maliyetinin ortalama stoklara bölünmesiyle elde edilir.",
    formula: "SMM / Ortalama Stoklar",
    category: "faaliyet"
  },
  returnOnAssetsRatio: {
    name: "Aktif Karlılık Oranı (ROA)",
    description: "Net karın toplam varlıklara bölünmesiyle elde edilir.",
    formula: "Net Kar / Toplam Varlıklar",
    category: "karlılık"
  },
  returnOnEquityRatio: {
    name: "Özkaynak Karlılığı (ROE)",
    description: "Net karın özkaynağa bölünmesiyle elde edilir.",
    formula: "Net Kar / Özkaynak",
    category: "karlılık"
  },
  profitMarginRatio: {
    name: "Kar Marjı",
    description: "Net karın net satışlara bölünmesiyle elde edilir.",
    formula: "Net Kar / Net Satışlar",
    category: "karlılık"
  }
};

// Kategori bilgileri
const categories = [
  { id: "likidite", name: "Likidite Oranları", icon: <Percent className="h-4 w-4" /> },
  { id: "finansal yapı", name: "Finansal Yapı Oranları", icon: <Calculator className="h-4 w-4" /> },
  { id: "faaliyet", name: "Faaliyet Oranları", icon: <BarChart className="h-4 w-4" /> },
  { id: "karlılık", name: "Karlılık Oranları", icon: <PieChart className="h-4 w-4" /> }
];

interface RatioSelectorProps {
  selectedRatios: RatioType[];
  onRatioSelect: (ratios: RatioType[]) => void;
}

export default function RatioSelector({ selectedRatios, onRatioSelect }: RatioSelectorProps) {
  const handleRatioToggle = (ratio: RatioType) => {
    if (selectedRatios.includes(ratio)) {
      onRatioSelect(selectedRatios.filter(r => r !== ratio));
    } else {
      onRatioSelect([...selectedRatios, ratio]);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          Oran Türü
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category.id} className="space-y-2">
              <h3 className="flex items-center text-sm font-medium text-neutral-700">
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </h3>
              <div className="ml-6 space-y-2">
                {Object.entries(ratioInfo)
                  .filter(([_, info]) => info.category === category.id)
                  .map(([ratioKey, info]) => (
                    <div key={ratioKey} className="flex items-start space-x-2">
                      <Checkbox 
                        id={ratioKey} 
                        checked={selectedRatios.includes(ratioKey as RatioType)}
                        onCheckedChange={() => handleRatioToggle(ratioKey as RatioType)}
                      />
                      <div className="grid gap-0.5 leading-none">
                        <Label
                          htmlFor={ratioKey}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {info.name}
                        </Label>
                        <p className="text-xs text-neutral-500 hidden group-hover:block">
                          {info.formula}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}