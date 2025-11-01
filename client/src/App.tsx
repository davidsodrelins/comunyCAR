import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import SendAlert from "./pages/SendAlert";
import Vehicles from "./pages/Vehicles";
import BuyCredits from "./pages/BuyCredits";
import Profile from "./pages/Profile";
import AlertHistory from "./pages/AlertHistory";
import TransactionHistory from "./pages/TransactionHistory";
import NotificationPreferences from "./pages/NotificationPreferences";
import ReceivedMessages from "./pages/ReceivedMessages";
import SentMessages from "./pages/SentMessages";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={SignUp} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/send-alert"} component={SendAlert} />
      <Route path={"/vehicles"} component={Vehicles} />
      <Route path={"/buy-credits"} component={BuyCredits} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/alert-history"} component={AlertHistory} />
      <Route path={"/transaction-history"} component={TransactionHistory} />
      <Route path={"/notification-preferences"} component={NotificationPreferences} />
      <Route path={"/received-messages"} component={ReceivedMessages} />
      <Route path={"/sent-messages"} component={SentMessages} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
