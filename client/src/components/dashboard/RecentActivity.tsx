import { activities } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ListChecks, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { ActivityLogItem } from "@/components/dashboard/ActivityLogItem";

const RecentActivity: React.FC = () => {
  const [, navigate] = useLocation();
  const recentActivities = activities.slice(0, 4); // Only show 4 most recent activities

  return (
    <Card className="overflow-hidden border border-border dashboard-card">
      <CardHeader className="bg-muted/40 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </div>
        <CardDescription>System activity and notifications</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {recentActivities.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground flex flex-col items-center">
            <ListChecks className="h-12 w-12 mb-2 text-muted-foreground/50" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border p-4">
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
      
      <CardFooter className="bg-muted/10 py-3">
        <Button 
          variant="ghost" 
          className="w-full text-xs flex items-center justify-center"
          onClick={() => navigate("/audit-log")}
        >
          View All Activity
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentActivity;
