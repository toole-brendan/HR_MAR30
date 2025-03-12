import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
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
import Login from "./pages/Login";
import { queryClient } from "./lib/queryClient";
import { useState, useEffect, useMemo } from "react";
import { BASE_PATH } from "./lib/queryClient";

// Define interfaces for component props with ID parameters
interface ItemPageProps {
  id?: string;
}

interface ReportPageProps {
  type?: string;
}

interface QRPageProps {
  code?: string;
}

// Create a custom hook that handles the base path
function useBaseLocation() {
  // Get the original wouter location hook
  const [location, setLocation] = useLocation();

  // Return a modified version that handles base path
  return [
    // The location without the base path prefix
    location,
    // Modified setter that adds the base path
    (to: string, options = {}) => {
      // Handle the base path in navigation
      const path = to.startsWith("/") ? `${BASE_PATH}${to}` : `${BASE_PATH}/${to}`;
      setLocation(path, options);
    }
  ] as [string, (path: string, ...args: any[]) => any];
}

// Make all component props have any type to fix TypeScript errors with wouter
function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={() => <Dashboard />} />
        <Route path="/scan" component={() => <Scan />} />
        <Route path="/transfers" component={() => <Transfers />} />
        <Route path="/transfers/:id">
          {(params) => <Transfers id={params.id} />}
        </Route>
        <Route path="/property-book" component={() => <PropertyBook />} />
        <Route path="/property-book/:id">
          {(params) => <PropertyBook id={params.id} />}
        </Route>
        <Route path="/inventory" component={() => <Inventory />} />
        <Route path="/inventory/:id">
          {(params) => <Inventory id={params.id} />}
        </Route>
        <Route path="/sensitive-items" component={() => <SensitiveItems />} />
        <Route path="/sensitive-items/:id">
          {(params) => <SensitiveItems id={params.id} />}
        </Route>
        <Route path="/maintenance" component={() => <Maintenance />} />
        <Route path="/maintenance/:id">
          {(params) => <Maintenance id={params.id} />}
        </Route>
        <Route path="/qr-management" component={() => <QRManagement />} />
        <Route path="/qr-management/:code">
          {(params) => <QRManagement code={params.code} />}
        </Route>
        <Route path="/reports" component={() => <Reports />} />
        <Route path="/reports/:type">
          {(params) => <Reports type={params.type} />}
        </Route>
        <Route path="/audit-log" component={() => <AuditLog />} />
        <Route path="/settings" component={() => <Settings />} />
        <Route path="/profile" component={() => <Profile />} />
        <Route path="/login" component={() => <Login />} />
        <Route component={() => <NotFound />} />
      </Switch>
    </AppShell>
  );
}

function App() {
  // Handle initial redirection if needed
  useEffect(() => {
    const path = window.location.pathname;
    // If we're not already at a defense-prefixed URL and not accessing the API directly
    if (!path.startsWith(BASE_PATH) && !path.startsWith('/api')) {
      // Construct the path with the base prefix
      const newPath = path === '/' ? BASE_PATH : `${BASE_PATH}${path}`;
      window.history.replaceState(null, "", newPath);
    }
  }, []);

  // Create a redirection effect for the base path
  useEffect(() => {
    // Use a 'click' event listener to intercept link clicks and add the base path
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin) && !link.href.includes(BASE_PATH)) {
        e.preventDefault();
        // Extract the path and add the base path
        const url = new URL(link.href);
        const path = url.pathname === '/' ? BASE_PATH : `${BASE_PATH}${url.pathname}`;
        window.history.pushState(null, "", path + url.search + url.hash);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Create a basename-aware router
  const customLocationHook = () => useBaseLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <WouterRouter hook={customLocationHook}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
