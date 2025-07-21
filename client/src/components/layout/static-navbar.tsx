import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';

// STATIC HTML NAVBAR - NO JAVASCRIPT NAVIGATION
// All links are pure HTML <a> tags with full URLs
export function StaticNavbar() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
            
            {/* Desktop Navigation - STATIC HTML */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a 
                href="https://www.finrasyo.com/about"
                className="border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 inline-flex items-center px-1 pt-1 text-sm font-medium no-underline border-b-2"
              >
                Hakkımızda
              </a>
              <a 
                href="https://www.finrasyo.com/contact"
                className="border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 inline-flex items-center px-1 pt-1 text-sm font-medium no-underline border-b-2"
              >
                İletişim
              </a>
              <a 
                href="https://www.finrasyo.com/how-it-works"
                className="border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 inline-flex items-center px-1 pt-1 text-sm font-medium no-underline border-b-2"
              >
                Nasıl Çalışır
              </a>
            </div>
          </div>

          {/* Right Side - User Section */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-neutral-600 text-sm font-medium">
                  Bakiye: <strong>{formatCurrency(user.credits)}</strong>
                </span>
                
                <a href="https://www.finrasyo.com/credits" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 no-underline">
                  Bakiye Yükle
                </a>
                
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a href="https://www.finrasyo.com/auth" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 no-underline">
                  Giriş Yap
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation - STATIC HTML */}
        <div className="sm:hidden">
          <details className="group">
            <summary className="flex items-center justify-between w-full py-2 text-left cursor-pointer">
              <span className="text-sm font-medium">Menü</span>
              <span className="group-open:rotate-90 transition-transform">▶</span>
            </summary>
            
            <div className="mt-2 pb-3 space-y-1">
              <a 
                href="https://www.finrasyo.com/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 no-underline"
              >
                Hakkımızda
              </a>
              <a 
                href="https://www.finrasyo.com/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 no-underline"
              >
                İletişim
              </a>
              <a 
                href="https://www.finrasyo.com/how-it-works"
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 no-underline"
              >
                Nasıl Çalışır
              </a>
              
              {user ? (
                <div className="pt-4 pb-3 border-t border-neutral-200">
                  <div className="px-3 py-2 text-base font-medium text-neutral-600">
                    Bakiye: <strong>{formatCurrency(user.credits)}</strong>
                  </div>
                  <a href="https://www.finrasyo.com/credits" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 no-underline w-full my-2">
                    Bakiye Yükle
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-neutral-200">
                  <a href="https://www.finrasyo.com/auth" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 no-underline w-full">
                    Giriş Yap
                  </a>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}