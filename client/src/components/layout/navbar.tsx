import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  User, 
  LogOut, 
  ChevronDown, 
  PlusCircle 
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

  if (!user) return null;

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

  const navLinks = [
    { href: "/", label: "Ana Sayfa", active: location === "/" },
    { href: "/reports", label: "Raporlar", active: location === "/reports" },
    { href: "/", label: "Şirketler", active: location.startsWith("/company") },
    { href: "#", label: "Fiyatlandırma", active: false },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-bold text-xl cursor-pointer">FinRasyo</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href}
                >
                  <a 
                    className={`${
                      link.active 
                        ? "border-primary text-neutral-800 border-b-2" 
                        : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 border-b-2"
                    } inline-flex items-center px-1 pt-1 text-sm font-medium`}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <span className="text-neutral-600 text-sm font-medium">
                Bakiye: <strong>{formatCurrency(user.credits * 5)}</strong>
              </span>
              
              <Button variant="default" asChild>
                <Link href="/credits">
                  Bakiye Yükle
                </Link>
              </Button>
              
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                    <Link 
                      key={link.label} 
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <a 
                        className={`${
                          link.active 
                            ? "bg-primary-50 text-primary-600" 
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                        } block px-3 py-2 rounded-md text-base font-medium`}
                      >
                        {link.label}
                      </a>
                    </Link>
                  ))}
                  
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
                      <Link href="/profile">
                        <a className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800">
                          Profil
                        </a>
                      </Link>
                      <div className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600">
                        Bakiye: <strong>{formatCurrency(user.credits * 5)}</strong>
                      </div>
                      <Button variant="default" className="w-full my-2" asChild>
                        <Link href="/credits">
                          Bakiye Yükle
                        </Link>
                      </Button>
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
