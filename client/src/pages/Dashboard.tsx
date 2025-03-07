import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { inventory, transfers } from "@/lib/mockData";
import QuickActions from "@/components/dashboard/QuickActions";
import PendingTransfers from "@/components/dashboard/PendingTransfers";
import RecentActivity from "@/components/dashboard/RecentActivity";
import MyInventory from "@/components/dashboard/MyInventory";
import QRScannerModal from "@/components/shared/QRScannerModal";
import NotificationPanel from "@/components/modals/NotificationPanel";
import InventoryAnalytics from "@/components/reports/InventoryAnalytics";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { FileDown, Bell, QrCode } from "lucide-react";

const Dashboard: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sensitiveBadge = <Badge className="bg-red-500 text-white ml-2">Sensitive</Badge>;
  const securityClassification = "// UNCLASSIFIED //";
  const pendingTransfers = 8;

  // Generate the page actions
  const actions = (
    <div className="flex space-x-2">
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setNotificationPanelOpen(true)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
      </button>
      <button 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setScannerOpen(true)}
        aria-label="Scan QR Code"
      >
        <QrCode className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <PageWrapper>
      {/* Page Header with consistent spacing */}
      <PageHeader
        title="Dashboard"
        description={
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>Welcome back, {user?.name}. You have {pendingTransfers} pending transfer requests.</span>
            <div className="text-xs font-mono bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
              {securityClassification}
            </div>
          </div>
        }
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />

      {/* Top section with responsive grid that changes columns based on viewport */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-5 md:mb-6">
        <Card className="transition-all duration-200">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>Equipment Accountability</span>
              <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto" onClick={() => toast({ title: "Report Generated", description: "Accountability report has been generated and sent to your email." })}>
                <FileDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Export Report
              </Button>
            </CardTitle>
            <CardDescription>Current equipment status and sensitive item tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-md">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                <p className="text-xl sm:text-2xl font-bold">{inventory.length}</p>
                <p className="text-xs text-green-600 dark:text-green-400">100% Accounted</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-md">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Sensitive Items</p>
                <p className="text-xl sm:text-2xl font-bold">14</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-300 dark:bg-gray-700 h-1.5 rounded-full mr-2">
                    <div className="bg-green-500 dark:bg-green-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400">100%</span>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-md">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending Transfers</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {transfers.filter(t => t.status === 'pending').length}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Awaiting approval</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-md">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Due for Inventory</p>
                <p className="text-xl sm:text-2xl font-bold">3</p>
                <p className="text-xs text-red-600 dark:text-red-400">Due in 2 days</p>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
              <h4 className="font-medium mb-2 flex items-center text-sm sm:text-base">
                <span>Sensitive Items Accountability</span>
                {sensitiveBadge}
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span>M4A1 Carbine (Serial: 12675493)</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 w-full sm:w-auto text-center">Verified Today</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span>ACOG Scope (Serial: SC24592)</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 w-full sm:w-auto text-center">Verified Today</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span>Secure Radio (Serial: RT987265)</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 w-full sm:w-auto text-center">Verify Required</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <QuickActions openScanner={() => setScannerOpen(true)} />
      </div>

      {/* Responsive tabs that adapt to screen size */}
      <Tabs defaultValue="overview" className="mb-4 sm:mb-5 md:mb-6">
        <TabsList className="w-full sm:w-auto flex justify-between sm:justify-start">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none text-xs sm:text-sm">My Equipment</TabsTrigger>
          <TabsTrigger value="transfers" className="flex-1 sm:flex-none text-xs sm:text-sm">Transfers</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-none text-xs sm:text-sm">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mt-3 sm:mt-4">
          <div className="md:col-span-2">
            <MyInventory />
          </div>
          <div>
            <PendingTransfers />
          </div>
        </TabsContent>
        
        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Transfers</CardTitle>
              <CardDescription>Recent and pending equipment transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{transfer.name}</h4>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-1 sm:gap-2">
                        <span className="font-mono">SN: {transfer.serialNumber}</span>
                        <span className="hidden sm:inline mx-1">•</span>
                        <span>From: {transfer.from}</span>
                        <span className="hidden sm:inline mx-1">•</span>
                        <span>To: {transfer.to}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{transfer.date}</div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      {transfer.status === "pending" ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 text-xs h-8 sm:h-9"
                            onClick={() => toast({ title: "Transfer Approved", description: `Transfer of ${transfer.name} has been approved.` })}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 text-xs h-8 sm:h-9"
                            onClick={() => toast({ title: "Transfer Rejected", description: `Transfer of ${transfer.name} has been rejected.` })}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge className={
                          transfer.status === "approved" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <InventoryAnalytics inventory={inventory} transfers={transfers} />
        </TabsContent>
      </Tabs>
      
      {/* Bottom section with responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <RecentActivity />
        <Card>
          <CardHeader>
            <CardTitle>CIF Integration Status</CardTitle>
            <CardDescription>Central Issue Facility integration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <div>
                  <h4 className="font-medium">Last Synchronization</h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">03/07/2025 09:45 AM</p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 w-full sm:w-auto text-center">Successful</Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Synchronized Items</h4>
                <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <p className="font-medium">Total Items</p>
                    <p className="text-lg sm:text-xl">143</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <p className="font-medium">Added</p>
                    <p className="text-lg sm:text-xl text-green-600 dark:text-green-400">+5</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <p className="font-medium">Issues</p>
                    <p className="text-lg sm:text-xl text-yellow-600 dark:text-yellow-400">2</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                <Button 
                  variant="outline"
                  className="w-full text-xs sm:text-sm"
                  onClick={() => toast({ title: "Sync Started", description: "Synchronization with CIF has been initiated." })}
                >
                  <span className="mr-2">↻</span> Synchronize with CIF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      <QRScannerModal 
        isOpen={scannerOpen} 
        onClose={() => setScannerOpen(false)} 
      />
    </PageWrapper>
  );
};

export default Dashboard;