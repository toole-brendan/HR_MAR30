import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart,
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis,  
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  ShieldAlert, 
  Truck, 
  History, 
  User, 
  Layers, 
  Printer,
  Search,
  AlertTriangle
} from "lucide-react";
import { inventory, transfers, activities, user } from "@/lib/mockData";
import { sensitiveItems } from "@/lib/sensitiveItemsData";
import { maintenanceItems } from "@/lib/maintenanceData";

// Define mock data for reports
const inventoryByCategory = [
  { name: "Weapons", value: 24, color: "#3b82f6" },
  { name: "Communications", value: 18, color: "#10b981" },
  { name: "Medical", value: 12, color: "#ef4444" },
  { name: "Tactical", value: 36, color: "#f97316" },
  { name: "Other", value: 8, color: "#8b5cf6" },
];

const transfersData = [
  { name: "Jan", pending: 4, approved: 12, rejected: 2 },
  { name: "Feb", pending: 3, approved: 14, rejected: 1 },
  { name: "Mar", pending: 2, approved: 10, rejected: 3 },
  { name: "Apr", pending: 5, approved: 13, rejected: 2 },
  { name: "May", pending: 4, approved: 15, rejected: 1 },
  { name: "Jun", pending: 6, approved: 11, rejected: 3 },
];

const inventoryStatusData = [
  { name: "Active", value: 78, color: "#22c55e" },
  { name: "Pending", value: 14, color: "#f59e0b" },
  { name: "Transferred", value: 8, color: "#3b82f6" },
];

const sensitiveItemsVerificationData = [
  { name: "Verified", value: 45, color: "#22c55e" },
  { name: "Due", value: 12, color: "#f59e0b" },
  { name: "Overdue", value: 3, color: "#ef4444" },
];

// Mock property book status summary
const propertyBookSummary = {
  totalItems: 165,
  assignedItems: 152,
  unassignedItems: 13,
  itemsByCategory: {
    weapons: 28,
    communications: 42,
    medical: 35,
    tactical: 45,
    other: 15
  },
  complianceRate: "92%",
  verificationStatus: "86%"
};

// Mock report types
const reportTypes = [
  { id: "inventory-status", name: "Inventory Status", icon: <Layers className="h-4 w-4 mr-2" /> },
  { id: "transfer-history", name: "Transfer History", icon: <History className="h-4 w-4 mr-2" /> },
  { id: "sensitive-items", name: "Sensitive Items", icon: <ShieldAlert className="h-4 w-4 mr-2" /> },
  { id: "unit-equipment", name: "Unit Equipment", icon: <User className="h-4 w-4 mr-2" /> },
  { id: "maintenance", name: "Maintenance", icon: <Truck className="h-4 w-4 mr-2" /> }
];

// Define interfaces for reports
interface ReportType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface ReportFilter {
  dateRange: string;
  category: string;
  status: string;
}

