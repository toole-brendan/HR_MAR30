import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import { useApp } from "@/context/AppContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  openQRScanner?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose,
  openQRScanner
}) => {
  const { toggleTheme } = useApp();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Slide-out panel */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-900 shadow-xl flex flex-col h-full overflow-y-auto">
        <Sidebar 
          isMobile={true} 
          closeMobileMenu={onClose} 
          openQRScanner={openQRScanner}
          toggleTheme={toggleTheme}
        />
      </div>
    </div>
  );
};

export default MobileMenu;