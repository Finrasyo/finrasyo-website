import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft, AlertCircle, Check } from "lucide-react";

// Email schema
const requestResetSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

// Password reset schema
const passwordResetSchema = z.object({
  token: z.string().min(1, "Token gereklidir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;
type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export default function ResetPasswordPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Parse token from URL query parameters
  useEffect(() => {
    if (location.includes("?token=")) {
      const urlToken = location.split("?token=")[1];
      setToken(urlToken);
    }
  }, [location]);
  
  // Request reset form
  const requestResetForm = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });
  
  // Password reset form
  const passwordResetForm = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Set token from URL to form
  useEffect(() => {
    if (token) {
      passwordResetForm.setValue("token", token);
    }
  }, [token, passwordResetForm]);
  
  // Request password reset mutation
  const requestResetMutation = useMutation({
    mutationFn: async (data: RequestResetFormValues) => {
      const res = await apiRequest("POST", "/api/request-password-reset", data);
      return await res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Şifre sıfırlama isteği gönderildi",
        description: "E-posta adresinize şifre sıfırlama talimatları gönderildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Şifre sıfırlama isteği başarısız",
        description: "E-posta adresiniz sistemde bulunamadı.",
        variant: "destructive",
      });
    },
  });
  
  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: PasswordResetFormValues) => {
      const res = await apiRequest("POST", "/api/reset-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Şifre başarıyla sıfırlandı",
        description: "Yeni şifrenizle giriş yapabilirsiniz.",
      });
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Şifre sıfırlama başarısız",
        description: "Geçersiz veya süresi dolmuş token. Lütfen tekrar şifre sıfırlama isteği gönderin.",
        variant: "destructive",
      });
    },
  });
  
  const onRequestResetSubmit = (values: RequestResetFormValues) => {
    requestResetMutation.mutate(values);
  };
  
  const onPasswordResetSubmit = (values: PasswordResetFormValues) => {
    resetPasswordMutation.mutate(values);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-neutral-900">
          Şifre Sıfırlama
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          <Link href="/auth">
            <a className="font-medium text-primary hover:text-primary-dark inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Giriş sayfasına dön
            </a>
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {token ? (
            // If token is present, show password reset form
            <Card>
              <CardHeader>
                <CardTitle>Yeni Şifre Belirleyin</CardTitle>
                <CardDescription>
                  Lütfen yeni şifrenizi girin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordResetForm}>
                  <form onSubmit={passwordResetForm.handleSubmit(onPasswordResetSubmit)} className="space-y-4">
                    <FormField
                      control={passwordResetForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token</FormLabel>
                          <FormControl>
                            <Input readOnly {...field} />
                          </FormControl>
                          <FormDescription>
                            Bu token otomatik olarak URL'den alınmıştır.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordResetForm.control}
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
                      control={passwordResetForm.control}
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
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Şifre Sıfırlanıyor...
                        </>
                      ) : (
                        "Şifreyi Sıfırla"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            // If no token, show email form
            <>
              {submitted ? (
                <Alert className="mb-6">
                  <Check className="h-4 w-4" />
                  <AlertTitle>E-posta gönderildi</AlertTitle>
                  <AlertDescription>
                    E-posta adresinize şifre sıfırlama talimatları gönderildi. Lütfen e-postanızı kontrol edin.
                  </AlertDescription>
                </Alert>
              ) : null}
              
              <Card>
                <CardHeader>
                  <CardTitle>Şifre Sıfırlama İsteği</CardTitle>
                  <CardDescription>
                    Hesabınıza bağlı e-posta adresinizi girin
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
                              <Input placeholder="ornek@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={requestResetMutation.isPending}
                      >
                        {requestResetMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            İstek Gönderiliyor...
                          </>
                        ) : (
                          "Sıfırlama Bağlantısı Gönder"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}