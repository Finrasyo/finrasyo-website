import { useState, useEffect } from "react";
import { useLocation, useRoute, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReportFormat } from "@/components/financial/report-format-selector";
import { formatInfo } from "@/components/financial/report-format-selector";
import { RatioType, ratioInfo } from "@/components/financial/ratio-selector";
import { CreditCard, FileDown, CheckCircle, Clock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Kart numarası geçersiz").max(19, "Kart numarası geçersiz"),
  cardName: z.string().min(3, "Kart sahibi adı geçersiz"),
  expiry: z.string().min(5, "Son kullanma tarihi geçersiz").max(5, "Son kullanma tarihi geçersiz"),
  cvc: z.string().min(3, "CVC geçersiz").max(4, "CVC geçersiz"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  const [match, params] = useRoute("/payment");
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // URL parameterlerini al
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [years, setYears] = useState<number[]>([]);
  const [ratios, setRatios] = useState<RatioType[]>([]);
  const [companyId, setCompanyId] = useState<number>(0);
  
  // Ödeme durumu
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // URL parametrelerini parse et
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setSearchParams(searchParams);
      
      const amount = searchParams.get("amount");
      const format = searchParams.get("format");
      const years = searchParams.get("years");
      const ratios = searchParams.get("ratios");
      const companyId = searchParams.get("companyId");
      
      if (amount) setAmount(parseInt(amount));
      if (format) setFormat(format as ReportFormat);
      if (years) setYears(years.split(",").map(year => parseInt(year)));
      if (ratios) setRatios(ratios.split(",") as RatioType[]);
      if (companyId) setCompanyId(parseInt(companyId));
    }
  }, []);
  
  // Şirket verilerini al
  const { 
    data: company,
    isLoading: isLoadingCompany
  } = useQuery({
    queryKey: [`/api/companies/${companyId}`],
    enabled: companyId > 0,
  });
  
  // Ödeme formu
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvc: "",
    },
  });
  
  // Kredi kartı numarasını formatlama
  const formatCardNumber = (value: string) => {
    // Sadece rakamları al
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    // Her 4 rakamdan sonra boşluk ekle
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  // Son kullanma tarihini formatlama
  const formatExpiry = (value: string) => {
    // Sadece rakamları al
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    } else {
      return v;
    }
  };
  
  // Ödeme işlemini simüle et
  const simulatePayment = async (data: PaymentFormValues): Promise<boolean> => {
    // Gerçek uygulamada burada Stripe vs. ile ödeme işlemi yapılır
    return new Promise((resolve) => {
      setTimeout(() => {
        // Başarılı ödeme
        resolve(true);
      }, 2000);
    });
  };
  
  // Ödeme başarılı olduğunda raporu oluştur
  const createReport = async (): Promise<{id: number, downloadUrl: string}> => {
    // Gerçek uygulamada burada API isteği yapılır
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.floor(Math.random() * 1000),
          downloadUrl: `/api/reports/download/${Math.floor(Math.random() * 1000)}`
        });
      }, 1000);
    });
  };
  
  // Ödeme işlemini gerçekleştir
  const handlePayment = async (values: PaymentFormValues) => {
    if (!match || !searchParams) return;
    
    setIsPaying(true);
    
    try {
      // Ödeme işlemini simüle et
      const paymentSuccess = await simulatePayment(values);
      
      if (paymentSuccess) {
        // Rapor oluştur
        const report = await createReport();
        
        // Başarılı mesajı göster
        toast({
          title: "Ödeme Başarılı",
          description: "Raporunuz hazırlanıyor...",
          variant: "default",
        });
        
        setIsSuccess(true);
        
        // 2 saniye sonra rapor indirme sayfasına yönlendir
        setTimeout(() => {
          navigate(`/report/${report.id}`);
        }, 2000);
      } else {
        // Hata mesajı göster
        toast({
          title: "Ödeme Başarısız",
          description: "Lütfen kart bilgilerinizi kontrol edin ve tekrar deneyin.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsPaying(false);
    }
  };
  
  // Sayfadan ayrılma girişiminde uyarı
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPaying) {
        e.preventDefault();
        e.returnValue = "Ödeme işlemi devam ediyor. Sayfadan ayrılmak istediğinize emin misiniz?";
        return e.returnValue;
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPaying]);
  
  if (!match || !searchParams) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Geçersiz Sayfa</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Bu ödeme sayfasına doğrudan erişim sağlanamaz.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/")} className="w-full">
                Ana Sayfaya Dön
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sipariş Özeti */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Sipariş Özeti</CardTitle>
                  <CardDescription>
                    Finansal Rapor Detayları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Seçilen Şirket</h3>
                    {isLoadingCompany ? (
                      <p className="text-neutral-500">Yükleniyor...</p>
                    ) : company ? (
                      <p className="text-neutral-800">{company.name} {company.code ? `(${company.code})` : ""}</p>
                    ) : (
                      <p className="text-neutral-500">Şirket bilgisi bulunamadı.</p>
                    )}
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Seçilen Dönemler</h3>
                    {years.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {years.map(year => (
                          <span key={year} className="bg-primary-50 text-primary px-2 py-1 rounded text-sm">
                            {year}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500">Seçilen dönem yok.</p>
                    )}
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Seçilen Oranlar</h3>
                    {ratios.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {ratios.map(ratio => (
                          <span key={ratio} className="bg-primary-50 text-primary px-2 py-1 rounded text-sm">
                            {ratioInfo[ratio].name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500">Seçilen oran yok.</p>
                    )}
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Rapor Formatı</h3>
                    <div className="flex items-center">
                      {formatInfo[format].icon}
                      <span className="ml-2">{formatInfo[format].name}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-neutral-50 border-t">
                  <div className="font-medium">Toplam Tutar:</div>
                  <div className="text-xl font-bold">{amount} ₺</div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Güvenli Ödeme</CardTitle>
                  <CardDescription>
                    Tüm ödeme bilgileriniz SSL ile korunmaktadır
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>256-bit SSL şifreleme ile güvenli ödeme</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Kredi kartı bilgileriniz saklanmaz</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600 mt-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>7/24 müşteri desteği</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Ödeme Formu */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Ödeme Bilgileri</CardTitle>
                  <CardDescription>
                    Raporu indirmek için ödeme yapın
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-medium text-neutral-800 mb-1">
                        Ödeme Başarılı
                      </h3>
                      <p className="text-neutral-600 mb-6">
                        Raporunuz hazırlanıyor, lütfen bekleyin...
                      </p>
                      <div className="animate-pulse">
                        <FileDown className="h-8 w-8 text-primary mx-auto" />
                      </div>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kart Sahibinin Adı</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="İsim Soyisim"
                                  {...field}
                                  disabled={isPaying}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kart Numarası</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0000 0000 0000 0000"
                                  {...field}
                                  onChange={(e) => {
                                    const formatted = formatCardNumber(e.target.value);
                                    field.onChange(formatted);
                                  }}
                                  disabled={isPaying}
                                  maxLength={19}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="expiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Son Kullanma</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="AA/YY"
                                    {...field}
                                    onChange={(e) => {
                                      const formatted = formatExpiry(e.target.value);
                                      field.onChange(formatted);
                                    }}
                                    disabled={isPaying}
                                    maxLength={5}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cvc"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVC</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="000"
                                    {...field}
                                    onChange={(e) => {
                                      const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                                      field.onChange(v);
                                    }}
                                    disabled={isPaying}
                                    maxLength={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-6"
                          disabled={isPaying}
                        >
                          {isPaying ? (
                            <>
                              <CreditCard className="mr-2 h-4 w-4 animate-pulse" />
                              İşleniyor...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              {amount} ₺ Öde
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}