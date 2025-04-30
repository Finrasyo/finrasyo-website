import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number as currency (TRY)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Format number with commas and dots as thousands separators
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

// Format date to local string
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('tr-TR');
}

// Get ratio evaluation text
export function getRatioEvaluation(ratio: number, ratioType: string): { status: string, color: string } {
  // These thresholds are based on financial industry standards
  switch (ratioType) {
    case 'currentRatio':
      if (ratio >= 2.0) return { status: 'İyi', color: 'green' };
      if (ratio >= 1.5) return { status: 'Yeterli', color: 'green' };
      if (ratio >= 1.0) return { status: 'Orta', color: 'yellow' };
      return { status: 'Zayıf', color: 'red' };
      
    case 'liquidityRatio':
      if (ratio >= 1.5) return { status: 'İyi', color: 'green' };
      if (ratio >= 1.0) return { status: 'Yeterli', color: 'green' };
      if (ratio >= 0.8) return { status: 'Orta', color: 'yellow' };
      return { status: 'Zayıf', color: 'red' };
      
    case 'acidTestRatio':
      if (ratio >= 0.8) return { status: 'İyi', color: 'green' };
      if (ratio >= 0.5) return { status: 'Yeterli', color: 'yellow' };
      if (ratio >= 0.3) return { status: 'Orta', color: 'yellow' };
      return { status: 'Zayıf', color: 'red' };
      
    default:
      return { status: 'Bilinmiyor', color: 'gray' };
  }
}

// Get change icon and color
export function getChangeDetails(current: number, previous: number | undefined): { change: number, isIncrease: boolean, color: string } {
  if (previous === undefined) {
    return { change: 0, isIncrease: false, color: 'neutral-500' };
  }
  
  const change = current - previous;
  const isIncrease = change > 0;
  const color = isIncrease ? 'green-600' : change < 0 ? 'red-600' : 'neutral-500';
  
  return { change, isIncrease, color };
}

// Calculate percentage change
export function calculatePercentageChange(current: number, previous: number | undefined): number {
  if (previous === undefined || previous === 0) {
    return 0;
  }
  
  return ((current - previous) / previous) * 100;
}
