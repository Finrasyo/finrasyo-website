import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function FetchBistCompaniesPage() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{code: string; name: string; sector: string}[]>([]);
  const [error, setError] = useState("");

  // BIST şirketlerini çeken fonksiyon
  const fetchBistCompanies = async () => {
    setLoading(true);
    setError("");
    
    try {
      // BIST şirketlerini KAP'tan çekme
      const response = await axios.get("https://www.kap.org.tr/tr/bist-sirketler");
      const html = response.data;
      
      // HTML'den tablo verisini ayıklama
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const rows = Array.from(doc.querySelectorAll("table.comp-table tbody tr"));
      
      const extractedCompanies = rows.map(row => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length >= 3) {
          return {
            code: cells[0]?.textContent?.trim() || "",
            name: cells[1]?.textContent?.trim() || "",
            sector: cells[2]?.textContent?.trim() || ""
          };
        }
        return null;
      }).filter((company): company is {code: string; name: string; sector: string} => company !== null);
      
      setCompanies(extractedCompanies);
    } catch (err) {
      console.error("BIST şirketleri çekilirken hata oluştu:", err);
      setError("Şirket verileri çekilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Çekilen şirketleri tsv formatında export etme
  const exportCompanies = () => {
    if (companies.length === 0) return;
    
    const tsv = companies.map(company => 
      `{ code: "${company.code}", name: "${company.name}", sector: "${company.sector}" },`
    ).join("\n");
    
    const blob = new Blob([tsv], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bist-companies.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Borsa İstanbul Şirketleri Veri Çekme</h1>
      <p className="text-muted-foreground mb-6">
        Bu sayfa, güncel BIST şirketlerini çekmenize ve yeni listeyi oluşturmanıza olanak tanır.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>BIST Şirketleri Çekme İşlemi</CardTitle>
            <CardDescription>
              KAP (Kamuyu Aydınlatma Platformu) üzerinden güncel BIST şirketlerini çeker.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={fetchBistCompanies} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Şirketleri Çek
                </Button>
                
                <Button
                  variant="outline"
                  disabled={companies.length === 0 || loading}
                  onClick={exportCompanies}
                >
                  TSV Olarak İndir
                </Button>
              </div>
              
              {error && (
                <div className="text-sm p-3 rounded bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                {loading
                  ? "Veriler çekiliyor, lütfen bekleyin..."
                  : companies.length > 0
                  ? `${companies.length} şirket başarıyla çekildi.`
                  : "Henüz veri çekilmedi."}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Çekilen Şirketler</CardTitle>
            <CardDescription>
              Çekilen şirket listesi burada görüntülenir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companies.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {companies.map((company, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{company.code}</Badge>
                        <span className="text-xs text-muted-foreground">{company.sector}</span>
                      </div>
                      <div className="mt-1 font-medium">{company.name}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Şirket çekme işlemi henüz yapılmadı.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="prose max-w-none">
        <h2>Nasıl Kullanılır?</h2>
        <ol>
          <li>"Şirketleri Çek" butonuna tıklayarak güncel BIST şirket listesini çekin.</li>
          <li>"TSV Olarak İndir" butonuyla çekilen verileri TSV formatında indirin.</li>
          <li>İndirilen dosyayı <code>client/src/data/bist-companies.ts</code> dosyasına ekleyin.</li>
        </ol>
        
        <h2>Teknik Detaylar</h2>
        <p>
          Bu araç, KAP (Kamuyu Aydınlatma Platformu) web sitesinden şirket verilerini çekmektedir.
          CORS kısıtlamaları nedeniyle doğrudan bir sorun yaşanabilir, bu durumda alternatif bir
          API kullanmak gerekebilir.
        </p>
      </div>
    </div>
  );
}