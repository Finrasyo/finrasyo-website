import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Check } from "lucide-react";
import { bistCompanies, searchCompanies } from "@/data/bist-companies";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Company {
  code: string;
  name: string;
  sector: string;
}

interface MultiCompanySelectorProps {
  onSelectCompanies: (companies: Company[]) => void;
  initialSelectedCompanies?: Company[];
  maxResults?: number;
}

export default function MultiCompanySelector({
  onSelectCompanies,
  initialSelectedCompanies = [],
  maxResults = 10
}: MultiCompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>(initialSelectedCompanies);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Arama yapıldığında şirketleri filtrele
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setFilteredCompanies([]);
      return;
    }
    
    const results = searchCompanies(searchTerm).slice(0, maxResults);
    setFilteredCompanies(results);
    setShowSuggestions(true);
  }, [searchTerm, maxResults]);
  
  // Başlangıç seçili şirketleri
  useEffect(() => {
    if (initialSelectedCompanies && initialSelectedCompanies.length > 0) {
      setSelectedCompanies(initialSelectedCompanies);
    }
  }, [initialSelectedCompanies]);
  
  // Seçimleri parent'a bildir
  useEffect(() => {
    onSelectCompanies(selectedCompanies);
  }, [selectedCompanies, onSelectCompanies]);
  
  // Şirket seçimini işle
  const handleSelectCompany = (company: Company) => {
    // Zaten seçili ise ekleme
    if (selectedCompanies.some(c => c.code === company.code)) {
      return;
    }
    
    setSelectedCompanies([...selectedCompanies, company]);
    setSearchTerm("");
    setShowSuggestions(false);
  };
  
  // Şirket seçimini kaldır
  const handleRemoveCompany = (companyCode: string) => {
    setSelectedCompanies(selectedCompanies.filter(c => c.code !== companyCode));
  };
  
  // Tüm seçimleri temizle
  const handleClearAll = () => {
    setSelectedCompanies([]);
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
      
      {selectedCompanies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Seçilen Şirketler ({selectedCompanies.length})</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              className="h-8 px-2 text-neutral-500"
            >
              Tümünü Temizle
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedCompanies.map(company => (
              <Badge 
                key={company.code} 
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center"
              >
                <span className="font-semibold mr-1">{company.code}</span>
                <span className="text-xs mr-1 truncate max-w-[150px]">{company.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveCompany(company.code)}
                  className="h-5 w-5 p-0 ml-1 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}