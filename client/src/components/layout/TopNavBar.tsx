import { useAuth } from "@/context/AuthContext";
import { Menu, Search, QrCode, Bell, Menu as MenuIcon } from "lucide-react";

interface TopNavBarProps {
  toggleMobileMenu: () => void;
  openScanner: () => void;
  openNotifications: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ 
  toggleMobileMenu, 
  openScanner, 
  openNotifications 
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button 
            type="button" 
            className="p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleMobileMenu}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Logo - Mobile only */}
        <div className="md:hidden flex items-center">
          <h1 className="text-lg font-light tracking-widest text-gray-800 dark:text-gray-100 font-serif">HandReceipt</h1>
        </div>
        
        {/* Search */}
        <div className="hidden md:flex md:flex-1 px-4">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search inventory or serial #" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button 
            type="button" 
            className="relative p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={openScanner}
            aria-label="Open QR scanner"
          >
            <QrCode className="h-5 w-5" />
          </button>
          <button 
            type="button" 
            className="relative p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={openNotifications}
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-[-5px] right-[-5px] h-5 w-5 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full">
              8
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
