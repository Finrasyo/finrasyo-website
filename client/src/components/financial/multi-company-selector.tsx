import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { bistCompanies } from "@/data/bist-companies";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Company {
  code: string;
  name: string;
  sector: string;
}

interface MultiCompanySelectorProps {
  selectedCompanies: Company[];
  onSelect: (companies: Company[]) => void;
  maxSelections?: number;
}

export default function MultiCompanySelector({ 
  selectedCompanies,
  onSelect,
  maxSelections = 10
}: MultiCompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtreleme işlemi için bistCompanies'tan şirketleri filtrele
  const filteredCompanies = bistCompanies.filter((company) => {
    const search = searchTerm.toLowerCase();
    return (
      company.code.toLowerCase().includes(search) ||
      company.name.toLowerCase().includes(search)
    );
  });

  // Şirket seçimi
  const handleCompanySelect = (company: Company) => {
    // Zaten seçili mi kontrol et
    const isAlreadySelected = selectedCompanies.some(
      (selected) => selected.code === company.code
    );

    if (isAlreadySelected) {
      // Seçili ise, listeden çıkar
      onSelect(selectedCompanies.filter((c) => c.code !== company.code));
    } else {
      // Maksimum seçim sayısını kontrol et
      if (selectedCompanies.length >= maxSelections) {
        return;
      }
      
      // Seçili değilse, listeye ekle
      onSelect([...selectedCompanies, company]);
    }
  };

  // Şirket seçimini kaldır
  const handleRemoveCompany = (company: Company) => {
    onSelect(selectedCompanies.filter((c) => c.code !== company.code));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <span className="truncate">
                {searchTerm || "Şirket ara..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Şirket ara..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandEmpty>Şirket bulunamadı.</CommandEmpty>
              <ScrollArea className="h-72">
                <CommandGroup>
                  {filteredCompanies.map((company) => {
                    const isSelected = selectedCompanies.some(
                      (selected) => selected.code === company.code
                    );
                    
                    return (
                      <CommandItem
                        key={company.code}
                        value={company.code}
                        onSelect={() => handleCompanySelect(company)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{company.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {company.code}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Seçilen şirketlerin gösterimi */}
      {selectedCompanies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCompanies.map((company) => (
            <Badge key={company.code} variant="secondary" className="flex items-center gap-1 p-2">
              <span>{company.name} ({company.code})</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveCompany(company)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Seçim sayısı bilgisi */}
      <div className="text-xs text-muted-foreground">
        {selectedCompanies.length} / {maxSelections} şirket seçildi
      </div>
    </div>
  );
}