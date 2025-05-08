import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Şifre sıfırlama isteği formu için validasyon şeması
const requestResetSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

// Yeni şifre formu için validasyon şeması
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalıdır"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [token, setToken] = useState<string | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // URL'den token varsa al
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    
    if (tokenParam) {
      setToken(tokenParam);
      setStep("reset");
    }
  }, []);
  
  // Şifre sıfırlama isteği formu
  const requestResetForm = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });
  
  // Yeni şifre belirleme formu
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  // Şifre sıfırlama isteği gönderme
  const onRequestResetSubmit = async (values: RequestResetFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/request-password-reset", values);
      const data = await response.json();
      
      toast({
        title: "Şifre Sıfırlama İsteği Gönderildi",
        description: "Şifre sıfırlama talimatları e-posta adresinize gönderilmiştir.",
      });
      
      // DEV ONLY: Token'ı doğrudan al - gerçek uygulamada bu olmayacak
      if (data.token) {
        setToken(data.token);
        setStep("reset");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Şifre sıfırlama isteği gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Yeni şifre belirleme
  const onResetPasswordSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast({
        title: "Hata",
        description: "Geçersiz veya eksik token.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/reset-password", {
        token,
        password: values.password,
      });
      
      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Şifreniz başarıyla sıfırlandı. Şimdi yeni şifrenizle giriş yapabilirsiniz.",
        });
        
        // 2 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      } else {
        const data = await response.json();
        throw new Error(data.message || "Şifre sıfırlama işlemi başarısız oldu.");
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Şifre sıfırlanırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-primary">FinRasyo</h1>
        <h2 className="mt-2 text-center text-2xl font-bold text-neutral-900">
          Şifre Sıfırlama
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === "request" ? (
            <Card>
              <CardHeader>
                <CardTitle>Şifre Sıfırlama İsteği</CardTitle>
                <CardDescription>
                  Hesabınızla ilişkili e-posta adresinizi girin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...requestResetForm}>
                  <form onSubmit={requestResetForm.handleSubmit(onRequestResetSubmit)} className="space-y-4">
                    <FormField
                      control={requestResetForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta Adresi</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ornek@mail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        "Şifre Sıfırlama Bağlantısı Gönder"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link to="/auth" className="text-sm text-primary hover:underline">
                  Giriş sayfasına dön
                </Link>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Yeni Şifre Oluştur</CardTitle>
                <CardDescription>
                  Lütfen yeni şifrenizi girin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...resetPasswordForm}>
                  <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={resetPasswordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yeni Şifre</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetPasswordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şifre Tekrar</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        "Şifreyi Sıfırla"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link to="/auth" className="text-sm text-primary hover:underline">
                  Giriş sayfasına dön
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}