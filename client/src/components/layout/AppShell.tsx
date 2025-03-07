import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import TopNavBar from "./TopNavBar";
import MobileMenu from "./MobileMenu";
import MobileNav from "./MobileNav";
import NotificationPanel from "@/components/modals/NotificationPanel";
import QRScannerModal from "@/components/shared/QRScannerModal";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { sidebarCollapsed, toggleSidebar, toggleTheme } = useApp();
  
  // State for mobile menu, scanner, and notifications
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Handlers for opening/closing various panels
  const openScanner = () => setScannerOpen(true);
  const openNotifications = () => setNotificationsOpen(true);
  
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
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
      
      {/* Mobile nav bar - fixed at bottom */}
      <div className="md:hidden">
        <MobileNav openQRScanner={openScanner} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav Bar */}
        <TopNavBar 
          toggleMobileMenu={() => setMobileMenuOpen(true)} 
          openScanner={openScanner}
          openNotifications={openNotifications}
        />
        
        {/* Main content area with responsive viewport scaling */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300 ease-in-out pb-16 md:pb-0",
          "min-h-0 w-full",
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}>
          <div className="h-full w-full">
            {children}
          </div>
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