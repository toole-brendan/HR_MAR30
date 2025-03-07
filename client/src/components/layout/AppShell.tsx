import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";
import MobileNav from "./MobileNav";
import NotificationPanel from "@/components/modals/NotificationPanel";
import QRScannerModal from "@/components/shared/QRScannerModal";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import TopNavBar from "./TopNavBar";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { sidebarCollapsed, toggleSidebar, toggleTheme } = useApp();
  const isMobile = useIsMobile();
  
  // State for mobile menu, scanner, and notifications
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Handlers for opening/closing various panels
  const openScanner = () => setScannerOpen(true);
  const openNotifications = () => setNotificationsOpen(true);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  if (!isAuthenticated) {
    // Render a simpler layout for unauthenticated pages (login)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar 
          openQRScanner={openScanner} 
          toggleTheme={toggleTheme}
          toggleSidebar={toggleSidebar}
        />
      </div>
      
      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        openQRScanner={openScanner}
      />
      
      {/* Mobile nav bar - fixed at bottom on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10">
        <MobileNav openQRScanner={openScanner} />
      </div>
      
      {/* Main content area with proper sidebar offset */}
      <div className={cn(
        sidebarCollapsed ? "main-content sidebar-collapsed" : "main-content",
        "flex flex-col"
      )}>
        {/* Top navigation bar - visible on all screen sizes */}
        <TopNavBar 
          toggleMobileMenu={toggleMobileMenu}
          openScanner={openScanner}
          openNotifications={openNotifications}
        />
        
        {/* Main content area with responsive viewport scaling */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
          isMobile ? "pb-16" : "pb-0"
        )}>
          {children}
        </main>
      </div>
      
      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
      
      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

export default AppShell;