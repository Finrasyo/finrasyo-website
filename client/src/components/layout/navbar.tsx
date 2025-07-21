import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Menu, 
  User, 
  LogOut, 
  ChevronDown, 
  PlusCircle,
  UserCog
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigation = (href: string) => {
    console.log('FINAL NAVIGATION ATTEMPT:', href);
    const fullUrl = `https://www.finrasyo.com${href}`;
    
    try {
      // Method 1: Assign + Reload
      window.location.assign(fullUrl);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (e) {
      console.error('Method 1 failed, trying method 2');
      try {
        // Method 2: Replace + Reload
        window.location.replace(fullUrl);
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (e2) {
        console.error('Method 2 failed, trying method 3');
        try {
          // Method 3: Document location
          document.location = fullUrl;
          setTimeout(() => {
            document.location.reload();
          }, 100);
        } catch (e3) {
          console.error('All methods failed, opening new window');
          window.open(fullUrl, '_self');
        }
      }
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navLinks = user ? [
    { href: "/", label: "Ana Sayfa", active: location === "/" },
    { href: "/reports", label: "Raporlar", active: location === "/reports" },
    { href: "/", label: "Şirketler", active: location.startsWith("/company") },
    { href: "/about", label: "Hakkımızda", active: location === "/about" },
    { href: "/how-it-works", label: "Nasıl Çalışır", active: location === "/how-it-works" },
    { href: "/contact", label: "İletişim", active: location === "/contact" },
  ] : [
    { href: "/about", label: "Hakkımızda", active: location === "/about" },
    { href: "/how-it-works", label: "Nasıl Çalışır", active: location === "/how-it-works" },
    { href: "/contact", label: "İletişim", active: location === "/contact" },
    { href: "/auth", label: "Giriş Yap", active: location === "/auth" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="https://www.finrasyo.com/" className="text-primary font-bold text-xl no-underline">
                FinRasyo
              </a>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <button 
                  key={link.label} 
                  onClick={() => handleNavigation(link.href)}
                  className={`${
                    link.active 
                      ? "border-primary text-neutral-800 border-b-2" 
                      : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 border-b-2"
                  } inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer bg-transparent border-0 border-b-2`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-neutral-600 text-sm font-medium">
                  Bakiye: <strong>{formatCurrency(user.credits)}</strong>
                </span>
                
                <a href="https://www.finrasyo.com/credits" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 no-underline">
                  Bakiye Yükle
                </a>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full flex p-0 h-8 w-8">
                      <span className="flex h-8 w-8 rounded-full bg-primary-100 text-primary-600 justify-center items-center">
                        <span className="font-medium">{getInitials(user.username)}</span>
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Şirket Ekle</span>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <a href="/admin">
                          <UserCog className="mr-2 h-4 w-4" />
                          <span>Admin Paneli</span>
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a href="https://www.finrasyo.com/auth" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 no-underline">
                  Giriş Yap
                </a>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navLinks.map((link) => (
                    <button 
                      key={link.label} 
                      onClick={() => {
                        setIsOpen(false);
                        handleNavigation(link.href);
                      }}
                      className={`${
                        link.active 
                          ? "bg-primary-50 text-primary-600" 
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                      } block px-3 py-2 rounded-md text-base font-medium cursor-pointer bg-transparent border-0 w-full text-left`}
                    >
                      {link.label}
                    </button>
                  ))}
                  
                  {user ? (
                    <div className="pt-4 pb-3 border-t border-neutral-200">
                      <div className="flex items-center px-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex h-10 w-10 rounded-full bg-primary-100 text-primary-600 justify-center items-center">
                            <span className="font-medium">{getInitials(user.username)}</span>
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-neutral-800">{user.username}</div>
                          <div className="text-sm font-medium text-neutral-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="mt-3 px-2 space-y-1">
                        <a href="https://www.finrasyo.com/profile" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800">
                          Profil
                        </a>
                        {user.role === 'admin' && (
                          <a href="https://www.finrasyo.com/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800">
                            <div className="flex items-center">
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>Admin Paneli</span>
                            </div>
                          </a>
                        )}
                        <div className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600">
                          Bakiye: <strong>{formatCurrency(user.credits)}</strong>
                        </div>
                        <a href="https://www.finrasyo.com/credits" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 no-underline w-full my-2">
                          Bakiye Yükle
                        </a>
                        <Button 
                          variant="ghost" 
                          className="w-full flex items-center justify-center" 
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Çıkış Yap</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 pb-3 border-t border-neutral-200">
                      <div className="px-2 space-y-1">
                        <a href="https://www.finrasyo.com/auth" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 no-underline w-full">
                          Giriş Yap
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
