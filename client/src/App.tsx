import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Scan from "./pages/Scan";
import Transfers from "./pages/Transfers";
import Inventory from "./pages/Inventory";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import { useAuth } from "./context/AuthContext";

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Route path="*" component={Login} />;
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/scan" component={Scan} />
        <Route path="/transfers" component={Transfers} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/audit-log" component={AuditLog} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
