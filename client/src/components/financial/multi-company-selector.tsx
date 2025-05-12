import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  maxResults = 15
}: MultiCompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>(initialSelectedCompanies);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Şirketleri filtrele
  const filteredCompanies = bistCompanies.filter(company => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      company.code.toLowerCase().includes(search) ||
      company.name.toLowerCase().includes(search) ||
      company.sector.toLowerCase().includes(search)
    );
  }).slice(0, maxResults);
  
  // Seçilen şirketleri güncelle
  useEffect(() => {
    if (initialSelectedCompanies && initialSelectedCompanies.length > 0) {
      setSelectedCompanies(initialSelectedCompanies);
    }
  }, [initialSelectedCompanies]);
  
  // Şirket seçimi değiştiğinde bildir
  useEffect(() => {
    onSelectCompanies(selectedCompanies);
  }, [selectedCompanies, onSelectCompanies]);
  
  // Dropdown dışına tıklanınca kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Şirket seçim işleyicisi
  const handleSelectCompany = (company: Company) => {
    if (!selectedCompanies.some(c => c.code === company.code)) {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };
  
  // Şirket kaldırma işleyicisi
  const handleRemoveCompany = (code: string) => {
    setSelectedCompanies(selectedCompanies.filter(c => c.code !== code));
  };
  
  // Tüm seçimleri temizle
  const handleClearAll = () => {
    setSelectedCompanies([]);
  };

  return (
    <div className="space-y-4" ref={dropdownRef}>
      <div className="relative w-full">
        <div 
          className="flex items-center shadow-sm rounded-md border border-input px-3 py-1 text-sm ring-offset-background"
          onClick={() => setIsOpen(true)}
        >
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            type="text"
            placeholder="Şirket ara veya seç..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          />
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            <ScrollArea className="max-h-[300px] overflow-auto">
              {filteredCompanies.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  Şirket bulunamadı.
                </div>
              ) : (
                <div className="py-1">
                  {filteredCompanies.map((company) => (
                    <div 
                      key={company.code}
                      className={cn(
                        "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-100",
                        selectedCompanies.some(c => c.code === company.code) && "bg-gray-100"
                      )}
                      onClick={() => handleSelectCompany(company)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{company.name}</span>
                        <span className="text-sm text-muted-foreground">{company.code}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{company.sector}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
      
      {selectedCompanies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-500">
              Seçilen Şirketler ({selectedCompanies.length})
            </span>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCompany(company.code);
                  }}
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