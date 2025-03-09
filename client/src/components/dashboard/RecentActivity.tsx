import { activities } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";
import { useLocation } from "wouter";
import { ActivityLogItem } from "@/components/dashboard/ActivityLogItem";

const RecentActivity: React.FC = () => {
  const [, navigate] = useLocation();
  const recentActivities = activities.slice(0, 4); // Only show 4 most recent activities

  return (
    <Card className="overflow-hidden border border-border dashboard-card">
      {/* 8VC Style Header */}
      <div className="p-6 pb-4">
        {/* Category Label */}
        <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
          ACTIVITY LOG
        </div>
        {/* Main Title */}
        <div className="text-lg font-normal text-gray-900 dark:text-white">
          Recent blockchain activity
        </div>
      </div>
      
      <CardContent className="p-0">
        {recentActivities.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground flex flex-col items-center">
            <ListChecks className="h-12 w-12 mb-2 text-muted-foreground/50" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border px-6">
            {recentActivities.map((activity) => (
              <ActivityLogItem 
                key={activity.id}
                id={activity.id}
                title={activity.description}
                timestamp={activity.timeAgo}
                verified={activity.type === 'transfer-approved' || activity.type === 'inventory-updated'}
              />
            ))}
          </div>
        )}
      </CardContent>
      
      {/* 8VC Style Footer with right-aligned View All link */}
      <div className="px-6 py-4 flex justify-end">
        <Button 
          variant="ghost" 
          className="text-xs uppercase tracking-wider text-primary hover:bg-transparent hover:text-primary-600"
          onClick={() => navigate("/audit-log")}
        >
          VIEW ALL
        </Button>
      </div>
    </Card>
  );
};

export default RecentActivity;
