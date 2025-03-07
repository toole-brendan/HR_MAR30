import { Bell, Menu, Search, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

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
  const { sidebarCollapsed } = useApp();

  return (
    <div className={cn(
      "h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 transition-all duration-300 ease-in-out",
      sidebarCollapsed ? "md:pl-24" : "md:pl-68"
    )}>
      {/* Left side - Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Center - Search bar */}
      <div className="hidden md:flex max-w-md w-full mx-auto relative">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full h-10 pl-10 pr-4 rounded-md bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Search inventory or transfers..."
          />
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={openScanner}
          className="hidden md:flex items-center justify-center h-9 w-9 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30"
        >
          <QrCode className="h-5 w-5" />
        </button>
        
        <button
          onClick={openNotifications}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>
      </div>
    </div>
  );
};

export default TopNavBar;