// Reports page component
const Reports = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: "30",
    category: "all",
    status: "all"
  });
  const { toast } = useToast();
  const handleGenerateReport = (reportType: string) => {
    setSelectedReportType(reportType);
    toast({
      title: "Report generated",
      description: `${reportType} report has been generated successfully.`,
    });
  };

  const handleExportReport = (format: string) => {
    toast({
      title: "Report exported",
      description: `Report has been exported as ${format.toUpperCase()} successfully.`,
    });
  };

  const handlePrintReport = () => {
    toast({
      title: "Report sent to printer",
      description: "Report has been sent to the printer successfully.",
    });
  };

  return (
    <PageWrapper withPadding={true}>
      <PageHeader
        title="Reports & Analytics"
        description="Generate customized reports and view analytics for inventory, transfers, and equipment status"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handlePrintReport()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button 
              className="bg-[#4B5320] hover:bg-[#3a4019]"
              onClick={() => handleGenerateReport("Custom")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        }
        className="mb-4 sm:mb-5 md:mb-6"
      />
      <Tabs defaultValue="dashboard" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
              <TabsTrigger value="sensitive">Sensitive Items</TabsTrigger>
              <TabsTrigger value="custom">Custom Reports</TabsTrigger>
            </TabsList>
          </div>

          {/* Report Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{inventory.length}</div>
                    <div className="text-sm text-muted-foreground">Total Inventory Items</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{transfers.filter(t => t.status === "pending").length}</div>
                    <div className="text-sm text-muted-foreground">Pending Transfers</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{sensitiveItems.length}</div>
                    <div className="text-sm text-muted-foreground">Sensitive Items</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory by Category</CardTitle>
                  <CardDescription>Distribution of equipment across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {inventoryByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Trends</CardTitle>
                  <CardDescription>Monthly transfer activity summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transfersData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="approved" fill="#22c55e" name="Approved" />
                        <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                        <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Report Generation</CardTitle>
                  <CardDescription>Generate common reports with a single click</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportTypes.map((report) => (
                      <Button
                        key={report.id}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => handleGenerateReport(report.name)}
                      >
                        {report.icon}
                        {report.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Book Summary</CardTitle>
                  <CardDescription>Current property book status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-4">Status Summary</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Total Items</span>
                          <span className="font-medium">{propertyBookSummary.totalItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Assigned Items</span>
                          <span className="font-medium">{propertyBookSummary.assignedItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Unassigned Items</span>
                          <span className="font-medium">{propertyBookSummary.unassignedItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Compliance Rate</span>
                          <span className="font-medium text-green-500">{propertyBookSummary.complianceRate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Verification Rate</span>
                          <span className="font-medium text-amber-500">{propertyBookSummary.verificationStatus}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-4">Items By Category</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Weapons</span>
                          <span className="font-medium">{propertyBookSummary.itemsByCategory.weapons}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Communications</span>
                          <span className="font-medium">{propertyBookSummary.itemsByCategory.communications}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Medical</span>
                          <span className="font-medium">{propertyBookSummary.itemsByCategory.medical}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tactical</span>
                          <span className="font-medium">{propertyBookSummary.itemsByCategory.tactical}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Other</span>
                          <span className="font-medium">{propertyBookSummary.itemsByCategory.other}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Reports */}
          <TabsContent value="inventory">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Current status of all inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-semibold mb-4">Status Distribution</h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {inventoryStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-semibold mb-4">Category Distribution</h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={inventoryByCategory}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8">
                            {inventoryByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-4">Inventory Action Items</h4>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {maintenanceItems.filter(item => item.status === 'scheduled').length} maintenance items scheduled this week
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleExportReport('pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportReport('csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Reports */}
          <TabsContent value="transfers">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Transfer Analytics</CardTitle>
                <CardDescription>Analysis of transfer requests and status changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={transfersData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="approved" 
                        stroke="#22c55e" 
                        name="Approved" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pending" 
                        stroke="#f59e0b" 
                        name="Pending" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rejected" 
                        stroke="#ef4444" 
                        name="Rejected" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-4">Transfer Status Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {transfers.filter(t => t.status === "approved").length}
                          </div>
                          <div className="text-sm text-muted-foreground">Approved</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-500">
                            {transfers.filter(t => t.status === "pending").length}
                          </div>
                          <div className="text-sm text-muted-foreground">Pending</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">
                            {transfers.filter(t => t.status === "rejected").length}
                          </div>
                          <div className="text-sm text-muted-foreground">Rejected</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-4">Average Transfer Time</h4>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">2.4 days</div>
                        <div className="text-sm text-muted-foreground">Avg. time to approval</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleExportReport('pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportReport('csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sensitive Items Reports */}
          <TabsContent value="sensitive">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Sensitive Items Verification</CardTitle>
                <CardDescription>Current verification status of sensitive items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-semibold mb-4">Verification Status</h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sensitiveItemsVerificationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {sensitiveItemsVerificationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-semibold mb-4">Verification Schedule</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Daily Verification</span>
                        <Badge>5 items</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Weekly Verification</span>
                        <Badge>12 items</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Monthly Verification</span>
                        <Badge>28 items</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Quarterly Verification</span>
                        <Badge>15 items</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-4">Verification Alerts</h4>
                  <Alert className="bg-red-500/10 text-red-700 border-red-700/20">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      3 sensitive items are overdue for verification
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleExportReport('pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportReport('csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Reports */}
          <TabsContent value="custom">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Custom Report Generation</CardTitle>
                <CardDescription>Create customized reports based on specific criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Report Type</label>
                    <Select defaultValue="inventory">
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventory">Inventory Report</SelectItem>
                        <SelectItem value="transfers">Transfers Report</SelectItem>
                        <SelectItem value="sensitive">Sensitive Items Report</SelectItem>
                        <SelectItem value="maintenance">Maintenance Report</SelectItem>
                        <SelectItem value="property">Property Book Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Format</label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Additional Filters</label>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="transferred">Transferred</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="weapons">Weapons</SelectItem>
                          <SelectItem value="communications">Communications</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="tactical">Tactical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search by name, serial number, etc." className="pl-8" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    className="bg-[#4B5320] hover:bg-[#3a4019]"
                    onClick={() => handleGenerateReport("Custom")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
                <CardDescription>Your previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Monthly Inventory Status</div>
                        <div className="text-sm text-muted-foreground">Generated 2 days ago</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Quarterly Sensitive Items Verification</div>
                        <div className="text-sm text-muted-foreground">Generated 1 week ago</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Annual Property Book Audit</div>
                        <div className="text-sm text-muted-foreground">Generated 3 weeks ago</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageWrapper>
  );
};

export default Reports;