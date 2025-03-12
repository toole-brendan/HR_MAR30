import { useState, useEffect } from "react";
import { format, subDays, addDays } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { Textarea } from "@/components/ui/textarea";

import { 
  Search, 
  Filter, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  ClipboardList, 
  Truck, 
  Package,
  Plus,
  FileText,
  History,
  Send, 
  ArrowRight,
  HelpCircle,
  CalendarClock,
  Info,
  Activity,
  BarChart3,
  User, 
  Tag,
  ChevronRight,
  Hammer,
  MessageSquare,
  Bell,
  ListChecks,
  MailQuestion,
  Settings,
  PlusCircle as CirclePlus,
  QrCode,
  Paperclip,
  Camera as CameraIcon,
  Upload as UploadIcon
} from "lucide-react";

import { maintenanceItems, maintenanceLogs, maintenanceStats, MaintenanceItem, MaintenanceLog } from "@/lib/maintenanceData";

// Maintenance notifications/bulletins data
interface MaintenanceBulletin {
  id: string;
  title: string;
  message: string;
  category: 'parts-shortage' | 'delay' | 'update' | 'facility' | 'general';
  affectedItems?: string[];
  postedBy: string;
  postedDate: string;
  resolvedDate?: string;
  resolved: boolean;
}

const maintenanceBulletins: MaintenanceBulletin[] = [
  {
    id: "b1",
    title: "Parts Shortage: M4 Firing Pin",
    message: "We are currently experiencing a shortage of M4 firing pins. Maintenance requests requiring this part will be delayed by approximately 2 weeks. We've placed an emergency order and expect delivery by April 15.",
    category: 'parts-shortage',
    affectedItems: ["M4A1 Carbine"],
    postedBy: "SFC Wright",
    postedDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    resolved: false
  },
  {
    id: "b2",
    title: "HMMWV Maintenance Delay",
    message: "Due to increased operational tempo, all non-critical HMMWV maintenance is being rescheduled. Critical repairs remain prioritized. Contact the maintenance team if you believe your request should be escalated.",
    category: 'delay',
    affectedItems: ["HMMWV"],
    postedBy: "CPT Miller",
    postedDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    resolved: false
  },
  {
    id: "b3",
    title: "Maintenance Bay Closure",
    message: "Bay 3 will be closed for renovation from April 10-15. All scheduled maintenance in this bay is being rescheduled. You will receive notification of your new maintenance appointment date.",
    category: 'facility',
    postedBy: "1SG Robinson",
    postedDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    resolved: false
  },
  {
    id: "b4",
    title: "NVG Repair Process Improved",
    message: "We've received new calibration equipment for night vision devices. Repair turnaround time has been reduced from 72 hours to 24 hours for most issues.",
    category: 'update',
    affectedItems: ["Night Vision Goggles"],
    postedBy: "SPC Adams",
    postedDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    resolved: true,
    resolvedDate: format(subDays(new Date(), 1), 'yyyy-MM-dd')
  }
];

interface MaintenanceProps {
  id?: string;
}

