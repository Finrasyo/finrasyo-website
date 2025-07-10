import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function DebugPage() {
  const handleClick = () => {
    console.log('Debug button clicked');
    alert('Debug button clicked!');
  };

  const handleNavigation = (href: string) => {
    console.log('Navigating to:', href);
    window.location.href = href;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 1: Basic Button Click</h2>
          <Button onClick={handleClick}>
            Click Me (Should show alert)
          </Button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 2: Navigation Button</h2>
          <Button onClick={() => handleNavigation('/about')}>
            Go to About Page
          </Button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 3: Wouter Link</h2>
          <Link href="/about">
            <Button>Wouter Link to About</Button>
          </Link>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 4: Direct HTML Link</h2>
          <a href="/about" className="text-blue-600 underline">
            Direct HTML Link to About
          </a>
        </div>
      </div>
    </div>
  );
}