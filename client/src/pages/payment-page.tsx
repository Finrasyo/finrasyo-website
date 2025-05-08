import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, ArrowLeft, ChevronRight } from "lucide-react";

// Stripe yüklemesini bir kere yapıyoruz
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe anahtarı bulunamadı: VITE_STRIPE_PUBLIC_KEY eksik");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Ödeme formu bileşeni
const PaymentForm = ({ creditPackages, onSuccess }: { 
  creditPackages: Array<{ id: string; credits: number; amount: number; popular?: boolean }>;
  onSuccess: () => void;
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string>(creditPackages[1]?.id || "");
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();

  // Seçilen paketin bilgilerini al
  const packageDetails = creditPackages.find(pkg => pkg.id === selectedPackage);

  // Seçilen paket değiştiğinde ödeme niyeti oluştur
  useEffect(() => {
    if (!packageDetails) return;

    const createPaymentIntent = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiRequest("POST", "/api/credits/payment-intent", {
          amount: packageDetails.amount,
          credits: packageDetails.credits
        });

        if (!response.ok) {
          throw new Error("Ödeme oluşturulurken bir hata meydana geldi.");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError("Ödeme başlatılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Ödeme başlatılırken bir hata oluştu.",
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [selectedPackage, toast]);

  // Ödeme formunu gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Kart bilgileri bulunamadı.");
      setLoading(false);
      return;
    }

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.username || "Kullanıcı",
            email: user?.email || undefined,
          },
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message || "Ödeme işlemi başarısız oldu.");
      }

      if (paymentIntent?.status === "succeeded") {
        toast({
          title: "Ödeme Başarılı",
          description: `${packageDetails?.credits} kredi hesabınıza eklendi.`,
        });
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Ödeme işlemi sırasında bir hata oluştu.");
      toast({
        variant: "destructive",
        title: "Ödeme Hatası",
        description: err.message || "Ödeme işlemi sırasında bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ana sayfaya dön
  const goToHome = () => {
    setLocation("/");
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kredi Satın Al</h1>
          <p className="text-muted-foreground">
            Rapor oluşturmak için kredi satın alın
          </p>
        </div>
        <Button variant="outline" onClick={goToHome}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfa
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Bilgileri</CardTitle>
              <CardDescription>
                Güvenli ödeme için kredi kartı bilgilerinizi girin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="card-element">Kredi Kartı Bilgileri</Label>
                  <div className="border rounded-md p-3">
                    <CardElement
                      id="card-element"
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#424770",
                            "::placeholder": {
                              color: "#aab7c4",
                            },
                          },
                          invalid: {
                            color: "#EF4444",
                          },
                        },
                      }}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!stripe || !clientSecret || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> İşleniyor...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" /> {packageDetails ? `${packageDetails.amount} ₺ Öde` : "Ödeme Yap"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Kredi Paketleri</CardTitle>
              <CardDescription>
                İhtiyacınıza uygun paketi seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border rounded-lg mb-3 p-4 ${
                      selectedPackage === pkg.id
                        ? "border-primary"
                        : "border-border"
                    } ${pkg.popular ? "before:content-['Popüler'] before:absolute before:-top-3 before:right-4 before:bg-primary before:text-primary-foreground before:text-xs before:py-1 before:px-2 before:rounded-full" : ""}`}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={pkg.id} id={pkg.id} className="mt-1" />
                      <Label htmlFor={pkg.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{pkg.credits} Kredi</div>
                            <div className="text-sm text-muted-foreground">
                              {(pkg.amount / pkg.credits).toFixed(2)} ₺ / Kredi
                            </div>
                          </div>
                          <div className="font-bold text-lg">{pkg.amount} ₺</div>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 items-start">
              <div className="text-sm text-muted-foreground">
                <p>Her bir rapor oluşturmak için 1 kredi kullanılır.</p>
                <p>Satın alınan krediler süresizdir.</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Ana ödeme sayfası bileşeni
export default function PaymentPage() {
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Ödeme tamamlandığında
  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    setTimeout(() => {
      setLocation("/");
    }, 3000);
  };

  // Örnek kredi paketleri
  const creditPackages = [
    { id: "basic", credits: 5, amount: 49.99 },
    { id: "standard", credits: 15, amount: 99.99, popular: true },
    { id: "premium", credits: 30, amount: 179.99 },
  ];

  // Ödeme tamamlanmışsa başarı mesajı göster
  if (paymentComplete) {
    return (
      <div className="container mx-auto max-w-md py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-green-100 inline-flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Ödeme Başarılı!</h1>
        <p className="text-muted-foreground">
          Kredi satın alımınız tamamlandı. Hesabınıza yönlendiriliyorsunuz...
        </p>
        <Button onClick={() => setLocation("/")} className="mt-4">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        creditPackages={creditPackages} 
        onSuccess={handlePaymentSuccess} 
      />
    </Elements>
  );
}