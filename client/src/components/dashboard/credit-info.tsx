import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

export default function CreditInfo() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const maxCredits = 100; // Maximum credits for display purposes
  const percentage = Math.min((user.credits / maxCredits) * 100, 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>İndirme Kredileri</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Kalan:</span>
            <span className="text-sm font-medium text-neutral-800">{user.credits} rapor</span>
          </div>
          <Progress 
            value={percentage} 
            className="mt-2 h-2.5"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full text-primary border-primary hover:bg-primary-50"
          asChild
        >
          <Link href="/credits">
            Kredi Satın Al
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
