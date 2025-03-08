import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import NotFound from "@/pages/not-found";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import Transfers from "./pages/Transfers";
import Inventory from "./pages/Inventory";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import PropertyBook from "./pages/PropertyBook";
import Profile from "./pages/Profile";
import SensitiveItems from "./pages/SensitiveItems";
import Maintenance from "./pages/Maintenance";
import QRManagement from "./pages/QRManagement";
import Reports from "./pages/Reports";

function Router() {
  // Always show the app shell with dashboard as default
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/scan" component={Scan} />
        <Route path="/transfers" component={Transfers} />
        <Route path="/property-book" component={PropertyBook} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/sensitive-items" component={SensitiveItems} />
        <Route path="/maintenance" component={Maintenance} />
        <Route path="/qr-management" component={QRManagement} />
        <Route path="/reports" component={Reports} />
        <Route path="/audit-log" component={AuditLog} />
        <Route path="/settings" component={Settings} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router />
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
