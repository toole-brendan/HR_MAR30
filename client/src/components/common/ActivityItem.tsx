import { Activity } from "@/types";

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIconStyles = () => {
    switch (activity.type) {
      case "transfer-approved":
        return {
          bgColor: "bg-green-100",
          iconColor: "text-[#28A745]",
          icon: "check"
        };
      case "transfer-rejected":
        return {
          bgColor: "bg-red-100",
          iconColor: "text-[#DC3545]",
          icon: "times"
        };
      case "inventory-updated":
        return {
          bgColor: "bg-blue-100",
          iconColor: "text-blue-600",
          icon: "sync"
        };
      default:
        return {
          bgColor: "bg-gray-100",
          iconColor: "text-gray-500",
          icon: "info"
        };
    }
  };

  const { bgColor, iconColor, icon } = getIconStyles();

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex">
        <div className="mr-4 flex-shrink-0">
          <div className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center`}>
            <i className={`fas fa-${icon} ${iconColor}`}></i>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">{activity.description}</p>
          <p className="text-xs text-gray-500">{activity.user} • {activity.timeAgo}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
