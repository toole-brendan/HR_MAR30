import { useState } from "react";
import { format } from "date-fns";
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
  Hammer
} from "lucide-react";

import { maintenanceItems, maintenanceLogs, maintenanceStats, MaintenanceItem, MaintenanceLog } from "@/lib/maintenanceData";

const Maintenance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [tabValue, setTabValue] = useState("pending");
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Filter maintenance items based on search term and filters
  const filteredItems = maintenanceItems.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesPriority = filterPriority === "all" || item.priority === filterPriority;
    
    // Filter by tab
    const matchesTab = 
      (tabValue === "pending" && (item.status === "scheduled" || item.status === "in-progress")) ||
      (tabValue === "completed" && item.status === "completed") ||
      (tabValue === "all");
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesTab;
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
    toast({
      title: "Maintenance Started",
      description: `Maintenance for ${item.itemName} has been started.`,
      variant: "default",
    });
  };

  // Handler for completing maintenance
  const handleCompleteMaintenance = (item: MaintenanceItem) => {
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

  // Page actions
  const actions = (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800"
        onClick={handleNewRequestClick}
      >
        <Plus className="h-4 w-4" />
        <span className={isMobile ? "" : "hidden sm:inline"}>New Request</span>
      </Button>
    </div>
  );

  return (
    <PageWrapper withPadding={true}>
      <PageHeader
        title="Maintenance Management"
        description="Schedule, track, and manage equipment maintenance"
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400">In Progress</p>
              <p className="text-2xl font-bold">{maintenanceStats.inProgress}</p>
              <p className="text-xs text-blue-600 dark:text-blue-500">Active maintenance tasks</p>
            </div>
            <div className="bg-blue-200 dark:bg-blue-700/30 p-3 rounded-full">
              <Wrench className="h-5 w-5 text-blue-700 dark:text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Scheduled</p>
              <p className="text-2xl font-bold">{maintenanceStats.scheduled}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500">Upcoming maintenance</p>
            </div>
            <div className="bg-amber-200 dark:bg-amber-700/30 p-3 rounded-full">
              <Calendar className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-400">Critical Priority</p>
              <p className="text-2xl font-bold">{maintenanceStats.criticalPending}</p>
              <p className="text-xs text-red-600 dark:text-red-500">Require immediate attention</p>
            </div>
            <div className="bg-red-200 dark:bg-red-700/30 p-3 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-400">Completed</p>
              <p className="text-2xl font-bold">{maintenanceStats.completedThisMonth}</p>
              <p className="text-xs text-green-600 dark:text-green-500">This month</p>
            </div>
            <div className="bg-green-200 dark:bg-green-700/30 p-3 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs 
        defaultValue="pending" 
        value={tabValue} 
        onValueChange={setTabValue}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="pending" className="py-2 data-[state=active]:bg-primary/10">
            <Clock className="h-4 w-4 mr-2" />
            Pending Maintenance
          </TabsTrigger>
          <TabsTrigger value="completed" className="py-2 data-[state=active]:bg-primary/10">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="all" className="py-2 data-[state=active]:bg-primary/10">
            <ClipboardList className="h-4 w-4 mr-2" />
            All Maintenance
          </TabsTrigger>
        </TabsList>

        {/* Tab content is the same for all tabs, but filtered differently */}
        <TabsContent value="pending" className="space-y-4">
          <MaintenanceList 
            items={filteredItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onViewDetails={handleViewDetails}
            onStartMaintenance={handleStartMaintenance}
            onCompleteMaintenance={handleCompleteMaintenance}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <MaintenanceList 
            items={filteredItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onViewDetails={handleViewDetails}
            onStartMaintenance={handleStartMaintenance}
            onCompleteMaintenance={handleCompleteMaintenance}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <MaintenanceList 
            items={filteredItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onViewDetails={handleViewDetails}
            onStartMaintenance={handleStartMaintenance}
            onCompleteMaintenance={handleCompleteMaintenance}
          />
        </TabsContent>
      </Tabs>

      {/* Maintenance Details Modal */}
      {selectedItem && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Maintenance Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this maintenance request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Item Information */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  Item Information
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
              
              {/* Maintenance Information */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Wrench className="mr-2 h-4 w-4" />
                  Maintenance Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance Type</p>
                    <p className="font-medium capitalize">{selectedItem.maintenanceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <MaintenanceStatusBadge status={selectedItem.status} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <MaintenancePriorityBadge priority={selectedItem.priority} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reported Date</p>
                    <p className="font-medium">{selectedItem.reportedDate}</p>
                  </div>
                  {selectedItem.scheduledDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Scheduled Date</p>
                      <p className="font-medium">{selectedItem.scheduledDate}</p>
                    </div>
                  )}
                  {selectedItem.completedDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Date</p>
                      <p className="font-medium">{selectedItem.completedDate}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Reported By</p>
                    <p className="font-medium">{selectedItem.reportedBy}</p>
                  </div>
                  {selectedItem.assignedTo && (
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{selectedItem.assignedTo}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{selectedItem.description}</p>
                </div>
                
                {selectedItem.notes && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p>{selectedItem.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Parts Information */}
              {selectedItem.partsRequired && selectedItem.partsRequired.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
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
                <h3 className="text-lg font-medium mb-2 flex items-center">
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
            
            <DialogFooter className="gap-2 sm:justify-between sm:gap-0">
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
              
              {selectedItem.status === 'scheduled' && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Maintenance Request Modal */}
      <Dialog open={newRequestModalOpen} onOpenChange={setNewRequestModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              New Maintenance Request
            </DialogTitle>
            <DialogDescription>
              Submit a new maintenance request for equipment
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
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
                <label className="text-sm font-medium">Requested Date</label>
                <Input type="date" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description of Issue</label>
              <Textarea placeholder="Describe the maintenance needed or issue observed" />
            </div>
            
            <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <Info className="h-4 w-4" />
              <AlertTitle>QR Code Scan</AlertTitle>
              <AlertDescription>
                You can also scan the item's QR code to automatically fill in equipment details.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNewRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitNewRequest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Request
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
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => onStartMaintenance(item)}
            >
              Start
            </Button>
          )}
          
          {item.status === 'in-progress' && (
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onCompleteMaintenance(item)}
            >
              Complete
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
}

const MaintenanceStatusBadge: React.FC<MaintenanceStatusBadgeProps> = ({ status }) => {
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
  
  return <Badge className={badgeClass}>{statusLabel}</Badge>;
};

// Priority badge component
interface MaintenancePriorityBadgeProps {
  priority: string;
}

const MaintenancePriorityBadge: React.FC<MaintenancePriorityBadgeProps> = ({ priority }) => {
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