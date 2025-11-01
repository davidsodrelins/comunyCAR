import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import SendAlert from "./pages/SendAlert";
import Vehicles from "./pages/Vehicles";
import BuyCredits from "./pages/BuyCredits";
import Profile from "./pages/Profile";
import AlertHistory from "./pages/AlertHistory";
import TransactionHistory from "./pages/TransactionHistory";
import NotificationPreferences from "./pages/NotificationPreferences";
import ReceivedMessages from "./pages/ReceivedMessages";
import SentMessages from "./pages/SentMessages";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      
      {/* Protected Routes */}
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/home" component={Home} />
      <Route path="/send-alert" component={SendAlert} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/buy-credits" component={BuyCredits} />
      <Route path="/profile" component={Profile} />
      <Route path="/alert-history" component={AlertHistory} />
      <Route path="/transaction-history" component={TransactionHistory} />
      <Route path="/notification-preferences" component={NotificationPreferences} />
      <Route path="/received-messages" component={ReceivedMessages} />
      <Route path="/sent-messages" component={SentMessages} />
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
