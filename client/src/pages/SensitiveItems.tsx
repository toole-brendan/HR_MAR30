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
import { Separator } from "@/components/ui/separator";
import QRCodeGenerator from "@/components/common/QRCodeGenerator";
import TransferRequestModal from "@/components/modals/TransferRequestModal";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  ArrowRight,
  Printer,
  History,
  BarChart3,
  Plus,
  FileText,
  CalendarClock,
  ScanLine,
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
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
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
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleStartVerification}
        className="flex items-center gap-1 uppercase tracking-wider text-xs"
      >
        <ClipboardCheck className="h-4 w-4" />
        <span className="hidden sm:inline">Start Verification</span>
      </Button>
      <Button 
        size="sm" 
        variant="default" 
        className="flex items-center gap-1 bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Item</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1.5"
        onClick={() => {
          toast({
            title: "Export Generated",
            description: "Sensitive items report has been generated"
          });
        }}
      >
        <FileText className="h-4 w-4" />
        EXPORT REPORT
      </Button>
    </div>
  );

  return (
    <PageWrapper withPadding={true}>
      {/* Header section with 8VC style formatting */}
      <div className="pt-16 pb-10">
        {/* Category label - Small all-caps category label */}
        <div className="text-xs uppercase tracking-wider mb-1 text-muted-foreground">
          SECURITY
        </div>
        
        {/* Main title - following 8VC typography */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-medium mb-1">Sensitive Items</h1>
            <p className="text-sm text-muted-foreground">Track, verify, and manage sensitive military equipment</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowQRDialog(true)}
              className="h-9 px-3 flex items-center gap-1.5 bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-md"
            >
              <ScanLine className="h-4 w-4" />
              <span className="text-xs">SCAN QR</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => setShowVerifyDialog(true)}
              className="h-9 px-3 flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 rounded-md"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span className="text-xs">VERIFY ITEMS</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-9 px-3 text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1.5"
              onClick={() => {
                toast({
                  title: "Report Generated",
                  description: "Sensitive items report has been exported"
                });
              }}
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs">EXPORT REPORT</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Status Summary Cards - in 8VC style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">
                VERIFIED TODAY
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-light tracking-tight">{sensitiveItemsStats.verifiedToday}/{sensitiveItemsStats.totalItems}</div>
            <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Last full check: {sensitiveItemsStats.lastFullVerification}</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">
                PENDING VERIFICATION
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-sm">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
            <div className="text-2xl font-light tracking-tight">{sensitiveItemsStats.pendingVerification}</div>
            <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Due: Today 1800hrs</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">
                HIGH-RISK ITEMS
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-sm">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <div className="text-2xl font-light tracking-tight">{sensitiveItemsStats.highRiskItems}</div>
            <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Verification: Twice Daily</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">
                COMPLIANCE STATUS
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
                <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-light tracking-tight">{sensitiveItemsStats.verificationCompliance}</div>
            <p className="text-xs tracking-wide text-muted-foreground mt-0.5">All items accounted for</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs 
        defaultValue="inventory" 
        value={tabValue} 
        onValueChange={setTabValue}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6 rounded-none bg-gray-50 dark:bg-white/5 h-10">
          <TabsTrigger value="inventory" className="uppercase tracking-wider text-xs font-medium rounded-none">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="categories" className="uppercase tracking-wider text-xs font-medium rounded-none">
            Categories
          </TabsTrigger>
          <TabsTrigger value="verification" className="uppercase tracking-wider text-xs font-medium rounded-none">
            Verification
          </TabsTrigger>
          <TabsTrigger value="logs" className="uppercase tracking-wider text-xs font-medium rounded-none">
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Filters Section with 8VC styling */}
          <div className="mb-6">
            <div className="text-section-header mb-4 text-muted-foreground">
              SEARCH & FILTERS
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by name or serial number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="w-full md:w-64">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none">
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
              <div className="w-full md:w-64">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none">
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
          </div>

          {/* Sensitive Items List Card with 8VC styling */}
          <Card className="overflow-hidden border border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  SENSITIVE ITEMS
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Inventory Listing
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300"
                onClick={() => {}}
              >
                PRINT INVENTORY
              </Button>
            </div>
            
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-white/5 px-4">
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
                      <div key={item.id} className="py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 rounded-none flex items-center justify-center text-white
                              ${item.category === 'weapon' ? 'bg-red-600 dark:bg-red-700' : ''}
                              ${item.category === 'communication' ? 'bg-blue-600 dark:bg-blue-700' : ''}
                              ${item.category === 'optics' ? 'bg-amber-600 dark:bg-amber-700' : ''}
                              ${item.category === 'crypto' ? 'bg-purple-600 dark:bg-purple-700' : ''}
                              ${item.category === 'other' ? 'bg-gray-600 dark:bg-gray-700' : ''}
                            `}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                <Badge className={`text-[10px] uppercase tracking-wider rounded-none ${statusColor}`}>
                                  {statusText}
                                </Badge>
                                <Badge className={`text-[10px] uppercase tracking-wider rounded-none ${securityColor}`}>
                                  {item.securityLevel}
                                </Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span className="font-mono">SN: {item.serialNumber}</span>
                                <span className="hidden sm:inline mx-2">•</span>
                                <span>Last verified: {item.lastVerified}</span>
                                <span className="hidden sm:inline mx-2">•</span>
                                <span>Next check: {item.nextVerification}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
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
            </CardContent>
            <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5">
              <div className="text-xs tracking-wide text-muted-foreground">
                Showing {filteredItems.length} of {sensitiveItems.length} items
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="mb-6">
            <div className="text-section-header mb-4 text-muted-foreground">
              CATEGORY OVERVIEW
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensitiveItemCategories.map(category => (
                <Card key={category.id} className="border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {category.name}
                      </div>
                      <div className={`p-2 rounded-sm ${
                        category.riskLevel === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
                        category.riskLevel === 'high' ? 'bg-amber-50 dark:bg-amber-900/20' :
                        category.riskLevel === 'medium' ? 'bg-blue-50 dark:bg-blue-900/20' :
                        'bg-green-50 dark:bg-green-900/20'
                      }`}>
                        <div className={`h-5 w-5 ${
                          category.riskLevel === 'critical' ? 'text-red-600 dark:text-red-500' :
                          category.riskLevel === 'high' ? 'text-amber-600 dark:text-amber-500' :
                          category.riskLevel === 'medium' ? 'text-blue-600 dark:text-blue-500' :
                          'text-green-600 dark:text-green-500'
                        }`}>
                          {category.icon === 'weapon' ? <Sword className="h-5 w-5" /> :
                           category.icon === 'communication' ? <Radio className="h-5 w-5" /> :
                           category.icon === 'optics' ? <Eye className="h-5 w-5" /> :
                           category.icon === 'crypto' ? <Key className="h-5 w-5" /> :
                           <Filter className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-light tracking-tight">{category.count}</div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs tracking-wide text-muted-foreground">Verification: {category.verificationFrequency}</p>
                      <Badge className={`text-[10px] uppercase tracking-wider rounded-none ${
                        category.riskLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        category.riskLevel === 'high' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' :
                        category.riskLevel === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {category.riskLevel} risk
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <Card className="overflow-hidden border border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  VERIFICATION SCHEDULE
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Upcoming Checks
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300"
                onClick={handleStartVerification}
              >
                START VERIFICATION
              </Button>
            </div>
            
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-white/5 px-4">
                {verificationSchedule.map((schedule, index) => (
                  <div key={index} className="py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center">
                        <div className={`mr-3 p-2 rounded-sm ${
                          schedule.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' :
                          schedule.status === 'in-progress' ? 'bg-blue-50 dark:bg-blue-900/20' :
                          schedule.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' :
                          'bg-amber-50 dark:bg-amber-900/20'
                        }`}>
                          {schedule.status === 'completed' ? 
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" /> :
                            schedule.status === 'in-progress' ? 
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-500" /> :
                            schedule.status === 'overdue' ? 
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" /> :
                            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                          }
                        </div>
                        <div>
                          <div className="font-medium text-sm">{schedule.description}</div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>{schedule.date}</span>
                            <span className="mx-2">•</span>
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{schedule.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] uppercase tracking-wider rounded-none ${
                          schedule.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          schedule.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          schedule.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}>
                          {schedule.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={schedule.status === 'completed'}
                        >
                          {schedule.status === 'completed' ? 'Verified' : 'Start Check'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="overflow-hidden border border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  ACTIVITY LOGS
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Recent Verifications
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300"
                onClick={() => {}}
              >
                EXPORT LOGS
              </Button>
            </div>
            
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-white/5">
                  <TableRow className="border-b border-gray-100 dark:border-white/5 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium w-3/12">Item</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium w-2/12">Date / Time</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium w-2/12">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium w-2/12">Verified By</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium w-3/12">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verificationLogs.slice(0, 5).map(log => {
                    // Find the item for this log
                    const item = sensitiveItems.find(i => i.id === log.itemId);
                    
                    return (
                      <TableRow key={log.id} className="border-b border-gray-100 dark:border-white/5">
                        <TableCell className="text-sm">
                          {item ? (
                            <div className="flex items-center">
                              <div className="font-medium">{item.name}</div>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {item.serialNumber}
                              </span>
                            </div>
                          ) : 'Unknown Item'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span>{log.date}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{log.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] uppercase tracking-wider rounded-none ${
                            log.status === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            log.status === 'missing' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.verifiedBy}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          {log.notes || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between py-2 px-4 border-t border-gray-100 dark:border-white/5">
              <div className="text-xs tracking-wide text-muted-foreground">
                Showing 5 of {verificationLogs.length} logs
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1"
              >
                VIEW ALL LOGS
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Item Details Modal */}
      {selectedItem && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
              <DialogDescription>
                View detailed information about this sensitive item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium text-right text-sm">Name:</div>
                <div className="col-span-3 text-sm">{selectedItem.name}</div>
                
                <div className="font-medium text-right text-sm">Serial Number:</div>
                <div className="col-span-3 font-mono text-sm">{selectedItem.serialNumber}</div>
                
                <div className="font-medium text-right text-sm">Category:</div>
                <div className="col-span-3 text-sm capitalize">{selectedItem.category}</div>
                
                <div className="font-medium text-right text-sm">Security Level:</div>
                <div className="col-span-3 text-sm uppercase">{selectedItem.securityLevel}</div>
                
                <div className="font-medium text-right text-sm">Status:</div>
                <div className="col-span-3 text-sm capitalize">{selectedItem.status}</div>
                
                <div className="font-medium text-right text-sm">Assigned To:</div>
                <div className="col-span-3 text-sm">{selectedItem.assignedTo}</div>
                
                <div className="font-medium text-right text-sm">Location:</div>
                <div className="col-span-3 text-sm">{selectedItem.location}</div>
                
                <div className="font-medium text-right text-sm">Assigned Date:</div>
                <div className="col-span-3 text-sm">{selectedItem.assignedDate}</div>
                
                <div className="font-medium text-right text-sm">Last Verified:</div>
                <div className="col-span-3 text-sm">{selectedItem.lastVerified}</div>
                
                <div className="font-medium text-right text-sm">Next Verification:</div>
                <div className="col-span-3 text-sm">{selectedItem.nextVerification}</div>
                
                <div className="font-medium text-right text-sm">Notes:</div>
                <div className="col-span-3 text-sm">{selectedItem.notes || "No notes available."}</div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                className="flex items-center gap-1 mr-2"
                onClick={() => handleVerifyItem(selectedItem)}
              >
                <CheckCircle className="h-4 w-4" />
                Verify Item
              </Button>
              <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Verification started modal would go here */}
      
    </PageWrapper>
  );
};

export default SensitiveItems;