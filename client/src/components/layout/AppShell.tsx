import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Sidebar from "./Sidebar";
import TopNavBar from "./TopNavBar";
import MobileMenu from "./MobileMenu";
import QRScannerModal from "../modals/QRScannerModal";
import NotificationPanel from "../modals/NotificationPanel";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { theme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openScanner = () => {
    setScannerOpen(true);
  };

  const closeScanner = () => {
    setScannerOpen(false);
  };

  const openNotifications = () => {
    setNotificationsOpen(true);
  };

  const closeNotifications = () => {
    setNotificationsOpen(false);
  };

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      {/* Sidebar - Desktop only */}
      <Sidebar openQRScanner={openScanner} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNavBar 
          toggleMobileMenu={toggleMobileMenu}
          openScanner={openScanner}
          openNotifications={openNotifications}
        />

        {/* Mobile Navigation - Shown/hidden based on mobile menu state */}
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)}
          openQRScanner={openScanner}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          {children}
        </main>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={scannerOpen} onClose={closeScanner} />

      {/* Notification Panel */}
      <NotificationPanel isOpen={notificationsOpen} onClose={closeNotifications} />
    </div>
  );
};

export default AppShell;
