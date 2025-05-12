import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

interface CompanySelectorProps {
  onSelect: (company: { code: string; name: string; sector: string }) => void;
}

export default function CompanySelector({ onSelect }: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtreleme işlemi için bistCompanies'tan şirketleri filtrele
  const filteredCompanies = bistCompanies.filter((company) => {
    // Arama terimini lowercase yap
    const search = searchTerm.toLowerCase();
    // Şirket bilgilerini lowercase yaparak karşılaştır
    return (
      company.code.toLowerCase().includes(search) ||
      company.name.toLowerCase().includes(search) ||
      company.sector.toLowerCase().includes(search)
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? bistCompanies.find((company) => company.code.toLowerCase() === value.toLowerCase())?.name
            : "Şirket seçin..."}
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
              {filteredCompanies.map((company) => (
                <CommandItem
                  key={company.code}
                  value={company.code}
                  onSelect={(currentValue) => {
                    // Büyük/küçük harf duyarsız karşılaştırma
                    const currentLower = currentValue.toLowerCase();
                    const valueLower = value.toLowerCase();
                    const newValue = currentLower === valueLower ? "" : currentValue;
                    setValue(newValue);
                    setOpen(false);
                    
                    if (newValue) {
                      onSelect({
                        code: company.code,
                        name: company.name,
                        sector: company.sector,
                      });
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === company.code.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{company.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {company.code}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {company.sector}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}