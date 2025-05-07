import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  const [navigate] = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FinRasyo</h1>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900">
            Nasıl Çalışır
          </h2>
        </div>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="prose max-w-none">
            <p className="text-lg mb-6">
              FinRasyo, finansal veri analizini basitleştirmek için tasarlanmıştır. Aşağıdaki adımlarla kolayca kullanabilirsiniz:
            </p>
            
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white mr-3">1</span>
                <span>Hesabınıza giriş yapın veya yeni bir hesap oluşturun.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white mr-3">2</span>
                <span>Analizini yapmak istediğiniz şirketi ekleyin veya var olan şirketlerden birini seçin.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white mr-3">3</span>
                <span>Şirketin finansal verilerini girin (dönen varlıklar, kısa vadeli yükümlülükler vb.).</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white mr-3">4</span>
                <span>Sistem otomatik olarak finansal oranları hesaplayacaktır.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white mr-3">5</span>
                <span>İsterseniz PDF, Word, Excel veya CSV formatlarında raporlar oluşturabilirsiniz.</span>
              </li>
            </ol>
            
            <p className="text-lg mt-6">
              Her rapor oluşturma işlemi için bir kredi kullanılır. Bakiye yükleyerek daha fazla rapor oluşturabilirsiniz.
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <Button
              onClick={() => navigate("/")}
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