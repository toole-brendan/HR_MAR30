import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import UserProfile from "../common/UserProfile";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "home" },
    { path: "/scan", label: "Scan", icon: "qrcode" },
    { path: "/transfers", label: "Transfers", icon: "exchange-alt", notificationCount: 8 },
    { path: "/inventory", label: "Inventory", icon: "clipboard-list" },
    { path: "/audit-log", label: "Audit Log", icon: "history" },
    { path: "/settings", label: "Settings", icon: "cog" },
  ];

  return (
    <div 
      className={`md:hidden bg-[#1C2541] text-white absolute inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#545B62]">
        <h1 className="text-xl font-bold">HandReceipt</h1>
        <button 
          type="button" 
          className="text-white p-2"
          onClick={onClose}
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.path}>
            <Link href={item.path}>
              <div 
                className={`flex items-center px-4 py-3 cursor-pointer ${
                  location === item.path ? "bg-[#4B5320] rounded-md" : "text-white hover:bg-[#545B62] hover:bg-opacity-25 rounded-md"
                }`}
                onClick={onClose}
              >
                <i className={`fas fa-${item.icon} w-6`}></i>
                <span>{item.label}</span>
                {item.notificationCount && (
                  <span className="ml-auto bg-[#FFC107] text-xs px-2 py-1 rounded-full">
                    {item.notificationCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </nav>
      
      {user && <UserProfile user={user} />}
    </div>
  );
};

export default MobileMenu;
