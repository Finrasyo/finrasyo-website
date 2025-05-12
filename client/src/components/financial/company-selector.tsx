import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { bistCompanies } from "@/data/bist-companies";

interface CompanySelectorProps {
  onSelect: (company: { code: string; name: string; sector: string }) => void;
}

export default function CompanySelector({ onSelect }: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<typeof bistCompanies[number] | null>(null);
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
  }).slice(0, 15); // İlk 15 sonucu göster

  // Şirket seçim işleyicisi
  const handleSelectCompany = (company: typeof bistCompanies[number]) => {
    setSelectedCompany(company);
    setIsOpen(false);
    onSelect(company);
  };
  
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

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between font-normal"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCompany ? selectedCompany.name : "Şirket seçin..."}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <Input
              placeholder="Şirket ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Dropdown'ın kapanmasını engelle
              className="mb-2"
            />
          </div>
          
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
                      selectedCompany?.code === company.code && "bg-gray-100"
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
  );
}