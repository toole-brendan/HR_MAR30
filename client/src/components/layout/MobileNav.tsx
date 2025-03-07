import { useLocation } from "wouter";
import { Home, QrCode, Send, ClipboardList, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  openQRScanner?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ openQRScanner }) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { path: "/", icon: <Home className="h-5 w-5" />, label: "Home" },
    { path: "/inventory", icon: <ClipboardList className="h-5 w-5" />, label: "Inventory" },
    { 
      path: "/scan", 
      icon: <QrCode className="h-5 w-5" />, 
      label: "Scan", 
      onClick: openQRScanner,
      highlight: true
    },
    { path: "/transfers", icon: <Send className="h-5 w-5" />, label: "Transfers" },
    { path: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-3 z-10">
      {navItems.map((item) => (
        <div 
          key={item.path} 
          className="flex flex-col items-center"
          onClick={item.onClick}
        >
          {item.onClick ? (
            <button
              className={cn(
                "flex flex-col items-center justify-center px-2",
                item.highlight && "text-blue-500 dark:text-blue-400",
                !item.highlight && "text-gray-600 dark:text-gray-400"
              )}
            >
              <div className="flex items-center justify-center h-8 w-8">
                {item.icon}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ) : (
            <a
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-2",
                isActive(item.path) 
                  ? "text-blue-500 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              <div className="flex items-center justify-center h-8 w-8">
                {item.icon}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default MobileNav;