import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { bistCompanies, sectors } from "@/data/bist-companies";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

// Şirket formu için doğrulama şeması
const companyFormSchema = z.object({
  name: z.string().min(2, { message: "Şirket adı en az 2 karakter olmalıdır" }),
  code: z.string().min(2, { message: "Şirket kodu en az 2 karakter olmalıdır" }),
  sector: z.string().min(2, { message: "Lütfen bir sektör seçin" }),
  website: z.string().url({ message: "Geçerli bir URL girin" }).optional().or(z.literal("")),
  description: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function CompanyNewPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [existingCompany, setExistingCompany] = useState<{ code: string; name: string; sector: string } | null>(null);

  // Borsa İstanbul şirketlerini filtrele
  const filteredCompanies = bistCompanies.filter((company) => {
    const search = searchTerm.toLowerCase();
    return (
      company.code.toLowerCase().includes(search) ||
      company.name.toLowerCase().includes(search) ||
      company.sector.toLowerCase().includes(search)
    );
  });

  // Form oluştur
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      code: "",
      sector: "",
      website: "",
      description: "",
    },
  });

  // Şirket oluşturma mutasyonu
  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      const res = await apiRequest("POST", "/api/companies", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Şirket eklendi",
        description: "Şirket başarıyla eklendi. Şimdi finansal verilerini girebilirsiniz.",
      });
      navigate(`/company/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Şirket eklenemedi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyFormValues) => {
    createCompanyMutation.mutate(data);
  };

  // BIST şirketlerinden birini seçmek için işleyici
  const handleCompanySelect = (company: { code: string; name: string; sector: string }) => {
    setExistingCompany(company);
    form.setValue("name", company.name);
    form.setValue("code", company.code);
    form.setValue("sector", company.sector);
    setOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <h1 className="text-2xl font-bold">Yeni Şirket Ekle</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Borsa İstanbul Şirketleri</CardTitle>
                <CardDescription>
                  BIST'te işlem gören bir şirket seçin veya özel şirket bilgilerinizi girin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {existingCompany
                        ? existingCompany.name
                        : "Şirket seçin..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
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
                              onSelect={() => handleCompanySelect(company)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  existingCompany?.code === company.code ? "opacity-100" : "opacity-0"
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Şirket Bilgileri</CardTitle>
                <CardDescription>
                  {existingCompany ? "Seçilen şirket bilgilerini düzenleyin" : "Yeni şirket bilgilerini girin"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şirket Adı</FormLabel>
                          <FormControl>
                            <Input placeholder="Şirket adını girin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şirket Kodu</FormLabel>
                          <FormControl>
                            <Input placeholder="BIST kodu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sektör</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Bir sektör seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sectors.map((sector) => (
                                <SelectItem key={sector} value={sector}>
                                  {sector}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Web Sitesi</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            İsteğe bağlı
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={createCompanyMutation.isPending}
                      >
                        {createCompanyMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Building className="mr-2 h-4 w-4" />
                            Şirket Ekle
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}