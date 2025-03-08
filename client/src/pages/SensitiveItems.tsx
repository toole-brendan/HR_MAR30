import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { PageWrapper } from "@/components/ui/page-wrapper";
import QRCodeGenerator from "@/components/common/QRCodeGenerator";
import TransferRequestModal from "@/components/modals/TransferRequestModal";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";

import { 
  Search, 
  Filter, 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  Radio, 
  Eye, 
  Key, 
  Calendar, 
  Clock12, 
  ArrowUpRight,
  Printer,
  History,
  BarChart3,
  Plus,
  FileText,
  CalendarClock,
  Info,
  Sword,
} from "lucide-react";

import { 
  sensitiveItems, 
  sensitiveItemCategories, 
  verificationLogs, 
  verificationSchedule,
  sensitiveItemsStats,
  SensitiveItem,
  VerificationLog 
} from "@/lib/sensitiveItemsData";

const SensitiveItems: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<SensitiveItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState("inventory");
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Filter sensitive items based on search term and filters
  const filteredItems = sensitiveItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get verification logs for a specific item
  const getItemVerificationLogs = (itemId: string): VerificationLog[] => {
    return verificationLogs.filter(log => log.itemId === itemId);
  };

  // Handler for opening verification modal
  const handleStartVerification = () => {
    setVerificationModalOpen(true);
    toast({
      title: "Verification Mode",
      description: "Ready to scan QR codes for verification.",
    });
  };

  // Handler for marking an item as verified
  const handleVerifyItem = (item: SensitiveItem) => {
    toast({
      title: "Item Verified",
      description: `${item.name} (SN: ${item.serialNumber}) has been verified.`,
      variant: "default",
    });
  };

  // Handler for viewing item details
  const handleViewDetails = (item: SensitiveItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  // Page actions
  const actions = (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        className="flex items-center gap-1 bg-green-700 hover:bg-green-800"
        onClick={handleStartVerification}
      >
        <ClipboardCheck className="h-4 w-4" />
        <span className={isMobile ? "" : "hidden sm:inline"}>Start Verification</span>
      </Button>
      <Button 
        size="sm" 
        className="flex items-center gap-1 bg-[#3B5BDB] hover:bg-[#364FC7]"
      >
        <Plus className="h-4 w-4" />
        <span className={isMobile ? "" : "hidden sm:inline"}>Add Item</span>
      </Button>
    </div>
  );

  return (
    <PageWrapper withPadding={true}>
      <PageHeader
        title="Sensitive Items"
        description="Track, verify, and manage sensitive military equipment"
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-400">Verified Today</p>
              <p className="text-2xl font-bold">{sensitiveItemsStats.verifiedToday}/{sensitiveItemsStats.totalItems}</p>
              <p className="text-xs text-green-600 dark:text-green-500">Last: {sensitiveItemsStats.lastFullVerification}</p>
            </div>
            <div className="bg-green-200 dark:bg-green-700/30 p-3 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Pending Verification</p>
              <p className="text-2xl font-bold">{sensitiveItemsStats.pendingVerification}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500">Due: Today 1800hrs</p>
            </div>
            <div className="bg-amber-200 dark:bg-amber-700/30 p-3 rounded-full">
              <Clock className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-400">High-Risk Items</p>
              <p className="text-2xl font-bold">{sensitiveItemsStats.highRiskItems}</p>
              <p className="text-xs text-red-600 dark:text-red-500">Verification: Twice Daily</p>
            </div>
            <div className="bg-red-200 dark:bg-red-700/30 p-3 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Compliance Status</p>
              <p className="text-2xl font-bold">{sensitiveItemsStats.verificationCompliance}</p>
              <p className="text-xs text-blue-600 dark:text-blue-500">All items accounted for</p>
            </div>
            <div className="bg-blue-200 dark:bg-blue-700/30 p-3 rounded-full">
              <ShieldAlert className="h-5 w-5 text-blue-700 dark:text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs 
        defaultValue="inventory" 
        value={tabValue} 
        onValueChange={setTabValue}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-1 md:grid-cols-4 h-auto">
          <TabsTrigger value="inventory" className="py-2 data-[state=active]:bg-primary/10">
            <Filter className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="categories" className="py-2 data-[state=active]:bg-primary/10">
            <BarChart3 className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="verification" className="py-2 data-[state=active]:bg-primary/10">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="logs" className="py-2 data-[state=active]:bg-primary/10">
            <History className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensitive Items Inventory</CardTitle>
              <CardDescription>
                Track and manage items requiring special accountability procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by name or serial number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="weapon">Weapons</SelectItem>
                      <SelectItem value="communication">Communications</SelectItem>
                      <SelectItem value="optics">Optical Systems</SelectItem>
                      <SelectItem value="crypto">Cryptographic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="maintenance">In Maintenance</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-1 divide-y">
                  {filteredItems.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 dark:text-gray-400">No items found</div>
                  ) : (
                    filteredItems.map((item) => {
                      // Define icon based on category
                      let CategoryIcon = Filter;
                      switch (item.category) {
                        case 'weapon': CategoryIcon = Sword; break;
                        case 'communication': CategoryIcon = Radio; break;
                        case 'optics': CategoryIcon = Eye; break;
                        case 'crypto': CategoryIcon = Key; break;
                        default: CategoryIcon = Filter;
                      }

                      // Define status color and text
                      let statusColor = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
                      let statusText = "Active";
                      
                      switch (item.status) {
                        case 'pending':
                          statusColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
                          statusText = "Pending";
                          break;
                        case 'maintenance':
                          statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
                          statusText = "Maintenance";
                          break;
                        case 'transferred':
                          statusColor = "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
                          statusText = "Transferred";
                          break;
                      }

                      // Define security level color
                      let securityColor = "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
                      switch (item.securityLevel) {
                        case 'routine':
                          securityColor = "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
                          break;
                        case 'controlled':
                          securityColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
                          break;
                        case 'classified':
                          securityColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
                          break;
                        case 'secret':
                          securityColor = "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
                          break;
                        case 'top-secret':
                          securityColor = "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
                          break;
                      }

                      return (
                        <div key={item.id} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white
                                ${item.category === 'weapon' ? 'bg-red-700 dark:bg-red-800' : ''}
                                ${item.category === 'communication' ? 'bg-blue-700 dark:bg-blue-800' : ''}
                                ${item.category === 'optics' ? 'bg-amber-700 dark:bg-amber-800' : ''}
                                ${item.category === 'crypto' ? 'bg-purple-700 dark:bg-purple-800' : ''}
                                ${item.category === 'other' ? 'bg-gray-700 dark:bg-gray-800' : ''}
                              `}>
                                <CategoryIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <Badge className={statusColor}>{statusText}</Badge>
                                  <Badge className={securityColor}>{item.securityLevel.toUpperCase()}</Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 dark:text-gray-400 mt-1 gap-x-2">
                                  <span className="font-mono">SN: {item.serialNumber}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>Location: {item.location}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>Last Verified: {item.lastVerified}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleVerifyItem(item)}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Verify</span>
                              </Button>
                              <QRCodeGenerator 
                                itemName={item.name} 
                                serialNumber={item.serialNumber}
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(item)}
                                className="flex items-center gap-1"
                              >
                                <Info className="h-4 w-4" />
                                <span>Details</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredItems.length} of {sensitiveItems.length} items
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Printer className="h-4 w-4" />
                <span>Print Inventory</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensitive Item Categories</CardTitle>
              <CardDescription>
                View and manage different categories of sensitive items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sensitiveItemCategories.map(category => {
                  // Define icon based on category
                  let CategoryIcon = Filter;
                  switch (category.icon) {
                    case 'gun': CategoryIcon = Sword; break;
                    case 'radio': CategoryIcon = Radio; break;
                    case 'eye': CategoryIcon = Eye; break;
                    case 'key': CategoryIcon = Key; break;
                    default: CategoryIcon = Filter;
                  }

                  // Define risk level color
                  let riskColor = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
                  switch (category.riskLevel) {
                    case 'low':
                      riskColor = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
                      break;
                    case 'medium':
                      riskColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
                      break;
                    case 'high':
                      riskColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
                      break;
                    case 'critical':
                      riskColor = "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
                      break;
                  }

                  return (
                    <Card key={category.id} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white
                            ${category.icon === 'gun' ? 'bg-red-700 dark:bg-red-800' : ''}
                            ${category.icon === 'radio' ? 'bg-blue-700 dark:bg-blue-800' : ''}
                            ${category.icon === 'eye' ? 'bg-amber-700 dark:bg-amber-800' : ''}
                            ${category.icon === 'key' ? 'bg-purple-700 dark:bg-purple-800' : ''}
                          `}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{category.name}</h4>
                              <Badge className={riskColor}>{category.riskLevel.toUpperCase()} RISK</Badge>
                            </div>
                            <div className="grid grid-cols-2 mt-2 gap-y-1 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Items: </span>
                                <span className="font-medium">{category.count}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Verification: </span>
                                <span className="font-medium">{category.verificationFrequency}</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-3 text-xs flex items-center gap-1"
                              onClick={() => {
                                setFilterCategory(category.icon === 'gun' ? 'weapon' : 
                                                 category.icon === 'radio' ? 'communication' :
                                                 category.icon === 'eye' ? 'optics' :
                                                 category.icon === 'key' ? 'crypto' : 'other');
                                setTabValue("inventory");
                              }}
                            >
                              <span>View Items</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6">
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Verification Requirements</AlertTitle>
                  <AlertDescription className="text-sm">
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>All weapons must be verified twice daily (0600 and 1800)</li>
                      <li>Cryptographic equipment requires two-person verification</li>
                      <li>All sensitive items must be secured in approved storage when not in use</li>
                      <li>Report any missing or damaged items immediately to your commander</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensitive Items Verification</CardTitle>
              <CardDescription>
                Schedule and perform regular verification of sensitive items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Verification Schedule
                  </h3>
                  <div className="space-y-2">
                    {verificationSchedule.map((schedule, index) => (
                      <div 
                        key={index} 
                        className="border rounded-md p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{schedule.date}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {schedule.time} - {schedule.itemsToVerify} items
                          </p>
                        </div>
                        <div>
                          {schedule.status === "pending" ? (
                            <Button 
                              size="sm" 
                              className="bg-amber-600 hover:bg-amber-700"
                              onClick={handleStartVerification}
                            >
                              Start Now
                            </Button>
                          ) : schedule.status === "scheduled" ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              Scheduled
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Today's Progress
                  </h3>
                  <Card className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Morning Verification (0600)</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Completed
                        </Badge>
                      </div>
                      <Progress value={100} className="h-2 mb-4" />
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Evening Verification (1800)</span>
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                          Pending
                        </Badge>
                      </div>
                      <Progress value={0} className="h-2 mb-4" />
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 mt-2">
                        <h4 className="font-medium mb-2">Quick Stats</h4>
                        <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Last verified:</p>
                            <p className="font-medium">{sensitiveItemsStats.lastFullVerification}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Compliance:</p>
                            <p className="font-medium">{sensitiveItemsStats.verificationCompliance}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Pending:</p>
                            <p className="font-medium">{sensitiveItemsStats.pendingVerification} items</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Next due:</p>
                            <p className="font-medium">Today 1800hrs</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4">
                    <Button 
                      className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800"
                      onClick={handleStartVerification}
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Start Verification Process
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Reminder</AlertTitle>
                  <AlertDescription className="text-sm">
                    All sensitive items must be verified before and after duty hours. 
                    Use the Hand Receipt QR code scanner to quickly verify items.
                    Report any discrepancies to your commander immediately.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
              <CardDescription>
                Complete record of all sensitive items verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-1 divide-y">
                  {verificationLogs.slice(0, 5).map((log) => {
                    const matchingItem = sensitiveItems.find(item => item.id === log.itemId);
                    const statusColor = log.status === "verified" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                      : log.status === "missing" 
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";

                    return (
                      <div key={log.id} className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{matchingItem?.name || "Unknown Item"}</h4>
                              <Badge className={statusColor}>
                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span className="font-mono">SN: {matchingItem?.serialNumber || "N/A"}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{log.date} {log.time}hrs</span>
                              <span className="hidden sm:inline">•</span>
                              <span>By: {log.verifiedBy}</span>
                            </div>
                            {log.notes && (
                              <p className="text-xs italic mt-1">{log.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Log
                </Button>
                <Button variant="outline" size="sm">
                  View All Records
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Modal */}
      {verificationModalOpen && (
        <Dialog open={verificationModalOpen} onOpenChange={setVerificationModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sensitive Items Verification</DialogTitle>
              <DialogDescription>
                Scan QR codes to verify sensitive items
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-10 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Waiting for QR scan...</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Please scan the QR code on the item</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Verification Progress</h4>
                <div className="flex justify-between text-xs mb-1">
                  <span>9 of 10 items verified</span>
                  <span>90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>Recently verified:</p>
                <ul className="mt-1 space-y-1">
                  <li className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" /> M4A1 Carbine (M4-87654321)
                  </li>
                  <li className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" /> M9 Pistol (M9-12345678)
                  </li>
                  <li className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" /> AN/PRC-152 Radio (PRC-98765432)
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex flex-row justify-between">
              <Button 
                variant="destructive" 
                onClick={() => setVerificationModalOpen(false)}
                className="flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setVerificationModalOpen(false);
                  toast({
                    title: "Verification Paused",
                    description: "Your progress has been saved. Continue later.",
                  });
                }}
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Complete Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sensitive Item Details</DialogTitle>
              <DialogDescription>
                Detailed information about this sensitive item
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="border-b pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg">{selectedItem.name}</h3>
                  <Badge className={
                    selectedItem.securityLevel === 'top-secret' ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" :
                    selectedItem.securityLevel === 'secret' ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" :
                    selectedItem.securityLevel === 'classified' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" :
                    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  }>
                    {selectedItem.securityLevel.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm font-mono">SN: {selectedItem.serialNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Category</p>
                  <p className="capitalize">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className="capitalize">{selectedItem.status}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Assigned Date</p>
                  <p>{selectedItem.assignedDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Verified</p>
                  <p>{selectedItem.lastVerified}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Next Verification</p>
                  <p>{selectedItem.nextVerification}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Location</p>
                  <p>{selectedItem.location}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Assigned To</p>
                  <p>{selectedItem.assignedTo}</p>
                </div>
              </div>
              {selectedItem.notes && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Notes</p>
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              )}
              <div className="border-t pt-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Verification History</p>
                <div className="mt-1 max-h-32 overflow-y-auto">
                  {getItemVerificationLogs(selectedItem.id).map((log, index) => (
                    <div key={index} className="text-xs flex items-center gap-1 mb-1">
                      {log.status === 'verified' ? (
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : log.status === 'missing' ? (
                        <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      )}
                      <span>{log.date} {log.time}hrs - By {log.verifiedBy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </Button>
              <div className="flex gap-2">
                <QRCodeGenerator 
                  itemName={selectedItem.name} 
                  serialNumber={selectedItem.serialNumber}
                />
                <Button 
                  onClick={() => {
                    handleVerifyItem(selectedItem);
                    setDetailsModalOpen(false);
                  }}
                  className="flex items-center gap-1 bg-green-700 hover:bg-green-800"
                >
                  <CheckCircle className="h-4 w-4" />
                  Verify Item
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default SensitiveItems;