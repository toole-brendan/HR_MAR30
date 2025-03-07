import { useState } from "react";
import { activities } from "@/lib/mockData";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AuditLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activityType, setActivityType] = useState<string>("all");

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activityType === "all" || activity.type === activityType;
    
    return matchesSearch && matchesType;
  });

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "transfer-approved":
        return <i className="fas fa-check text-[#28A745]"></i>;
      case "transfer-rejected":
        return <i className="fas fa-times text-[#DC3545]"></i>;
      case "inventory-updated":
        return <i className="fas fa-sync text-blue-600"></i>;
      default:
        return <i className="fas fa-info text-gray-500"></i>;
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1C2541] mb-2">Audit Log</h2>
        <p className="text-gray-600">Track all equipment changes and transfers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Comprehensive log of all equipment actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search activities"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={activityType}
                onValueChange={setActivityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="transfer-approved">Transfers Approved</SelectItem>
                  <SelectItem value="transfer-rejected">Transfers Rejected</SelectItem>
                  <SelectItem value="inventory-updated">Inventory Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-[#4B5320] hover:bg-[#3a4019]">
              <i className="fas fa-file-export mr-2"></i>
              Export Log
            </Button>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredActivities.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No activities found</div>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="py-4 flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActivityTypeIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1">
                      <span>{activity.user}</span>
                      <span className="hidden sm:inline mx-2">•</span>
                      <span>{activity.timeAgo}</span>
                      <span className="hidden sm:inline mx-2">•</span>
                      <span className="font-mono text-xs">{activity.id}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AuditLog;
