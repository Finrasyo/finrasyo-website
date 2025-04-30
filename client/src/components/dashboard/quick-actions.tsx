import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  RotateCcwSquare, 
  Settings 
} from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hızlı Eylemler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full text-left justify-start"
            asChild
          >
            <Link href="/reports">
              <Download className="mr-2 h-4 w-4 text-primary" /> 
              Son raporları indir
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-left justify-start"
            asChild
          >
            <Link href="/reports/history">
              <RotateCcwSquare className="mr-2 h-4 w-4 text-primary" /> 
              Geçmiş analizler
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-left justify-start"
            asChild
          >
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4 text-primary" /> 
              Hesap ayarları
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
