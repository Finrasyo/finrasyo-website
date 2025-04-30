import { useState, useEffect } from "react";
import { Company } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building } from "lucide-react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanySelector() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    data: companies = [], 
    isLoading, 
    error 
  } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.code && company.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isRecent = (date: Date | string) => {
    const lastUpdated = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Şirket Seç</CardTitle>
          <CardDescription>Analiz etmek istediğiniz şirketi seçin veya yeni şirket ekleyin</CardDescription>
        </div>
        <Button className="mt-3 sm:mt-0" asChild>
          <Link href="/company/new">
            <Plus className="mr-2 h-4 w-4" /> Yeni Şirket Ekle
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Şirket adı veya kodu ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="mt-3 space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 border border-neutral-200 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-md mr-3" />
                  <div>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-3 p-3 border border-red-200 bg-red-50 text-red-600 rounded-md">
            Şirketler yüklenirken bir hata oluştu. Lütfen tekrar deneyiniz.
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="mt-3 p-3 border border-neutral-200 bg-neutral-50 rounded-md text-center">
            {searchQuery ? (
              <p className="text-neutral-600">"{searchQuery}" için sonuç bulunamadı.</p>
            ) : (
              <p className="text-neutral-600">Henüz bir şirket eklenmemiş. "Yeni Şirket Ekle" butonuna tıklayarak başlayın.</p>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {filteredCompanies.map((company) => (
              <Link key={company.id} href={`/company/${company.id}`}>
                <div className="p-3 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-neutral-100 rounded-md p-2 mr-3">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">{company.name}</h3>
                      <p className="text-xs text-neutral-500">Son güncelleme: {formatDate(company.lastUpdated)}</p>
                    </div>
                  </div>
                  <div>
                    <Badge variant={isRecent(company.lastUpdated) ? "success" : "warning"}>
                      {isRecent(company.lastUpdated) ? "Güncel" : "Güncelleme gerekli"}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
