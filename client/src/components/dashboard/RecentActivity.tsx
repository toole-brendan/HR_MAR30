import { activities } from "@/lib/mockData";
import ActivityItem from "../common/ActivityItem";

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-[#1C2541] text-white">
        <h3 className="font-bold">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
