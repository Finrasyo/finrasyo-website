import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { bistCompanies } from "@/data/bist-companies";

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
  maxResults = 25
}: MultiCompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>(initialSelectedCompanies);
  
  // Arama yapıldığında şirketleri filtrele
  const filteredCompanies = searchTerm.length > 0
    ? bistCompanies.filter(company => {
        const search = searchTerm.toLowerCase();
        return (
          company.code.toLowerCase().includes(search) || 
          company.name.toLowerCase().includes(search) ||
          company.sector.toLowerCase().includes(search)
        );
      }).slice(0, maxResults)
    : bistCompanies.slice(0, maxResults);
  
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
  };
  
  // Şirket seçimini kaldır
  const handleRemoveCompany = (companyCode: string) => {
    setSelectedCompanies(selectedCompanies.filter(c => c.code !== companyCode));
  };
  
  // Tüm seçimleri temizle
  const handleClearAll = () => {
    setSelectedCompanies([]);
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Şirket adı veya kodu ara..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex-1 w-full"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Sonuç bulunamadı...</CommandEmpty>
            <CommandGroup heading="Şirketler">
              {filteredCompanies.map(company => (
                <CommandItem
                  key={company.code}
                  onSelect={() => handleSelectCompany(company)}
                  className="flex justify-between"
                >
                  <div>
                    <span className="font-medium">{company.code}</span>
                    <span className="ml-2 text-neutral-500">{company.name}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{company.sector}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      
      {selectedCompanies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-500">
              Seçilen Şirketler ({selectedCompanies.length})
            </h3>
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