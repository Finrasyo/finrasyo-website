import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Ad Soyad en az 2 karakter olmalıdır." }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
  message: z.string().min(10, { message: "Mesaj en az 10 karakter olmalıdır." })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "İletişim formu gönderilirken bir hata oluştu");
      }
      
      toast({
        title: "Mesajınız gönderildi",
        description: "En kısa sürede size dönüş yapacağız.",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Bir hata oluştu",
        description: error.message || "Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FinRasyo</h1>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900">
            İletişim
          </h2>
        </div>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>İletişim Formu</CardTitle>
                  <CardDescription>
                    Bizimle iletişime geçmek için formu doldurun
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Soyad</FormLabel>
                            <FormControl>
                              <Input placeholder="Ad Soyad" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-posta</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="ornek@mail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mesajınız</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Mesajınızı buraya yazın..." 
                                className="resize-none h-32" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Gönder
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="text-sm text-neutral-500 text-center">
                  Mesajlarınız drosmankursat@yandex.com adresine iletilecektir.
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">İletişim Bilgilerimiz</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <MapPin className="h-6 w-6 text-primary mr-3" />
                    <div className="flex flex-col">
                      <span>Serra Yazılım</span>
                      <span>MAKÜ-BAKA Teknokent Zemin Kat No:102</span>
                      <span>Merkez / BURDUR</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaWhatsapp className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span>WhatsApp İletişim</span>
                      <a 
                        href="https://wa.me/905518845637" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 hover:underline font-medium flex items-center"
                      >
                        0551 884 5637
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
              

            </div>
          </div>
          
          <div className="mt-8 text-center">
            <a 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}