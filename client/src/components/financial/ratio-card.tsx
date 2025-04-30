import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { getRatioEvaluation, getChangeDetails } from "@/lib/utils";

interface RatioCardProps {
  title: string;
  value: number;
  type: "currentRatio" | "liquidityRatio" | "acidTestRatio";
  formula: string;
  formulaValues: string;
  previousValue?: number;
  comparisonLabel?: string;
}

export default function RatioCard({
  title,
  value,
  type,
  formula,
  formulaValues,
  previousValue,
  comparisonLabel = "2022'ye göre"
}: RatioCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Get evaluation of ratio value
  const evaluation = getRatioEvaluation(value, type);
  
  // Calculate change
  const change = getChangeDetails(value, previousValue);
  
  // Generate chart data (simplified for now)
  const chartData = {
    height1: "40%",
    height2: "60%",
    height3: "80%",
    height4: value >= 2 ? "100%" : `${(value / 2) * 100}%`
  };
  
  return (
    <Card className="bg-neutral-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-semibold">{title}</CardTitle>
          <Badge
            variant={
              evaluation.color === "green"
                ? "success"
                : evaluation.color === "yellow"
                ? "warning"
                : "destructive"
            }
          >
            {evaluation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-600">{value.toFixed(2)}</span>
            {previousValue !== undefined && (
              <div className="text-xs text-neutral-500 mt-1">
                <span className={`inline-flex items-center text-${change.color}`}>
                  {change.isIncrease ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(change.change).toFixed(2)} ({comparisonLabel})
                </span>
              </div>
            )}
          </div>
          <div className="chart-container w-24 h-12">
            <div className="h-full flex items-end">
              <div className={`w-3 h-[${chartData.height1}] bg-neutral-300 rounded-sm mr-1`}></div>
              <div className={`w-3 h-[${chartData.height2}] bg-neutral-400 rounded-sm mr-1`}></div>
              <div className={`w-3 h-[${chartData.height3}] bg-neutral-500 rounded-sm mr-1`}></div>
              <div className={`w-3 h-[${chartData.height4}] bg-primary-500 rounded-sm`}></div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-neutral-600">
          <p>{formula}</p>
          <p className="mt-1">{formulaValues}</p>
        </div>
        
        <div className="mt-3 text-xs text-neutral-600">
          <p><strong>Değerlendirme:</strong> {getEvaluationText(type, value)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get detailed evaluation text based on ratio type and value
function getEvaluationText(
  type: "currentRatio" | "liquidityRatio" | "acidTestRatio",
  value: number
): string {
  switch (type) {
    case "currentRatio":
      if (value >= 2.0) {
        return "Şirketin kısa vadeli borçlarını karşılama kapasitesi güçlüdür. 2.0 değeri, şirketin her 1 TL kısa vadeli borcuna karşılık 2 TL'lik dönen varlığa sahip olduğunu gösterir.";
      } else if (value >= 1.5) {
        return "Şirketin kısa vadeli borçlarını karşılama kapasitesi yeterlidir. 1.5-2.0 aralığındaki değer, şirketin kısa vadeli yükümlülüklerini karşılayabileceğini gösterir.";
      } else if (value >= 1.0) {
        return "Şirketin kısa vadeli borçlarını karşılama kapasitesi kabul edilebilir düzeydedir. 1.0 değeri, şirketin dönen varlıklarının kısa vadeli borçlarını tam olarak karşılayabildiğini gösterir.";
      } else {
        return "Şirketin kısa vadeli borçlarını karşılama kapasitesi yetersizdir. 1.0'ın altındaki değer, şirketin kısa vadeli borçlarını karşılamak için dönen varlıklarının yeterli olmadığını gösterir.";
      }
      
    case "liquidityRatio":
      if (value >= 1.5) {
        return "Şirketin stoklar hariç dönen varlıklarının kısa vadeli borçlarını karşılama kapasitesi güçlüdür. Bu, şirketin stokları satmadan bile borçlarını ödeyebileceğini gösterir.";
      } else if (value >= 1.0) {
        return "Şirketin stoklar hariç dönen varlıklarının kısa vadeli borçlarını karşılama kapasitesi yeterlidir. 1.0 üzerindeki değer genellikle olumlu kabul edilir.";
      } else if (value >= 0.8) {
        return "Şirketin stoklar hariç dönen varlıklarının kısa vadeli borçlarını karşılama kapasitesi sınırdadır. Dikkatli izlenmesi gerekir.";
      } else {
        return "Şirketin stoklar hariç dönen varlıklarının kısa vadeli borçlarını karşılama kapasitesi yetersizdir. Şirket, borçlarını ödemek için stoklarını satmaya bağımlı olabilir.";
      }
      
    case "acidTestRatio":
      if (value >= 0.8) {
        return "Şirketin en likit varlıklarının kısa vadeli borçlarını karşılama kapasitesi yeterlidir. 0.8 üzeri değerler genellikle olumlu kabul edilir. Nakit pozisyonu güçlüdür.";
      } else if (value >= 0.5) {
        return "Şirketin en likit varlıklarının kısa vadeli borçlarını karşılama kapasitesi kabul edilebilir. Nakit pozisyonu makul seviyededir.";
      } else if (value >= 0.3) {
        return "Şirketin en likit varlıklarının kısa vadeli borçlarını karşılama kapasitesi sınırlıdır. Nakit akışının iyileştirilmesi gerekebilir.";
      } else {
        return "Şirketin en likit varlıklarının kısa vadeli borçlarını karşılama kapasitesi yetersizdir. Nakit pozisyonunun güçlendirilmesi gerekir.";
      }
      
    default:
      return "Değerlendirme bilgisi bulunamadı.";
  }
}
