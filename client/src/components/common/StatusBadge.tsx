import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "pending":
        return "bg-[#FFC107] bg-opacity-20 text-[#FFC107]";
      case "approved":
        return "bg-[#28A745] bg-opacity-20 text-[#28A745]";
      case "rejected":
        return "bg-[#DC3545] bg-opacity-20 text-[#DC3545]";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  return (
    <span className={cn(
      "inline-flex px-2 py-1 text-xs font-medium rounded-full",
      getStatusStyles(),
      className
    )}>
      {getStatusText()}
    </span>
  );
};

export default StatusBadge;
