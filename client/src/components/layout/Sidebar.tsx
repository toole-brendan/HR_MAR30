import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  QrCode, 
  Send, 
  ClipboardList, 
  History, 
  Settings, 
  Sun, 
  Moon 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

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
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useContext(AppContext);
  
  const isActive = (path: string) => {
    return location === path;
  };

  const handleLinkClick = () => {
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const handleQRScanClick = () => {
    if (openQRScanner) {
      openQRScanner();
    }
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };
  
  const handleLogoClick = () => {
    window.location.href = '/';
  };

  // Interface for navigation items
  interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
    notificationCount?: number;
    onClick?: () => void;
  }

  // Using Lucide icons instead of FontAwesome
  const navItems: NavItem[] = [
    { path: "/", icon: <LayoutDashboard className="sidebar-item-icon" />, label: "Dashboard" },
    { path: "/inventory", icon: <ClipboardList className="sidebar-item-icon" />, label: "Inventory" },
    { path: "/transfers", icon: <Send className="sidebar-item-icon" />, label: "Transfers", notificationCount: 8 },
    { path: "/scan", icon: <QrCode className="sidebar-item-icon" />, label: "Scan QR Code", onClick: handleQRScanClick },
    { path: "/audit-log", icon: <History className="sidebar-item-icon" />, label: "Audit Log" },
    { path: "/settings", icon: <Settings className="sidebar-item-icon" />, label: "Settings" },
  ];

  if (isMobile) {
    return (
      <nav className="flex-1 p-4 space-y-1">
        {/* Mobile Logo */}
        <div 
          className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity mb-4"
          onClick={handleLogoClick}
        >
          <div className="border border-gray-800/70 dark:border-gray-100/70 px-4 py-1.5">
            <h1 className="text-lg font-light tracking-widest text-gray-800 dark:text-gray-100 m-0 font-serif">HandReceipt</h1>
          </div>
        </div>
        
        {navItems.map((item) => 
          item.onClick ? (
            <div 
              key={item.path}
              onClick={item.onClick}
              className={cn("sidebar-item", isActive(item.path) && "active")}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.notificationCount && (
                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.notificationCount}
                </span>
              )}
            </div>
          ) : (
            <Link key={item.path} href={item.path}>
              <div 
                onClick={handleLinkClick}
                className={cn("sidebar-item", isActive(item.path) && "active")}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.notificationCount && (
                  <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.notificationCount}
                  </span>
                )}
              </div>
            </Link>
          )
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3 mb-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? 
                <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" /> : 
                <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              }
            </button>
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium profile-name">{user.name}</p>
                  <p className="text-xs profile-role">{user.rank}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <aside className={cn("sidebar hidden md:flex", sidebarCollapsed && "collapsed")}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed ? (
          <div 
            className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleLogoClick}
          >
            <div className="border border-gray-800/70 dark:border-gray-100/70 px-4 py-1.5">
              <h1 className="text-lg font-light tracking-widest text-gray-800 dark:text-gray-100 m-0 font-serif">HandReceipt</h1>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-5">
            {/* Empty div to maintain spacing in collapsed mode */}
          </div>
        )}
      </div>
      
      <nav className={cn("flex-1 px-2 py-4 space-y-1 overflow-y-auto", sidebarCollapsed && "collapsed")}>
        {navItems.map((item) => 
          item.onClick ? (
            <div 
              key={item.path}
              onClick={item.onClick}
              className={cn("sidebar-item", isActive(item.path) && "active")}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && item.notificationCount && (
                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.notificationCount}
                </span>
              )}
            </div>
          ) : (
            <Link key={item.path} href={item.path}>
              <div
                className={cn("sidebar-item", isActive(item.path) && "active")}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.notificationCount && (
                  <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.notificationCount}
                  </span>
                )}
              </div>
            </Link>
          )
        )}
      </nav>
      
      <div className={cn("p-4 border-t border-gray-200 dark:border-gray-700", sidebarCollapsed && "collapsed")}>
        {!sidebarCollapsed && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? 
                  <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" /> : 
                  <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                }
              </button>
              
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              </button>
            </div>
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium profile-name">{user.name}</p>
                  <p className="text-xs profile-role">{user.rank}</p>
                </div>
              </div>
            )}
          </>
        )}
        
        {sidebarCollapsed && (
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            </button>
            
            {user && (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
