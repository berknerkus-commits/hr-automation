import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import ATSPage from "./pages/ATS";
import OnboardingPage from "./pages/Onboarding";
import OnboardingDetailPage from "./pages/OnboardingDetail";
import LeavePage from "./pages/Leave";
import AdminPage from "./pages/Admin";
import LoginPage from "./pages/Login";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={() => <AppLayout><Dashboard /></AppLayout>} />
      <Route path="/ats" component={() => <AppLayout><ATSPage /></AppLayout>} />
      <Route path="/onboarding" component={() => <AppLayout><OnboardingPage /></AppLayout>} />
      <Route path="/onboarding/:id" component={({ params }) => <AppLayout><OnboardingDetailPage id={Number(params.id)} /></AppLayout>} />
      <Route path="/leave" component={() => <AppLayout><LeavePage /></AppLayout>} />
      <Route path="/admin" component={() => <AppLayout><AdminPage /></AppLayout>} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
