import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FinancialData } from "@shared/schema";
import { useFinancialData } from "@/hooks/use-financial-data";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

// Schema for financial data form
const financialDataSchema = z.object({
  year: z.string().min(4, "Yıl belirtmelisiniz"),
  cashAndEquivalents: z.string().min(1, "Bu alan gereklidir"),
  accountsReceivable: z.string().min(1, "Bu alan gereklidir"),
  inventory: z.string().min(1, "Bu alan gereklidir"),
  otherCurrentAssets: z.string().min(1, "Bu alan gereklidir"),
  shortTermDebt: z.string().min(1, "Bu alan gereklidir"),
  accountsPayable: z.string().min(1, "Bu alan gereklidir"),
  otherCurrentLiabilities: z.string().min(1, "Bu alan gereklidir"),
});

type FinancialDataFormValues = z.infer<typeof financialDataSchema>;

interface FinancialDataFormProps {
  companyId: number;
  initialData?: FinancialData | null;
  onSubmitted: (data: FinancialData) => void;
}

export default function FinancialDataForm({ 
  companyId, 
  initialData,
  onSubmitted 
}: FinancialDataFormProps) {
  const { saveFinancialData } = useFinancialData();
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [totalCurrentAssets, setTotalCurrentAssets] = useState(0);
  const [totalCurrentLiabilities, setTotalCurrentLiabilities] = useState(0);
  
  // Create form with default values
  const form = useForm<FinancialDataFormValues>({
    resolver: zodResolver(financialDataSchema),
    defaultValues: initialData ? {
      year: initialData.year.toString(),
      cashAndEquivalents: initialData.cashAndEquivalents.toString(),
      accountsReceivable: initialData.accountsReceivable.toString(),
      inventory: initialData.inventory.toString(),
      otherCurrentAssets: initialData.otherCurrentAssets.toString(),
      shortTermDebt: initialData.shortTermDebt.toString(),
      accountsPayable: initialData.accountsPayable.toString(),
      otherCurrentLiabilities: initialData.otherCurrentLiabilities.toString(),
    } : {
      year: new Date().getFullYear().toString(),
      cashAndEquivalents: "",
      accountsReceivable: "",
      inventory: "",
      otherCurrentAssets: "",
      shortTermDebt: "",
      accountsPayable: "",
      otherCurrentLiabilities: "",
    }
  });
  
  // Watch all number inputs to calculate totals
  const cashAndEquivalents = form.watch("cashAndEquivalents");
  const accountsReceivable = form.watch("accountsReceivable");
  const inventory = form.watch("inventory");
  const otherCurrentAssets = form.watch("otherCurrentAssets");
  const shortTermDebt = form.watch("shortTermDebt");
  const accountsPayable = form.watch("accountsPayable");
  const otherCurrentLiabilities = form.watch("otherCurrentLiabilities");
  
  // Calculate totals when values change
  useEffect(() => {
    const parseCurrency = (value: string) => {
      if (!value) return 0;
      // Remove non-numeric characters except for decimal point
      const numericValue = value.replace(/[^\d.]/g, '');
      return parseFloat(numericValue) || 0;
    };
    
    const cash = parseCurrency(cashAndEquivalents);
    const receivables = parseCurrency(accountsReceivable);
    const inv = parseCurrency(inventory);
    const otherAssets = parseCurrency(otherCurrentAssets);
    
    const debt = parseCurrency(shortTermDebt);
    const payables = parseCurrency(accountsPayable);
    const otherLiabilities = parseCurrency(otherCurrentLiabilities);
    
    setTotalCurrentAssets(cash + receivables + inv + otherAssets);
    setTotalCurrentLiabilities(debt + payables + otherLiabilities);
  }, [
    cashAndEquivalents,
    accountsReceivable,
    inventory,
    otherCurrentAssets,
    shortTermDebt,
    accountsPayable,
    otherCurrentLiabilities
  ]);
  
  const onSubmit = async (values: FinancialDataFormValues) => {
    setIsCalculating(true);
    
    try {
      // Parse all string values to numbers
      const parseCurrency = (value: string) => {
        if (!value) return 0;
        // Remove non-numeric characters except for decimal point
        const numericValue = value.replace(/[^\d.]/g, '');
        return parseFloat(numericValue) || 0;
      };
      
      const cash = parseCurrency(values.cashAndEquivalents);
      const receivables = parseCurrency(values.accountsReceivable);
      const inv = parseCurrency(values.inventory);
      const otherAssets = parseCurrency(values.otherCurrentAssets);
      
      const debt = parseCurrency(values.shortTermDebt);
      const payables = parseCurrency(values.accountsPayable);
      const otherLiabilities = parseCurrency(values.otherCurrentLiabilities);
      
      const currentAssets = cash + receivables + inv + otherAssets;
      const currentLiabilities = debt + payables + otherLiabilities;
      
      // Prepare data for API
      const financialData = {
        companyId,
        year: parseInt(values.year),
        cashAndEquivalents: cash,
        accountsReceivable: receivables,
        inventory: inv,
        otherCurrentAssets: otherAssets,
        totalCurrentAssets: currentAssets,
        shortTermDebt: debt,
        accountsPayable: payables,
        otherCurrentLiabilities: otherLiabilities,
        totalCurrentLiabilities: currentLiabilities
      };
      
      // Save data to API
      const result = await saveFinancialData(financialData);
      
      // Notify parent component
      onSubmitted(result);
      
      toast({
        title: "Başarılı",
        description: "Finansal veriler kaydedildi ve oranlar hesaplandı."
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Finansal veri kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Format input as currency
  const formatCurrencyInput = (value: string) => {
    // Remove any non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Format with thousands separator
    return numericValue ? formatNumber(parseInt(numericValue)) : '';
  };
  
  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finansal Veri Girişi</CardTitle>
        <CardDescription>
          Aşağıdaki verileri şirketin yıllık raporundan giriniz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-end">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem className="w-40">
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Yıl seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {yearOptions.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year} Yılı
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Assets */}
              <div>
                <h3 className="text-md font-semibold text-neutral-800 mb-4">Dönen Varlıklar</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cashAndEquivalents"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="w-2/3">Nakit ve Nakit Benzerleri</FormLabel>
                          <div className="w-1/3">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-neutral-500 sm:text-sm">₺</span>
                              </div>
                              <FormControl>
                                <Input
                                  className="pl-7"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatCurrencyInput(e.target.value));
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accountsReceivable"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="w-2/3">Ticari Alacaklar</FormLabel>
                          <div className="w-1/3">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-neutral-500 sm:text-sm">₺</span>
                              </div>
                              <FormControl>
                                <Input
                                  className="pl-7"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatCurrencyInput(e.target.value));
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="inventory"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="w-2/3">Stoklar</FormLabel>
                          <div className="w-1/3">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-neutral-500 sm:text-sm">₺</span>
                              </div>
                              <FormControl>
                                <Input
                                  className="pl-7"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatCurrencyInput(e.target.value));
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="otherCurrentAssets"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="w-2/3">Diğer Dönen Varlıklar</FormLabel>
                          <div className="w-1/3">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-neutral-500 sm:text-sm">₺</span>
                              </div>
                              <FormControl>
                                <Input
                                  className="pl-7"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatCurrencyInput(e.target.value));
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Total Current Assets */}
                  <div className="flex items-center pt-2 border-t border-neutral-200">
                    <label className="block text-sm font-medium text-neutral-800 w-2/3">
                      Toplam Dönen Varlıklar
                    </label>
                    <div className="w-1/3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-neutral-500 sm:text-sm">₺</span>
                        </div>
                        <Input
                          className="bg-neutral-50 pl-7 font-medium"
                          value={formatNumber(totalCurrentAssets)}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Current Liabilities */}
              <div>
                <h3 className="text-md font-semibold text-neutral-800 mb-4">Kısa Vadeli Yükümlülükler</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shortTermDebt"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="w-2/3">Kısa Vadeli Finansal Borçlar</FormLabel>
                          <div className="w-1/3">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-neutral-500 sm:text-sm">₺</span>
                              </div>
                              <FormControl>
                                <Input
                                  className="pl-7"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatCurrencyInput(e.target.value));
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accountsPayable"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="w-2/3">Ticari Borçlar</FormLabel>
                          <div className="w-1/3">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-neutral-500 sm:text-sm">₺</span>
                              </div>
                              <FormControl>
                                <Input
                                  className="pl-7"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatCurrencyInput(e.target.value));
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="otherCurrentLiabilities"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="w-2/3">Diğer Kısa Vadeli Yükümlülükler</FormLabel>
                          <div className="w-1/3">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-neutral-500 sm:text-sm">₺</span>
                              </div>
                              <FormControl>
                                <Input
                                  className="pl-7"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatCurrencyInput(e.target.value));
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Total Current Liabilities */}
                  <div className="flex items-center pt-2 border-t border-neutral-200">
                    <label className="block text-sm font-medium text-neutral-800 w-2/3">
                      Toplam Kısa Vadeli Yükümlülükler
                    </label>
                    <div className="w-1/3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-neutral-500 sm:text-sm">₺</span>
                        </div>
                        <Input
                          className="bg-neutral-50 pl-7 font-medium"
                          value={formatNumber(totalCurrentLiabilities)}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
              >
                Vazgeç
              </Button>
              <Button 
                type="submit" 
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Hesaplanıyor...
                  </>
                ) : (
                  "Hesapla"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
