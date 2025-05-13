import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bistCompanies } from "@/data/bist-companies";
import { Card } from "@/components/ui/card";

interface Company {
  code: string;
  name: string;
  sector: string;
}

interface AutocompleteCompanySelectorProps {
  onSelect: (company: Company) => void;
  initialValue?: string;
  className?: string;
  placeholder?: string;
}

export default function AutocompleteCompanySelector({
  onSelect,
  initialValue = "",
  className = "",
  placeholder = "Şirket adı veya kodu ara..."
}: AutocompleteCompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Company | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionListRef = useRef<HTMLDivElement>(null);

  // İlk yükleme sırasında initialValue ile bir şirket seçilirse
  useEffect(() => {
    if (initialValue) {
      const company = bistCompanies.find(
        (company) => company.code === initialValue || company.name === initialValue
      );
      if (company) {
        setSelected(company);
        setSearchTerm(company.name);
      }
    }
  }, [initialValue]);

  // Filtreleme işlemi
  const filteredCompanies = searchTerm.length > 0
    ? bistCompanies.filter((company) => {
        const search = searchTerm.toLowerCase();
        return (
          company.code.toLowerCase().includes(search) ||
          company.name.toLowerCase().includes(search) ||
          company.sector.toLowerCase().includes(search)
        );
      }).slice(0, 10)
    : [];

  // Şirket seçildiğinde çağrılır
  const handleSelectCompany = (company: Company) => {
    setSelected(company);
    setSearchTerm(company.name);
    setShowSuggestions(false);
    onSelect(company);
  };

  // Seçimi temizle
  const handleClearSelection = () => {
    setSelected(null);
    setSearchTerm("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Klavye navigasyonu için
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => 
        prev < filteredCompanies.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelectCompany(filteredCompanies[focusedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Odaklanan öğeyi görünür kılmak için kaydırma
  useEffect(() => {
    if (focusedIndex >= 0 && suggestionListRef.current) {
      const focusedElement = suggestionListRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => {
            if (searchTerm && !selected) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Seçimi sildikten sonra inputtan çıkınca öneri listesini kapat
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${selected ? "border-primary" : ""}`}
          autoComplete="off"
        />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted"
            onClick={handleClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Seçilen şirket */}
      {selected && (
        <div className="mt-2">
          <Badge variant="outline" className="flex items-center gap-1 text-sm">
            <span className="font-semibold">{selected.code}</span>
            <span className="mx-1">-</span>
            <span>{selected.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">({selected.sector})</span>
          </Badge>
        </div>
      )}

      {/* Öneriler Listesi */}
      {showSuggestions && filteredCompanies.length > 0 && (
        <Card
          className="absolute z-50 w-full mt-1 max-h-64 overflow-auto shadow-md"
          ref={suggestionListRef}
        >
          <div className="p-1">
            {filteredCompanies.map((company, index) => (
              <div
                key={company.code}
                className={`p-2 cursor-pointer transition-colors rounded-md ${
                  focusedIndex === index ? "bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => handleSelectCompany(company)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-xs bg-muted px-1 rounded">{company.code}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{company.sector}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}