import { Router, Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ResetPasswordPage from "@/pages/reset-password";
import CompanyPage from "@/pages/company-page";
import CompanyNewPage from "@/pages/company-new-page";
import AnalysisPage from "@/pages/analysis-page";

import AnalysisWizardPage from "@/pages/analysis-wizard";
import ReportsPage from "@/pages/reports-page";
import PaymentPage from "@/pages/payment-page";
import ReportPage from "@/pages/report-page";
import AboutPage from "@/pages/about-page";
import HowItWorksPage from "@/pages/how-it-works-page";
import ContactPage from "@/pages/contact-page";
import AdminPage from "@/pages/admin-page";
import CompanyAnalysisPage from "@/pages/company-analysis";
import FetchBistCompaniesPage from "@/pages/fetch-bist-companies";
import DebugPage from "@/pages/debug-page";

import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/use-auth";
import { FinancialDataProvider } from "./hooks/use-financial-data";

function AppRouter() {
  return (
    <Router>
      <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/company/new" component={CompanyNewPage} />
      <ProtectedRoute path="/company/:id" component={CompanyPage} />
      <ProtectedRoute path="/analysis/:id" component={AnalysisPage} />

      <ProtectedRoute path="/analysis-wizard" component={AnalysisWizardPage} />
      <ProtectedRoute path="/analiz/:companyCode" component={CompanyAnalysisPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/payment" component={PaymentPage} />
      <ProtectedRoute path="/report/:id" component={ReportPage} />
      <ProtectedRoute path="/admin" component={() => <AdminPage />} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />

      <Route path="/about" component={AboutPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/fetch-bist-companies" component={FetchBistCompaniesPage} />
      <Route path="/debug" component={DebugPage} />
      <Route path="/*?" component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <FinancialDataProvider>
            <Toaster />
            <AppRouter />
          </FinancialDataProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
