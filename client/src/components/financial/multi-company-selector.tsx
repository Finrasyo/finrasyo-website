import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
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
  maxResults = 10
}: MultiCompanySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>(initialSelectedCompanies);
  
  useEffect(() => {
    // Seçilen şirketleri ana bileşene bildir
    onSelectCompanies(selectedCompanies);
  }, [selectedCompanies, onSelectCompanies]);
  
  const filteredCompanies = bistCompanies
    .filter(company => 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, maxResults);
  
  const handleCompanySelect = (company: Company) => {
    if (selectedCompanies.some(c => c.code === company.code)) {
      setSelectedCompanies(selectedCompanies.filter(c => c.code !== company.code));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };
  
  const removeSelectedCompany = (company: Company) => {
    setSelectedCompanies(selectedCompanies.filter(c => c.code !== company.code));
  };
  
  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Şirket adı veya kodu ara..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto border rounded-md p-2">
        {searchQuery.length > 0 && filteredCompanies.length === 0 ? (
          <div className="p-3 text-center text-neutral-500">
            "{searchQuery}" için sonuç bulunamadı
          </div>
        ) : searchQuery.length === 0 ? (
          <div className="p-3 text-center text-neutral-500">
            Şirket aramak için yazmaya başlayın
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div 
              key={company.code}
              className="flex items-center space-x-2 p-2 border-b last:border-0 hover:bg-neutral-50 cursor-pointer"
              onClick={() => handleCompanySelect(company)}
            >
              <Checkbox 
                id={`company-${company.code}`}
                checked={selectedCompanies.some(c => c.code === company.code)}
                onCheckedChange={() => handleCompanySelect(company)}
              />
              <div>
                <label 
                  htmlFor={`company-${company.code}`}
                  className="font-medium text-sm cursor-pointer"
                >
                  {company.name} ({company.code})
                </label>
                <p className="text-xs text-neutral-500">{company.sector}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Seçilen Şirketler ({selectedCompanies.length})</h3>
        {selectedCompanies.length === 0 ? (
          <div className="text-neutral-500 text-sm">Henüz şirket seçilmedi</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedCompanies.map((company) => (
              <div 
                key={company.code}
                className="bg-primary-50 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {company.code}
                <button 
                  className="ml-2 hover:text-primary-900"
                  onClick={() => removeSelectedCompany(company)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}