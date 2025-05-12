import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Check } from "lucide-react";
import { bistCompanies, searchCompanies } from "@/data/bist-companies";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompanySelectorProps {
  onSelect: (company: { code: string; name: string; sector: string }) => void;
  initialValue?: string; // company code
}

export default function CompanySelector({ onSelect, initialValue }: CompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<{ code: string; name: string; sector: string } | null>(null);
  const [filteredCompanies, setFilteredCompanies] = useState<typeof bistCompanies>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // initialValue değiştiğinde seçili şirketi ayarla
  useEffect(() => {
    if (initialValue) {
      const company = bistCompanies.find(c => c.code === initialValue);
      if (company) {
        setSelectedCompany(company);
      }
    }
  }, [initialValue]);
  
  // Arama yapıldığında şirketleri filtrele
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setFilteredCompanies([]);
      return;
    }
    
    const results = searchCompanies(searchTerm).slice(0, 15);
    setFilteredCompanies(results);
    setShowSuggestions(true);
  }, [searchTerm]);
  
  const handleSelectCompany = (company: typeof bistCompanies[0]) => {
    setSelectedCompany(company);
    setSearchTerm("");
    setShowSuggestions(false);
    onSelect(company);
  };
  
  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setShowSuggestions(true);
    }
  };
  
  const handleInputBlur = () => {
    // Input'tan çıkıldığında hemen gizleme, 200ms gecikmeli gizle
    // Böylece kullanıcı bir öneri seçebilir
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };
  
  return (
    <div className="space-y-4">
      {selectedCompany ? (
        <div className="p-3 border rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-lg">{selectedCompany.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{selectedCompany.code}</Badge>
                <span className="text-sm text-muted-foreground">{selectedCompany.sector}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCompany(null);
                setSearchTerm("");
              }}
            >
              Değiştir
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center shadow-sm border rounded-md">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Şirket adı veya kodu ara (en az 2 karakter)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          {/* Öneriler Listesi */}
          {showSuggestions && filteredCompanies.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
              <ScrollArea className="max-h-[300px]">
                <div className="py-1">
                  {filteredCompanies.map(company => (
                    <div
                      key={company.code}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectCompany(company)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{company.name}</span>
                        <span className="text-sm text-gray-500">{company.code}</span>
                      </div>
                      <Badge variant="outline">{company.sector}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}