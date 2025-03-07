import { useContext } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import {
  Home,
  Package,
  Send,
  ClipboardList,
  Settings,
  BarChart3,
  Menu,
  Moon,
  Sun,
  QrCode,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Shield,
  Wrench,
  FileText,
} from "lucide-react";

interface SidebarProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
  openQRScanner?: () => void;
  toggleTheme?: () => void;
  toggleSidebar?: () => void;
}

const Sidebar = ({
  isMobile = false,
  closeMobileMenu,
  openQRScanner,
  toggleTheme: toggleThemeProp,
  toggleSidebar: toggleSidebarProp
}: SidebarProps) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme: contextToggleTheme, sidebarCollapsed, toggleSidebar: contextToggleSidebar } = useApp();

  // Use the functions from context directly if they're not passed as props
  const toggleTheme = () => {
    if (toggleThemeProp) {
      toggleThemeProp();
    } else {
      contextToggleTheme();
    }
  };
  
  const toggleSidebar = () => {
    if (toggleSidebarProp) {
      toggleSidebarProp();
    } else {
      contextToggleSidebar();
    }
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLinkClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };
  
  const handleLogoClick = () => {
    // Navigate to the dashboard page
    window.location.href = '/';
  };
  
  const handleQRScanClick = () => {
    if (openQRScanner) {
      openQRScanner();
    }
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
    notificationCount?: number;
    onClick?: () => void;
  }

  // Updated nav items according to the new structure
  const navItems: NavItem[] = [
    { path: "/", icon: <Home className="sidebar-item-icon" />, label: "Dashboard" },
    { path: "/property-book", icon: <BookOpen className="sidebar-item-icon" />, label: "Property Book" },
    { path: "/sensitive-items", icon: <Shield className="sidebar-item-icon" />, label: "Sensitive Items" },
    { 
      path: "/transfers", 
      icon: <Send className="sidebar-item-icon" />, 
      label: "Transfers",
      notificationCount: 3
    },
    { path: "/maintenance", icon: <Wrench className="sidebar-item-icon" />, label: "Maintenance" },
    { path: "/qr-management", icon: <QrCode className="sidebar-item-icon" />, label: "QR Management" },
    { path: "/reports", icon: <FileText className="sidebar-item-icon" />, label: "Reports" }
  ];
  
  // Footer actions
  const qrScanAction = {
    path: "/scan",
    icon: <QrCode className="sidebar-item-icon" />,
    label: "Scan QR Code",
    onClick: handleQRScanClick
  };
  
  const settingsAction = {
    path: "/settings",
    icon: <Settings className="sidebar-item-icon" />,
    label: "Settings"
  };

  if (isMobile) {
    return (
      <nav className="flex-1 p-4 flex flex-col">
        {/* Mobile Logo */}
        <div 
          className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity mb-4"
          onClick={handleLogoClick}
        >
          <div className="border border-gray-800/70 dark:border-gray-100/70 px-4 py-1.5">
            <h1 className="text-lg font-light tracking-widest text-gray-800 dark:text-gray-100 m-0 font-serif">HandReceipt</h1>
          </div>
        </div>
        
        {/* Main navigation section */}
        <div className="flex-1 space-y-1">
          {/* Main navigation items */}
          {navItems.map((item) => 
            item.onClick ? (
              <div 
                key={item.path}
                onClick={() => handleLinkClick(item.onClick)}
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.notificationCount && (
                  <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {item.notificationCount}
                  </span>
                )}
              </div>
            ) : (
              <Link key={item.path} href={item.path}>
                <div 
                  onClick={() => handleLinkClick()}
                  className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.notificationCount && (
                    <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                      {item.notificationCount}
                    </span>
                  )}
                </div>
              </Link>
            )
          )}
        </div>
        
        {/* Footer section */}
        <div className="mt-auto pt-4 space-y-3">
          {/* Footer divider */}
          <div className="border-t border-gray-700/50 dark:border-gray-200/20 mb-4"></div>
          
          {/* QR Scanner quick action button */}
          <div 
            key={qrScanAction.path}
            onClick={() => handleLinkClick(qrScanAction.onClick)}
            className="sidebar-item bg-primary/10 hover:bg-primary/20 py-3"
          >
            {qrScanAction.icon}
            <span>{qrScanAction.label}</span>
          </div>
          
          {/* Settings link */}
          <Link href={settingsAction.path}>
            <div 
              onClick={() => handleLinkClick()}
              className={`sidebar-item ${isActive(settingsAction.path) ? "active" : ""} py-3`}
            >
              {settingsAction.icon}
              <span>{settingsAction.label}</span>
            </div>
          </Link>
          
          {/* User profile */}
          <div className="sidebar-item py-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium mr-3">
              J
            </div>
            <div>
              <p className="text-sm font-medium profile-name">SSG Doe, John</p>
              <p className="text-xs profile-role text-gray-500">Supply NCO</p>
            </div>
          </div>
          
          {/* Footer controls divider */}
          <div className="border-t border-gray-700/50 dark:border-gray-200/20 my-3"></div>
          
          {/* Theme and collapse controls */}
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-blue-900/20 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? 
                <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" /> : 
                <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              }
            </button>
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
      
      <div className="flex flex-col flex-1">
        {/* Main navigation items - top section */}
        <nav className={`flex-1 px-2 py-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {navItems.map((item) => 
            item.onClick ? (
              <div 
                key={item.path}
                onClick={() => handleLinkClick(item.onClick)}
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
                {item.notificationCount && !sidebarCollapsed && (
                  <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {item.notificationCount}
                  </span>
                )}
              </div>
            ) : (
              <Link key={item.path} href={item.path}>
                <div
                  className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => handleLinkClick()}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {item.notificationCount && !sidebarCollapsed && (
                    <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                      {item.notificationCount}
                    </span>
                  )}
                </div>
              </Link>
            )
          )}
        </nav>
        
        {/* Footer section with quick actions and user profile */}
        <div className={`mt-auto px-2 pt-2 pb-4 space-y-4 ${sidebarCollapsed ? 'text-center' : ''}`}>
          {/* Divider before quick actions */}
          <div className="border-t border-gray-700/50 dark:border-gray-200/20 my-3"></div>
          
          {/* QR Scanner button */}
          <div 
            key={qrScanAction.path}
            onClick={() => handleLinkClick(qrScanAction.onClick)}
            className={`sidebar-item ${isActive(qrScanAction.path) ? "active" : ""} bg-primary/10 hover:bg-primary/20 py-3`}
          >
            {qrScanAction.icon}
            {!sidebarCollapsed && <span>{qrScanAction.label}</span>}
          </div>
          
          {/* Settings link */}
          <Link href={settingsAction.path}>
            <div
              className={`sidebar-item ${isActive(settingsAction.path) ? "active" : ""} py-3`}
              onClick={() => handleLinkClick()}
            >
              {settingsAction.icon}
              {!sidebarCollapsed && <span>{settingsAction.label}</span>}
            </div>
          </Link>
          
          {/* User profile */}
          {!sidebarCollapsed ? (
            <div className="sidebar-item py-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium mr-3">
                J
              </div>
              <div>
                <p className="text-sm font-medium profile-name">SSG Doe, John</p>
                <p className="text-xs profile-role text-gray-500">Supply NCO</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium cursor-pointer">
                J
              </div>
            </div>
          )}
          
          {/* Divider before controls */}
          <div className="border-t border-gray-700/50 dark:border-gray-200/20 my-3"></div>
          
          {/* Theme toggle and sidebar collapse buttons */}
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-blue-900/20 transition-colors"
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
          ) : (
            <>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-blue-900/20 transition-colors mx-auto block mb-2"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? 
                  <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" /> : 
                  <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                }
              </button>
              
              {/* Expand button when collapsed */}
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors mx-auto block"
                title="Expand sidebar"
              >
                <ChevronRight className="h-5 w-5 text-black dark:text-white" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;