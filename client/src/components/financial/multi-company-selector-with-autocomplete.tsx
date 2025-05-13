import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import AutocompleteCompanySelector from "./autocomplete-company-selector";

interface Company {
  code: string;
  name: string;
  sector: string;
}

interface MultiCompanySelectorWithAutocompleteProps {
  onSelectCompanies: (companies: Company[]) => void;
  initialSelectedCompanies?: Company[];
  maxCompanies?: number;
}

export default function MultiCompanySelectorWithAutocomplete({
  onSelectCompanies,
  initialSelectedCompanies = [],
  maxCompanies = 10
}: MultiCompanySelectorWithAutocompleteProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>(initialSelectedCompanies);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  
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

  // Şirket ekle
  const handleAddCompany = (company: Company) => {
    if (selectedCompanies.length >= maxCompanies) {
      return;
    }
    
    // Eğer şirket zaten seçilmişse ekleme
    if (!selectedCompanies.some(c => c.code === company.code)) {
      setSelectedCompanies([...selectedCompanies, company]);
      setCurrentCompany(null);
    }
  };

  // Şirket kaldır
  const handleRemoveCompany = (code: string) => {
    setSelectedCompanies(selectedCompanies.filter(company => company.code !== code));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCompanies.map((company) => (
            <Badge key={company.code} variant="outline" className="flex items-center gap-1 py-1.5 px-3">
              <span className="font-semibold">{company.code}</span>
              <span className="mx-1">-</span>
              <span>{company.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 rounded-full hover:bg-destructive/10"
                onClick={() => handleRemoveCompany(company.code)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <AutocompleteCompanySelector
              onSelect={(company) => setCurrentCompany(company)}
              placeholder="Eklemek istediğiniz şirketi arayın..."
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => currentCompany && handleAddCompany(currentCompany)}
            disabled={!currentCompany || selectedCompanies.length >= maxCompanies}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedCompanies.length >= maxCompanies && (
          <p className="text-xs text-muted-foreground mt-1">
            Maksimum {maxCompanies} şirket seçebilirsiniz.
          </p>
        )}
      </div>

      {selectedCompanies.length > 0 && (
        <Card className="mt-2 border-muted">
          <CardContent className="pt-4">
            <div className="text-sm font-medium">Seçili Şirketler ({selectedCompanies.length})</div>
            <div className="mt-2 text-xs text-muted-foreground">
              <ul className="list-disc pl-4 space-y-1">
                {selectedCompanies.map((company) => (
                  <li key={company.code}>
                    <span className="font-medium">{company.code}</span> - {company.name}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}