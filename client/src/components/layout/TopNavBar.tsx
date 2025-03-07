import { useAuth } from "@/context/AuthContext";

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
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button 
            type="button" 
            className="text-[#1C2541]"
            onClick={toggleMobileMenu}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
        
        {/* Logo - Mobile only */}
        <div className="md:hidden flex items-center">
          <h1 className="text-xl font-bold text-[#1C2541]">HandReceipt</h1>
        </div>
        
        {/* Search */}
        <div className="hidden md:flex md:flex-1 px-4">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search inventory or serial #" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B5320]"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-4">
          <button 
            type="button" 
            className="relative text-[#1C2541] p-2 rounded-full hover:bg-gray-100"
            onClick={openScanner}
          >
            <i className="fas fa-qrcode text-xl"></i>
          </button>
          <button 
            type="button" 
            className="relative text-[#1C2541] p-2 rounded-full hover:bg-gray-100"
            onClick={openNotifications}
          >
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute top-[-6px] right-[-6px] h-5 w-5 flex items-center justify-center bg-[#FFC107] text-white text-xs rounded-full">
              8
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
