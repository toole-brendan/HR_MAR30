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
import QRScannerModal from "@/components/modals/QRScannerModal";
import NotificationPanel from "@/components/modals/NotificationPanel";
import InventoryAnalytics from "@/components/reports/InventoryAnalytics";
import { useAuth } from "@/context/AuthContext";

const Dashboard: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sensitiveBadge = <Badge className="bg-red-500 text-white ml-2">Sensitive</Badge>;
  const securityClassification = "// UNCLASSIFIED //";
  const pendingTransfers = 8;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-[#1C2541]">Dashboard</h2>
            <div className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
              {securityClassification}
            </div>
          </div>
          <p className="text-gray-600">Welcome back, {user?.name}. You have {pendingTransfers} pending transfer requests.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="relative p-2 rounded-full hover:bg-gray-100"
            onClick={() => setNotificationPanelOpen(true)}
            aria-label="Notifications"
          >
            <i className="fas fa-bell text-[#1C2541]"></i>
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              3
            </span>
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setScannerOpen(true)}
            aria-label="Scan QR Code"
          >
            <i className="fas fa-qrcode text-[#1C2541]"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Equipment Accountability</span>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Report Generated", description: "Accountability report has been generated and sent to your email." })}>
                <i className="fas fa-file-export mr-1"></i> Export Report
              </Button>
            </CardTitle>
            <CardDescription>Current equipment status and sensitive item tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
                <p className="text-xs text-green-600">100% Accounted</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-500">Sensitive Items</p>
                <p className="text-2xl font-bold">14</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-300 h-1.5 rounded-full mr-2">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-xs text-green-600">100%</span>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-500">Pending Transfers</p>
                <p className="text-2xl font-bold">
                  {transfers.filter(t => t.status === 'pending').length}
                </p>
                <p className="text-xs text-yellow-600">Awaiting approval</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-500">Due for Inventory</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-red-600">Due in 2 days</p>
              </div>
            </div>
            
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center">
                <span>Sensitive Items Accountability</span>
                {sensitiveBadge}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>M4A1 Carbine (Serial: 12675493)</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Verified Today</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>ACOG Scope (Serial: SC24592)</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Verified Today</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Secure Radio (Serial: RT987265)</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Verify Required</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <QuickActions openScanner={() => setScannerOpen(true)} />
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">My Equipment</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2">
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
              <div className="divide-y">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{transfer.name}</h4>
                      <div className="text-sm text-gray-500">
                        <span className="font-mono">SN: {transfer.serialNumber}</span>
                        <span className="mx-2">•</span>
                        <span>From: {transfer.from}</span>
                        <span className="mx-2">•</span>
                        <span>To: {transfer.to}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{transfer.date}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {transfer.status === "pending" ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                            onClick={() => toast({ title: "Transfer Approved", description: `Transfer of ${transfer.name} has been approved.` })}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                            onClick={() => toast({ title: "Transfer Rejected", description: `Transfer of ${transfer.name} has been rejected.` })}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge className={
                          transfer.status === "approved" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-red-100 text-red-800 hover:bg-red-100"
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <Card>
          <CardHeader>
            <CardTitle>CIF Integration Status</CardTitle>
            <CardDescription>Central Issue Facility integration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Last Synchronization</h4>
                  <p className="text-sm text-gray-500">03/07/2025 09:45 AM</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Successful</Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Synchronized Items</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-gray-100 p-2 rounded">
                    <p className="font-medium">Total Items</p>
                    <p className="text-xl">143</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <p className="font-medium">Added</p>
                    <p className="text-xl text-green-600">+5</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <p className="font-medium">Issues</p>
                    <p className="text-xl text-yellow-600">2</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => toast({ title: "Sync Started", description: "Synchronization with CIF has been initiated." })}
                >
                  <i className="fas fa-sync-alt mr-2"></i> Synchronize with CIF
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
    </>
  );
};

export default Dashboard;
