import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Package, 
  Send, 
  Truck, 
  FileText, 
  Wallet, 
  BarChart3, 
  Plug, 
  QrCode, 
  Settings, 
  Sun, 
  Moon 
} from "lucide-react";
import { AppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name: string;
    role: string;
    profileImage: string;
  };
  isMobile?: boolean;
  closeMobileMenu?: () => void;
  openQRScanner?: () => void;
  toggleTheme?: () => void;
  toggleSidebar?: () => void;
}

export default function Sidebar({ 
  user, 
  isMobile = false, 
  closeMobileMenu, 
  openQRScanner,
  toggleTheme: toggleThemeProp,
  toggleSidebar: toggleSidebarProp
}: SidebarProps) {
  const [location] = useLocation();
  const { theme, sidebarCollapsed } = useContext(AppContext);
  
  // Use the functions from context directly if they're not passed as props
  const toggleTheme = () => {
    if (toggleThemeProp) {
      toggleThemeProp(); 
    }
  };
  
  const toggleSidebar = () => {
    if (toggleSidebarProp) {
      toggleSidebarProp();
    }
  };

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
    // Navigate to the dashboard page
    window.location.href = '/';
  };

  // Using Lucide icons instead of FontAwesome 
  const navItems = [
    { path: "/", icon: <LayoutDashboard className="sidebar-item-icon" />, label: "Dashboard" },
    { path: "/inventory", icon: <Package className="sidebar-item-icon" />, label: "Inventory" },
    { path: "/transfers", icon: <Send className="sidebar-item-icon" />, label: "Transfers" },
    { path: "/suppliers", icon: <Truck className="sidebar-item-icon" />, label: "Suppliers" },
    { path: "/smart-contracts", icon: <FileText className="sidebar-item-icon" />, label: "Smart Contracts" },
    { path: "/transactions", icon: <Wallet className="sidebar-item-icon" />, label: "Transactions" },
    { path: "/analytics", icon: <BarChart3 className="sidebar-item-icon" />, label: "Analytics" },
    { path: "/integrations", icon: <Plug className="sidebar-item-icon" />, label: "Integrations" },
    { path: "/qr-scanner", icon: <QrCode className="sidebar-item-icon" />, label: "QR Scanner", onClick: handleQRScanClick },
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
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ) : (
            <Link key={item.path} href={item.path}>
              <div 
                onClick={handleLinkClick}
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          )
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between px-4 py-3 mb-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-blue-900/50 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? 
                <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" /> : 
                <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              }
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                {user.profileImage}
              </div>
              <div>
                <p className="text-sm font-medium profile-name">{user.name}</p>
                <p className="text-xs profile-role">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <aside className={`sidebar hidden md:flex flex-col ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="p-4 border-b border-gray-700/50 dark:border-border-primary">
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
      
      <nav className={`flex-1 px-2 py-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {navItems.map((item) => 
          item.onClick ? (
            <div 
              key={item.path}
              onClick={item.onClick}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </div>
          ) : (
            <Link key={item.path} href={item.path}>
              <div
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
            </Link>
          )
        )}
      </nav>
      
      <div className={`p-4 border-t border-gray-700/50 dark:border-border-primary ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {!sidebarCollapsed && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-blue-900/50 transition-colors"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? 
                  <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" /> : 
                  <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                }
              </button>
              
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5 text-black dark:text-white" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                {user.profileImage}
              </div>
              <div>
                <p className="text-sm font-medium profile-name">{user.name}</p>
                <p className="text-xs profile-role">{user.role}</p>
              </div>
            </div>
          </>
        )}
        
        {sidebarCollapsed && (
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5 text-black dark:text-white" />
            </button>
            
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
              {user.profileImage}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}