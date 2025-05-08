import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
import { bistCompanies, sectors } from "@/data/bist-companies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CompanySelectorProps {
  onSelect: (company: { code: string; name: string; sector: string }) => void;
}

export default function CompanySelector({ onSelect }: CompanySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedSector, setSelectedSector] = React.useState<string>("");
  const [value, setValue] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filtreleme fonksiyonu
  const filteredCompanies = React.useMemo(() => {
    let filtered = bistCompanies;
    
    // Sektör seçiliyse, o sektöre ait şirketleri filtrele
    if (selectedSector) {
      filtered = filtered.filter(company => company.sector === selectedSector);
    }
    
    // Arama sorgusu varsa, şirket adı veya koduyla eşleşenleri filtrele
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(query) || 
        company.code.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedSector, searchQuery]);

  // Şirket seçildiğinde
  const handleCompanySelect = (code: string) => {
    const selectedCompany = bistCompanies.find(company => company.code === code);
    if (selectedCompany) {
      setValue(code);
      setOpen(false);
      onSelect(selectedCompany);
    }
  };

  // Seçilen şirketin adını göster
  const displayValue = React.useMemo(() => {
    const selected = bistCompanies.find(company => company.code === value);
    return selected ? `${selected.name} (${selected.code})` : "Şirket Seç";
  }, [value]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="sector">Sektör</Label>
        <Select
          value={selectedSector}
          onValueChange={setSelectedSector}
        >
          <SelectTrigger id="sector">
            <SelectValue placeholder="Tüm Sektörler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tüm Sektörler</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector} value={sector}>
                {sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="company">Şirket</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between"
            >
              {displayValue}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" sideOffset={5}>
            <Command>
              <CommandInput 
                placeholder="Şirket Ara..." 
                className="h-9"
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandEmpty>Şirket bulunamadı.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredCompanies.map((company) => (
                  <CommandItem
                    key={company.code}
                    value={company.code}
                    onSelect={handleCompanySelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === company.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-medium">{company.code}</span>
                    <span className="ml-2 text-muted-foreground">
                      {company.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}