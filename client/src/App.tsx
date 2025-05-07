import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CompanyPage from "@/pages/company-page";
import AnalysisPage from "@/pages/analysis-page";
import ReportsPage from "@/pages/reports-page";
import AboutPage from "@/pages/about-page";
import HowItWorksPage from "@/pages/how-it-works-page";
import ContactPage from "@/pages/contact-page";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/use-auth";
import { FinancialDataProvider } from "./hooks/use-financial-data";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/company/:id" component={CompanyPage} />
      <ProtectedRoute path="/analysis/:id" component={AnalysisPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <FinancialDataProvider>
            <Toaster />
            <Router />
          </FinancialDataProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
