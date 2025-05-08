import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@shared/schema";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UserPlus, UserCog, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState(0);

  // Kullanıcının admin olup olmadığını kontrol et
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Yetkisiz Erişim",
        description: "Admin sayfasına erişim yetkiniz bulunmamaktadır.",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);

  // Tüm kullanıcıları getir
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/admin/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Kullanıcılar getirilemedi:", error);
        toast({
          title: "Hata",
          description: "Kullanıcılar yüklenirken bir hata oluştu.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user, toast]);

  // Raporları ve ödemeleri getir
  useEffect(() => {
    const fetchReportsAndPayments = async () => {
      try {
        const [reportsResponse, paymentsResponse] = await Promise.all([
          apiRequest("GET", "/api/admin/reports"),
          apiRequest("GET", "/api/admin/payments")
        ]);
        
        const reportsData = await reportsResponse.json();
        const paymentsData = await paymentsResponse.json();
        
        setReports(reportsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Raporlar ve ödemeler getirilemedi:", error);
        toast({
          title: "Hata",
          description: "Sistem verileri yüklenirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    };

    if (user && user.role === "admin") {
      fetchReportsAndPayments();
    }
  }, [user, toast]);

  // Kullanıcı ara
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Boş arama durumunda tüm kullanıcıları getir
      const response = await apiRequest("GET", "/api/admin/users");
      const data = await response.json();
      setUsers(data);
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest("GET", `/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Arama yapılırken hata oluştu:", error);
      toast({
        title: "Arama Hatası",
        description: "Kullanıcı araması yapılırken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı rolünü değiştir
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role: newRole });
      
      // Kullanıcı listesini güncelle
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      
      toast({
        title: "Başarılı",
        description: "Kullanıcı rolü güncellendi."
      });
    } catch (error) {
      console.error("Rol değiştirme hatası:", error);
      toast({
        title: "Hata",
        description: "Kullanıcı rolü güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  // Kredi ekleme dialogunu aç
  const openCreditDialog = (user: User) => {
    setSelectedUser(user);
    setCreditsToAdd(0);
    setIsEditDialogOpen(true);
  };

  // Kullanıcıya kredi ekle
  const handleAddCredits = async () => {
    if (!selectedUser) return;
    
    try {
      const updatedUser = await apiRequest(
        "PATCH", 
        `/api/admin/users/${selectedUser.id}/credits`, 
        { credits: selectedUser.credits + creditsToAdd }
      ).then(res => res.json());
      
      // Kullanıcı listesini güncelle
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === selectedUser.id ? updatedUser : u
        )
      );
      
      setIsEditDialogOpen(false);
      toast({
        title: "Başarılı",
        description: `${selectedUser.username} kullanıcısına ${creditsToAdd} kredi eklendi.`
      });
    } catch (error) {
      console.error("Kredi ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Kredi eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Paneli</h1>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="users">Kullanıcı Yönetimi</TabsTrigger>
          <TabsTrigger value="reports">Rapor İstatistikleri</TabsTrigger>
          <TabsTrigger value="payments">Ödeme Geçmişi</TabsTrigger>
        </TabsList>
        
        {/* Kullanıcı Yönetimi Tab */}
        <TabsContent value="users">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Ara</Button>
          </div>

          {loading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableCaption>Toplam {users.length} kullanıcı</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Krediler</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="p-1 border rounded"
                      >
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                    <TableCell>{user.credits}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCreditDialog(user)}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Kredi Ekle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        {/* Rapor İstatistikleri Tab */}
        <TabsContent value="reports">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Rapor İstatistikleri</h2>
            
            {reports.length === 0 ? (
              <p>Henüz rapor oluşturulmamış.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Şirket</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      <TableCell>{report.userId}</TableCell>
                      <TableCell>{report.companyName}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{report.format}</TableCell>
                      <TableCell>{new Date(report.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        {/* Ödeme Geçmişi Tab */}
        <TabsContent value="payments">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Ödeme Geçmişi</h2>
            
            {payments.length === 0 ? (
              <p>Henüz ödeme yapılmamış.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Tutar (₺)</TableHead>
                    <TableHead>Krediler</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.userId}</TableCell>
                      <TableCell>{payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.credits}</TableCell>
                      <TableCell>{payment.status}</TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Kredi Ekleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kredi Ekle</DialogTitle>
            <DialogDescription>
              {selectedUser && `${selectedUser.username} kullanıcısına kredi ekle`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Eklenecek Kredi Miktarı
            </label>
            <Input
              type="number"
              min="1"
              value={creditsToAdd}
              onChange={(e) => setCreditsToAdd(Math.max(1, parseInt(e.target.value) || 0))}
            />
            
            {selectedUser && (
              <div className="mt-4 text-sm">
                <p>Mevcut Kredi: {selectedUser.credits}</p>
                <p>Yeni Kredi: {selectedUser.credits + creditsToAdd}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddCredits}>
              Kredi Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}