import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import {
  Home,
  Users,
  Package,
  Send,
  ClipboardList,
  Settings,
  BarChart3,
  Menu,
  Moon,
  Sun,
  QrCode,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
  openQRScanner?: () => void;
}

const Sidebar = ({
  isMobile = false,
  closeMobileMenu,
  openQRScanner
}: SidebarProps) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useApp();

  const isActive = (path: string) => {
    return location === path;
  };

  interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
    notificationCount?: number;
    onClick?: () => void;
  }

  const navItems: NavItem[] = [
    { path: "/", icon: <Home size={20} />, label: "Dashboard" },
    { path: "/inventory", icon: <ClipboardList size={20} />, label: "Inventory" },
    { 
      path: "/scan", 
      icon: <QrCode size={20} />, 
      label: "Scan",
      onClick: openQRScanner
    },
    { 
      path: "/transfers", 
      icon: <Send size={20} />, 
      label: "Transfers",
      notificationCount: 3
    },
    { path: "/audit-log", icon: <BarChart3 size={20} />, label: "Audit Log" },
    { path: "/settings", icon: <Settings size={20} />, label: "Settings" }
  ];

  const handleNavClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out",
        sidebarCollapsed && !isMobile ? "w-20" : "w-64",
        isMobile ? "w-full" : ""
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              HandReceipt
            </span>
          )}
        </div>
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform", 
                sidebarCollapsed ? "" : "rotate-180"
              )}
            />
          </button>
        )}
        {isMobile && closeMobileMenu && (
          <button
            onClick={closeMobileMenu}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User Profile */}
      {user && (
        <div className={cn(
          "flex items-center p-4 border-b border-gray-200 dark:border-gray-800",
          sidebarCollapsed && !isMobile ? "justify-center" : "px-4"
        )}>
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            {(!sidebarCollapsed || isMobile) 
              ? user.name.substring(0, 1) 
              : user.name.substring(0, 1)}
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.rank}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.onClick ? (
                <button
                  onClick={() => handleNavClick(item.onClick)}
                  className={cn(
                    "group flex items-center w-full p-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    sidebarCollapsed && !isMobile ? "justify-center" : ""
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {(!sidebarCollapsed || isMobile) && (
                    <span className="ml-3">{item.label}</span>
                  )}
                  {item.notificationCount && (!sidebarCollapsed || isMobile) && (
                    <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                      {item.notificationCount}
                    </span>
                  )}
                </button>
              ) : (
                <Link href={item.path}>
                  <a
                    onClick={() => handleNavClick()}
                    className={cn(
                      "group flex items-center w-full p-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                      sidebarCollapsed && !isMobile ? "justify-center" : ""
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {(!sidebarCollapsed || isMobile) && (
                      <span className="ml-3">{item.label}</span>
                    )}
                    {item.notificationCount && (!sidebarCollapsed || isMobile) && (
                      <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {item.notificationCount}
                      </span>
                    )}
                  </a>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className={cn(
        "p-4 border-t border-gray-200 dark:border-gray-800 flex",
        sidebarCollapsed && !isMobile ? "justify-center" : "px-4 justify-between"
      )}>
        {(!sidebarCollapsed || isMobile) && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;