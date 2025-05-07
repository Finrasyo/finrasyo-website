import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FinRasyo</h1>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900">
            İletişim
          </h2>
        </div>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg mb-6">
                Sorularınız veya geri bildirimleriniz için bize ulaşabilirsiniz:
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Mail className="h-6 w-6 text-primary mr-3" />
                  <span>info@finrasyo.com</span>
                </li>
                <li className="flex items-start">
                  <Phone className="h-6 w-6 text-primary mr-3" />
                  <span>+90 (212) 555 1234</span>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary mr-3" />
                  <span>Levent, İstanbul</span>
                </li>
              </ul>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Çalışma Saatlerimiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Pazartesi - Cuma:</span>
                      <span>09:00 - 18:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Cumartesi:</span>
                      <span>10:00 - 14:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Pazar:</span>
                      <span>Kapalı</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button
              onClick={() => setLocation("/")}
              className="mt-4"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}