const Maintenance: React.FC<MaintenanceProps> = ({ id }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [addBulletinModalOpen, setAddBulletinModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("my-requests");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Filter maintenance items for current user
  // In a real app, this would filter by the current user's ID
  const myMaintenanceRequests = maintenanceItems.filter(item => 
    item.reportedBy === "CPT Rodriguez" || 
    item.reportedBy === "SSG Wilson"
  );

  // Get filtered maintenance requests based on search term and status
  const filteredRequests = myMaintenanceRequests.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get maintenance logs for a specific item
  const getItemMaintenanceLogs = (maintenanceId: string): MaintenanceLog[] => {
    return maintenanceLogs.filter(log => log.maintenanceId === maintenanceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Handler for viewing item details
  const handleViewDetails = (item: MaintenanceItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  // Handler for starting maintenance
  const handleStartMaintenance = (item: MaintenanceItem) => {
    // In a real app, this would update the item status in the database
    toast({
      title: "Maintenance Started",
      description: `Maintenance for ${item.itemName} has been started.`,
      variant: "default",
    });
  };

  // Handler for completing maintenance
  const handleCompleteMaintenance = (item: MaintenanceItem) => {
    // In a real app, this would update the item status in the database
    toast({
      title: "Maintenance Completed",
      description: `Maintenance for ${item.itemName} has been marked as complete.`,
      variant: "default",
    });
  };

  // Handler for opening new maintenance request modal
  const handleNewRequestClick = () => {
    setNewRequestModalOpen(true);
  };

  // Handler for submitting new maintenance request
  const handleSubmitNewRequest = () => {
    setNewRequestModalOpen(false);
    toast({
      title: "Request Submitted",
      description: "Your maintenance request has been submitted successfully.",
      variant: "default",
    });
  };

  // Handler for adding a new bulletin
  const handleAddBulletinClick = () => {
    setAddBulletinModalOpen(true);
  };

  // Handler for submitting a new bulletin
  const handleSubmitBulletin = () => {
    setAddBulletinModalOpen(false);
    toast({
      title: "Bulletin Posted",
      description: "Your maintenance bulletin has been posted successfully.",
      variant: "default",
    });
  };

  // Page actions - empty now as redundant button removed
  const actions = null;

  // If an ID is provided, find and show the specific maintenance record
  useEffect(() => {
    if (id) {
      const record = maintenanceItems.find(item => item.id === id);
      if (record) {
        // Show details of the specific maintenance record
        setSelectedItem(record);
        setDetailsModalOpen(true);
      }
    }
  }, [id]);

  return (
    <PageWrapper withPadding={true}>
      {/* Header section with 8VC style formatting */}
      <div className="pt-16 pb-10">
        {/* Category label - Small all-caps category label */}
        <div className="text-xs uppercase tracking-wider font-medium mb-1 text-muted-foreground">
          MAINTENANCE
        </div>
        
        {/* Main title - following 8VC typography */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-1">Equipment Maintenance</h1>
            <p className="text-sm text-muted-foreground">Submit, track, and manage maintenance requests for your equipment</p>
          </div>
          {actions}
        </div>
      </div>

      {/* Main layout with left sidebar and main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar for new request and tracking status */}
        <div className="lg:w-80 xl:w-96 space-y-6">
          {/* Create New Request Card */}
          <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline border-b border-gray-100 dark:border-white/5">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  NEW REQUEST
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white flex items-center">
                  <CirclePlus className="h-5 w-5 mr-2 text-primary" />
                  Submit Request
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-sm mb-4 text-gray-500 dark:text-gray-400">Submit a new maintenance request for your equipment quickly.</p>
              <Button 
                className="w-full bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs font-medium"
                onClick={handleNewRequestClick}
              >
                NEW MAINTENANCE REQUEST
              </Button>
            </CardContent>
          </Card>

          {/* Maintenance Status Card */}
          <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline border-b border-gray-100 dark:border-white/5">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  CURRENT STATUS
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Maintenance Overview
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-none bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending</p>
                    <p className="text-xs tracking-wide text-muted-foreground">Awaiting service</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-none uppercase text-[10px] tracking-wider font-medium bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30">
                  {myMaintenanceRequests.filter(item => item.status === 'scheduled').length}
                </Badge>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-none bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mr-3">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">In Progress</p>
                    <p className="text-xs tracking-wide text-muted-foreground">Currently being worked on</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-none uppercase text-[10px] tracking-wider font-medium bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">
                  {myMaintenanceRequests.filter(item => item.status === 'in-progress').length}
                </Badge>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-none bg-green-50 dark:bg-green-900/10 flex items-center justify-center text-green-600 dark:text-green-400 mr-3">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs tracking-wide text-muted-foreground">Ready for pickup</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-none uppercase text-[10px] tracking-wider font-medium bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30">
                  {myMaintenanceRequests.filter(item => item.status === 'completed').length}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-none bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-600 dark:text-red-400 mr-3">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Critical</p>
                    <p className="text-xs tracking-wide text-muted-foreground">High priority items</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-none uppercase text-[10px] tracking-wider font-medium bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/30">
                  {myMaintenanceRequests.filter(item => item.priority === 'critical').length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Timeline Card */}
          <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline border-b border-gray-100 dark:border-white/5">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  UPCOMING
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Maintenance Schedule
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {myMaintenanceRequests
                  .filter(item => item.scheduledDate)
                  .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
                  .slice(0, 3)
                  .map(item => (
                    <div key={item.id} className="flex items-start border-b border-gray-100 dark:border-white/5 pb-3 last:border-b-0 last:pb-0">
                      <div className="h-8 w-8 rounded-none bg-primary/5 flex items-center justify-center text-primary mr-3 mt-0.5">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.itemName}</p>
                        <p className="text-xs tracking-wide text-muted-foreground">{item.scheduledDate}</p>
                        <div className="flex items-center mt-1">
                          <Badge className={`rounded-none uppercase text-[10px] tracking-wider font-medium px-1.5 py-0 ${
                            item.priority === 'critical' ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/30' :
                            item.priority === 'high' ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30' :
                            'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30'
                          }`}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300" 
                        onClick={() => handleViewDetails(item)}
                      >
                        Details
                      </Button>
                    </div>
                  ))
                }

                {myMaintenanceRequests.filter(item => item.scheduledDate).length === 0 && (
                  <div className="py-2 text-center text-sm text-muted-foreground">
                    No upcoming maintenance scheduled
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right main content area */}
        <div className="flex-1">
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full rounded-none bg-gray-50 dark:bg-white/5 h-10 mb-6">
              <TabsTrigger value="my-requests" className="uppercase tracking-wider text-xs font-medium rounded-none">
                <ListChecks className="h-4 w-4 mr-2" />
                My Requests
              </TabsTrigger>
              <TabsTrigger value="bulletins" className="uppercase tracking-wider text-xs font-medium rounded-none">
                <Bell className="h-4 w-4 mr-2" />
                Maintenance Bulletins
              </TabsTrigger>
              <TabsTrigger value="help" className="uppercase tracking-wider text-xs font-medium rounded-none">
                <MailQuestion className="h-4 w-4 mr-2" />
                Help & FAQ
              </TabsTrigger>
            </TabsList>

            {/* My Requests Tab */}
            <TabsContent value="my-requests">
              <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
                <div className="p-4 flex justify-between items-baseline border-b border-gray-100 dark:border-white/5">
                  <div>
                    <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                      MAINTENANCE REQUESTS
                    </div>
                    <div className="text-lg font-normal text-gray-900 dark:text-white">
                      My Equipment Service Requests
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Search & Filters section with 8VC styling */}
                  <div className="mb-6">
                    <div className="text-xs uppercase tracking-wider font-medium mb-4 text-muted-foreground">
                      SEARCH & FILTERS
                    </div>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Search by name, serial number, or description"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none"
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                      {filteredRequests.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Wrench className="h-8 w-8 opacity-30" />
                            <p>No maintenance requests found</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400"
                              onClick={handleNewRequestClick}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create New Request
                            </Button>
                          </div>
                        </div>
                      ) : (
                        filteredRequests.map((item) => (
                          <div key={item.id} className="py-4 hover:bg-gray-50 dark:hover:bg-white/5">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{item.itemName}</h4>
                                  <MaintenanceStatusBadge status={item.status} />
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
                                  <span className="flex items-center">
                                    <Tag className="h-3 w-3 mr-1" /> 
                                    {item.serialNumber}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" /> 
                                    Reported: {item.reportedDate}
                                  </span>
                                  {item.scheduledDate && (
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" /> 
                                      Scheduled: {item.scheduledDate}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm">{item.description}</p>
                                
                                {/* Progress indicator for in-progress items */}
                                {item.status === 'in-progress' && (
                                  <div className="mt-3 space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Progress</span>
                                      <span>60%</span>
                                    </div>
                                    <Progress value={60} className="h-2" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 sm:flex-col sm:items-end mt-2 sm:mt-0">
                                <MaintenancePriorityBadge priority={item.priority} />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300"
                                  onClick={() => handleViewDetails(item)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                
                <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5">
                  <div className="text-xs tracking-wide text-muted-foreground">
                    {filteredRequests.length} requests displayed • Last updated: Today, 08:30
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Maintenance Bulletins Tab */}
            <TabsContent value="bulletins">
              <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
                <div className="p-4 flex justify-between items-baseline border-b border-gray-100 dark:border-white/5">
                  <div>
                    <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                      NOTIFICATIONS
                    </div>
                    <div className="text-lg font-normal text-gray-900 dark:text-white">
                      Maintenance Bulletins
                    </div>
                  </div>
                  
                  {/* Only show for maintenance staff */}
                  <Button 
                    size="sm"
                    variant="ghost"
                    className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1.5"
                    onClick={handleAddBulletinClick}
                  >
                    <CirclePlus className="h-4 w-4" />
                    POST BULLETIN
                  </Button>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {maintenanceBulletins.map(bulletin => (
                      <div key={bulletin.id} className="border border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-lg flex items-center">
                              {bulletin.category === 'parts-shortage' && <Package className="h-4 w-4 mr-2 text-amber-500" />}
                              {bulletin.category === 'delay' && <Clock className="h-4 w-4 mr-2 text-red-500" />}
                              {bulletin.category === 'update' && <Info className="h-4 w-4 mr-2 text-green-500" />}
                              {bulletin.category === 'facility' && <Settings className="h-4 w-4 mr-2 text-blue-500" />}
                              {bulletin.category === 'general' && <Bell className="h-4 w-4 mr-2 text-gray-500" />}
                              {bulletin.title}
                            </h3>
                            {bulletin.resolved ? (
                              <Badge variant="outline" className="rounded-none uppercase text-[10px] tracking-wider font-medium bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30">
                                Resolved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-none uppercase text-[10px] tracking-wider font-medium bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">
                                Active
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">{bulletin.message}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {bulletin.affectedItems?.map(item => (
                              <Badge key={item} variant="outline" className="rounded-none text-[10px] uppercase tracking-wider font-medium bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-900/30">
                                {item}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex justify-between border-t border-gray-100 dark:border-white/5 pt-3 text-xs text-muted-foreground mt-2">
                            <span className="tracking-wide">Posted by: {bulletin.postedBy}</span>
                            <span className="tracking-wide">Date: {bulletin.postedDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5">
                  <div className="text-xs tracking-wide text-muted-foreground">
                    {maintenanceBulletins.length} bulletins displayed • Last updated: Today, 08:30
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Help & FAQ Tab */}
            <TabsContent value="help">
              <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
                <div className="p-4 flex justify-between items-baseline border-b border-gray-100 dark:border-white/5">
                  <div>
                    <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                      SUPPORT
                    </div>
                    <div className="text-lg font-normal text-gray-900 dark:text-white">
                      Maintenance Help & FAQ
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="border-b border-gray-100 dark:border-white/5 pb-5">
                      <h3 className="font-medium flex items-center text-lg mb-3">
                        <MailQuestion className="h-5 w-5 mr-2 text-primary" />
                        How do I submit a maintenance request?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 ml-7">
                        Click the "New Request" button at the top of the page or use the quick action in the sidebar. 
                        Fill out the form with details about your equipment and the issue you're experiencing.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-100 dark:border-white/5 pb-5">
                      <h3 className="font-medium flex items-center text-lg mb-3">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        How long will my maintenance request take?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 ml-7">
                        Standard maintenance typically takes 3-5 business days depending on parts availability and current workload. 
                        Critical requests are prioritized based on operational needs. Check the "Maintenance Bulletins" tab for any 
                        announcements about delays or parts shortages.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-100 dark:border-white/5 pb-5">
                      <h3 className="font-medium flex items-center text-lg mb-3">
                        <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                        How do I report an emergency maintenance issue?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 ml-7">
                        For emergency issues that affect mission readiness, submit a request with "Critical" priority. 
                        Additionally, contact the Maintenance Control Office directly at extension 5432.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-100 dark:border-white/5 pb-5">
                      <h3 className="font-medium flex items-center text-lg mb-3">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                        How can I check the status of my request?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 ml-7">
                        Your maintenance requests are displayed in the "My Requests" tab with their current status. 
                        Click "View Details" on any request to see the complete maintenance history and current progress.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium flex items-center text-lg mb-3">
                        <Truck className="h-5 w-5 mr-2 text-primary" />
                        What if my equipment needs external repair?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 ml-7">
                        If your equipment requires repair at an external facility, the maintenance team will coordinate 
                        the process and keep you updated through the system. External repairs typically require additional 
                        processing time and appropriate approvals.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-100 dark:border-white/5 rounded-none bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 p-4 mt-6">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-lg mb-1">Need more help?</h3>
                        <p className="text-sm">
                          Contact the Maintenance Control Office at extension 5432 or email maintenance@handreceipt.mil
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5">
                  <div className="text-xs tracking-wide text-muted-foreground">
                    Last updated: March 05, 2025
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Maintenance Details Modal */}
      {selectedItem && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Maintenance Request Details
              </DialogTitle>
              <DialogDescription>
                Tracking information for maintenance request #{selectedItem.id.substring(1)}
              </DialogDescription>
            </DialogHeader>
            
            {/* Status badges at the top */}
            <div className="flex flex-wrap gap-2 mb-4">
              <MaintenanceStatusBadge status={selectedItem.status} size="lg" />
              <MaintenancePriorityBadge priority={selectedItem.priority} size="lg" />
              {selectedItem.maintenanceType && (
                <Badge variant="outline" className="text-sm px-3 py-1 capitalize">
                  {selectedItem.maintenanceType} Maintenance
                </Badge>
              )}
            </div>

            <div className="space-y-6">
              {/* Progress indicator for in-progress items */}
              {selectedItem.status === 'in-progress' && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-blue-800 dark:text-blue-400">Current Progress</h3>
                    <span className="text-blue-800 dark:text-blue-400">60%</span>
                  </div>
                  <Progress value={60} className="h-2 mb-2" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <Clock className="inline h-3 w-3 mr-1" /> 
                    Estimated completion: {selectedItem.estimatedCompletionTime || "Unknown"}
                  </p>
                </div>
              )}
              
              {/* Item Information */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Equipment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Item Name</p>
                    <p className="font-medium">{selectedItem.itemName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="font-medium">{selectedItem.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{selectedItem.category}</p>
                  </div>
                </div>
              </div>
              
              {/* Issue Description */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <MailQuestion className="mr-2 h-4 w-4" />
                  Reported Issue
                </h3>
                <p className="mb-3">{selectedItem.description}</p>
                <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm text-muted-foreground">
                  <span>Reported by: <span className="font-medium">{selectedItem.reportedBy}</span></span>
                  <span className="hidden md:inline">•</span>
                  <span>Date: <span className="font-medium">{selectedItem.reportedDate}</span></span>
                </div>
              </div>
              
              {/* Maintenance Schedule */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Maintenance Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-l-2 border-l-blue-500 pl-3">
                    <p className="text-sm text-muted-foreground">Reported</p>
                    <p className="font-medium">{selectedItem.reportedDate}</p>
                  </div>
                  
                  <div className={`border-l-2 pl-3 ${selectedItem.scheduledDate ? 'border-l-amber-500' : 'border-l-gray-300 dark:border-l-gray-700'}`}>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="font-medium">{selectedItem.scheduledDate || "Not scheduled yet"}</p>
                  </div>
                  
                  <div className={`border-l-2 pl-3 ${selectedItem.completedDate ? 'border-l-green-500' : 'border-l-gray-300 dark:border-l-gray-700'}`}>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">{selectedItem.completedDate || "Pending"}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Assigned Technician</p>
                  <p className="font-medium">{selectedItem.assignedTo || "Not assigned yet"}</p>
                </div>
                
                {selectedItem.notes && (
                  <div className="mt-4 bg-muted/30 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Technician Notes:</p>
                    <p className="text-sm">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Parts Information */}
              {selectedItem.partsRequired && selectedItem.partsRequired.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Hammer className="mr-2 h-4 w-4" />
                    Required Parts
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Part Name</th>
                          <th className="text-left py-2 font-medium">Part Number</th>
                          <th className="text-center py-2 font-medium">Quantity</th>
                          <th className="text-right py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.partsRequired.map(part => (
                          <tr key={part.id} className="border-b">
                            <td className="py-2">{part.name}</td>
                            <td className="py-2">{part.partNumber}</td>
                            <td className="py-2 text-center">{part.quantity}</td>
                            <td className="py-2 text-right">
                              {part.available ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Available</Badge>
                              ) : (
                                <div>
                                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">On Order</Badge>
                                  {part.estimatedArrival && (
                                    <p className="text-xs text-gray-500 mt-1">ETA: {part.estimatedArrival}</p>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Maintenance History */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  Maintenance History
                </h3>
                <div className="space-y-3">
                  {getItemMaintenanceLogs(selectedItem.id).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No history records available</p>
                  ) : (
                    getItemMaintenanceLogs(selectedItem.id).map(log => (
                      <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                        <div className="bg-primary/10 p-2 rounded-full mt-1">
                          {log.action === 'created' && <Plus className="h-4 w-4 text-primary" />}
                          {log.action === 'updated' && <FileText className="h-4 w-4 text-primary" />}
                          {log.action === 'status-change' && <Activity className="h-4 w-4 text-primary" />}
                          {log.action === 'parts-ordered' && <Truck className="h-4 w-4 text-primary" />}
                          {log.action === 'parts-received' && <Package className="h-4 w-4 text-primary" />}
                          {log.action === 'completed' && <CheckCircle className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between gap-2">
                            <p className="font-medium text-sm">
                              <span className="capitalize">{log.action.replace('-', ' ')}</span>
                            </p>
                            <p className="text-xs text-gray-500">{log.timestamp}</p>
                          </div>
                          <p className="text-sm">{log.notes}</p>
                          <p className="text-xs text-muted-foreground mt-1">By: {log.performedBy}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 flex-col sm:flex-row">
              {/* Request actions */}
              <div className="flex gap-2 flex-1 justify-start">
                {selectedItem.status === 'in-progress' && (
                  <Button variant="outline" className="text-blue-600 border-blue-600">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                )}
              </div>
              
              {/* Status change actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
                
                {selectedItem.status === 'scheduled' && (
                  <Button 
                    className="bg-[#3B5BDB] hover:bg-[#364FC7] flex items-center justify-center"
                    onClick={() => {
                      handleStartMaintenance(selectedItem);
                      setDetailsModalOpen(false);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Maintenance
                  </Button>
                )}
                
                {selectedItem.status === 'in-progress' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleCompleteMaintenance(selectedItem);
                      setDetailsModalOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Maintenance Request Modal */}
      <Dialog open={newRequestModalOpen} onOpenChange={setNewRequestModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <CirclePlus className="mr-2 h-5 w-5" />
              New Maintenance Request
            </DialogTitle>
            <DialogDescription>
              Submit a maintenance request for your equipment
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            {/* Equipment Selection Method */}
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="manual">
                  <FileText className="h-4 w-4 mr-2" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="scan">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR Code
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Item Name</label>
                    <Input placeholder="Enter item name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serial Number</label>
                    <Input placeholder="Enter serial number" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="scan">
                <Card>
                  <CardContent className="py-4">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="bg-primary/10 p-4 rounded-full mb-3">
                        <QrCode className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">Scan Equipment QR Code</h3>
                      <p className="text-sm text-muted-foreground mb-3">Scan the QR code on your equipment to automatically fill details</p>
                      <Button>
                        <QrCode className="h-4 w-4 mr-2" />
                        Open Scanner
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weapon">Weapon</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="optics">Optics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Date (if any)</label>
                <Input type="date" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description of Issue</label>
              <Textarea 
                placeholder="Describe the maintenance needed or issue observed in detail. Include when the issue started and any troubleshooting steps already taken." 
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed rounded-md p-4 text-center">
                <CameraIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Drag & drop photos or click to browse</p>
                <Button variant="outline" size="sm">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
            
            <Card className="bg-amber-50 text-amber-800 dark:bg-amber-900/10 dark:text-amber-400 border-amber-200 dark:border-amber-800">
              <CardContent className="py-3 px-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-400">Important Notice</h4>
                  <p className="text-sm mt-1">For critical equipment affecting operational readiness, please also notify your supervisor after submitting this request.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNewRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitNewRequest}
              className="bg-[#3B5BDB] hover:bg-[#364FC7] w-full"
            >
              <div className="flex items-center justify-center w-full">
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </div>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Post Maintenance Bulletin Modal */}
      <Dialog open={addBulletinModalOpen} onOpenChange={setAddBulletinModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Post Maintenance Bulletin
            </DialogTitle>
            <DialogDescription>
              Share important maintenance updates with personnel
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bulletin Title</label>
              <Input placeholder="Enter bulletin title" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parts-shortage">Parts Shortage</SelectItem>
                    <SelectItem value="delay">Maintenance Delay</SelectItem>
                    <SelectItem value="update">Process Update</SelectItem>
                    <SelectItem value="facility">Facility Notice</SelectItem>
                    <SelectItem value="general">General Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                placeholder="Provide detailed information about the maintenance update" 
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Affected Equipment (Optional)</label>
              <Input placeholder="Enter equipment types affected by this bulletin" />
              <p className="text-xs text-muted-foreground">Separate multiple items with commas</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Resolution Date (Optional)</label>
              <Input type="date" />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddBulletinModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBulletin}
              className="bg-[#3B5BDB] hover:bg-[#364FC7] w-full"
            >
              <div className="flex items-center justify-center w-full">
                <Bell className="h-4 w-4 mr-2" />
                Post Bulletin
              </div>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
};

// Maintenance list component
interface MaintenanceListProps {
  items: MaintenanceItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  onViewDetails: (item: MaintenanceItem) => void;
  onStartMaintenance: (item: MaintenanceItem) => void;
  onCompleteMaintenance: (item: MaintenanceItem) => void;
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({
  items,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  onViewDetails,
  onStartMaintenance,
  onCompleteMaintenance
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Requests</CardTitle>
        <CardDescription>
          View and manage equipment maintenance requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search by name, serial number, or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="w-full md:w-40">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="weapon">Weapons</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
                <SelectItem value="communication">Communications</SelectItem>
                <SelectItem value="optics">Optics</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-40">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-40">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="grid grid-cols-1 divide-y">
            {items.length === 0 ? (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Wrench className="h-8 w-8 opacity-30" />
                  <p>No maintenance requests found</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <MaintenanceItemRow 
                  key={item.id} 
                  item={item} 
                  onViewDetails={onViewDetails}
                  onStartMaintenance={onStartMaintenance}
                  onCompleteMaintenance={onCompleteMaintenance}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Maintenance item row component
interface MaintenanceItemRowProps {
  item: MaintenanceItem;
  onViewDetails: (item: MaintenanceItem) => void;
  onStartMaintenance: (item: MaintenanceItem) => void;
  onCompleteMaintenance: (item: MaintenanceItem) => void;
}

const MaintenanceItemRow: React.FC<MaintenanceItemRowProps> = ({
  item,
  onViewDetails,
  onStartMaintenance,
  onCompleteMaintenance
}) => {
  // Define category icon
  let CategoryIcon = Wrench;
  switch (item.category) {
    case 'weapon': CategoryIcon = Sword; break;
    case 'vehicle': CategoryIcon = Truck; break;
    case 'communication': CategoryIcon = Radio; break;
    case 'optics': CategoryIcon = Search; break;
    default: CategoryIcon = Hammer;
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white
            ${item.category === 'weapon' ? 'bg-red-700 dark:bg-red-800' : ''}
            ${item.category === 'vehicle' ? 'bg-amber-700 dark:bg-amber-800' : ''}
            ${item.category === 'communication' ? 'bg-blue-700 dark:bg-blue-800' : ''}
            ${item.category === 'optics' ? 'bg-purple-700 dark:bg-purple-800' : ''}
            ${item.category === 'other' ? 'bg-gray-700 dark:bg-gray-800' : ''}
          `}>
            <CategoryIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-medium">{item.itemName}</h4>
              <MaintenanceStatusBadge status={item.status} />
              <MaintenancePriorityBadge priority={item.priority} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 dark:text-gray-400 gap-2 mt-1">
              <span className="flex items-center">
                <Tag className="h-3 w-3 mr-1" /> {item.serialNumber}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> {item.scheduledDate || "Not scheduled"}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" /> {item.assignedTo || "Unassigned"}
              </span>
            </div>
            <p className="text-sm mt-2">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(item)}
          >
            Details
          </Button>
          
          {item.status === 'scheduled' && (
            <Button 
              size="sm"
              className="bg-[#3B5BDB] hover:bg-[#364FC7] w-full"
              onClick={() => onStartMaintenance(item)}
            >
              <div className="flex items-center justify-center w-full">
                <Play className="h-4 w-4 mr-2" />
                Start
              </div>
            </Button>
          )}
          
          {item.status === 'in-progress' && (
            <Button 
              size="sm"
              className="bg-[#3B5BDB] hover:bg-[#364FC7] w-full"
              onClick={() => onCompleteMaintenance(item)}
            >
              <div className="flex items-center justify-center w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Status badge component
interface MaintenanceStatusBadgeProps {
  status: string;
  size?: 'default' | 'sm' | 'lg';
}

const MaintenanceStatusBadge: React.FC<MaintenanceStatusBadgeProps> = ({ status, size = 'default' }) => {
  let badgeClass = "";
  let statusLabel = "";
  
  switch (status) {
    case 'scheduled':
      badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      statusLabel = "Scheduled";
      break;
    case 'in-progress':
      badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      statusLabel = "In Progress";
      break;
    case 'completed':
      badgeClass = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      statusLabel = "Completed";
      break;
    case 'cancelled':
      badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      statusLabel = "Cancelled";
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      statusLabel = status;
  }
  
  // Add size-specific classes
  if (size === 'lg') {
    badgeClass += " text-sm py-1 px-3";
  } else if (size === 'sm') {
    badgeClass += " text-xs py-0 px-2";
  }
  
  return <Badge className={badgeClass}>{statusLabel}</Badge>;
};

// Priority badge component
interface MaintenancePriorityBadgeProps {
  priority: string;
  size?: 'default' | 'sm' | 'lg';
}

const MaintenancePriorityBadge: React.FC<MaintenancePriorityBadgeProps> = ({ priority, size = 'default' }) => {
  let badgeClass = "";
  let priorityLabel = "";
  
  switch (priority) {
    case 'low':
      badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800";
      priorityLabel = "Low Priority";
      break;
    case 'medium':
      badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      priorityLabel = "Medium Priority";
      break;
    case 'high':
      badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      priorityLabel = "High Priority";
      break;
    case 'critical':
      badgeClass = "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800";
      priorityLabel = "Critical Priority";
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800";
      priorityLabel = priority;
  }
  
  // Add size-specific classes
  if (size === 'lg') {
    badgeClass += " text-sm py-1 px-3";
    priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  } else if (size === 'sm') {
    badgeClass += " text-xs py-0 px-2";
    priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  }
  
  return <Badge className={badgeClass} variant="outline">{priorityLabel}</Badge>;
};

// Special Play icon component
const Play: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

// Special Radio icon component for the missing Lucide icon
const Radio: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
    <circle cx="12" cy="12" r="2"></circle>
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>
  </svg>
);

// Special Sword icon component for the missing Lucide icon
const Sword: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
    <line x1="13" y1="19" x2="19" y2="13"></line>
    <line x1="16" y1="16" x2="20" y2="20"></line>
    <line x1="19" y1="21" x2="21" y2="19"></line>
  </svg>
);

export default Maintenance;