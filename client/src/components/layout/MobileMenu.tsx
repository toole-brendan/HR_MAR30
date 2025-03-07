import { X } from "lucide-react";
import Sidebar from "./Sidebar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  openQRScanner?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, openQRScanner }) => {
  return (
    <div 
      className={`md:hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-light tracking-widest text-gray-800 dark:text-gray-100 font-serif">HandReceipt</h1>
        <button 
          type="button" 
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5 text-gray-800 dark:text-gray-200" />
        </button>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-64px)] pb-20">
        <Sidebar 
          isMobile={true} 
          closeMobileMenu={onClose} 
          openQRScanner={openQRScanner} 
        />
      </div>
    </div>
  );
};

export default MobileMenu;
