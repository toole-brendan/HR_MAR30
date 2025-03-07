import { useLocation } from "wouter";

interface QuickActionProps {
  icon: string;
  label: string;
  bgColor: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, bgColor, onClick }) => {
  return (
    <button 
      className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className={`h-12 w-12 ${bgColor} text-[#1C2541] rounded-full flex items-center justify-center mb-2`}>
        <i className={`fas fa-${icon} text-xl`}></i>
      </div>
      <span className="text-sm font-medium text-[#1C2541]">{label}</span>
    </button>
  );
};

interface QuickActionsProps {
  openScanner: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ openScanner }) => {
  const [, navigate] = useLocation();

  const actions = [
    { 
      icon: "qrcode", 
      label: "Scan QR", 
      bgColor: "bg-blue-100", 
      onClick: openScanner 
    },
    { 
      icon: "exchange-alt", 
      label: "Request Transfer", 
      bgColor: "bg-amber-100", 
      onClick: () => navigate("/transfers") 
    },
    { 
      icon: "search", 
      label: "Find Item", 
      bgColor: "bg-green-100", 
      onClick: () => navigate("/inventory") 
    },
    { 
      icon: "file-export", 
      label: "Export Report", 
      bgColor: "bg-red-100", 
      onClick: () => navigate("/audit-log") 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {actions.map((action, index) => (
        <QuickAction
          key={index}
          icon={action.icon}
          label={action.label}
          bgColor={action.bgColor}
          onClick={action.onClick}
        />
      ))}
    </div>
  );
};

export default QuickActions;
