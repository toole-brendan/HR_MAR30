import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { 
  Calendar,
  Clock,
  AlertTriangle,
  Shield,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  ArrowRightLeft,
  BarChart3,
  Users,
  CheckCircle,
  Clock8,
  Database,
  QrCode,
  Send,
  FileText,
  Fingerprint,
  Search,
  Filter,
  Plus,
  Activity,
  Package
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { PageHeader } from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';
import QRScannerModal from '@/components/shared/QRScannerModal';

// Dashboard components
import MyInventory from '@/components/dashboard/MyInventory';
import PendingTransfers from '@/components/dashboard/PendingTransfers';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransferItem } from '@/components/dashboard/TransferItem';
import { ActivityLogItem } from '@/components/dashboard/ActivityLogItem';

// Mock data imports
import { sensitiveItems, sensitiveItemsStats } from '@/lib/sensitiveItemsData';
import { activities, notifications, transfers, inventory } from '@/lib/mockData';
import { maintenanceStats } from '@/lib/maintenanceData';

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);

  // Alert counts
  const pendingTransfersCount = transfers.filter(t => t.status === 'pending').length;
  const pendingMaintenanceCount = maintenanceStats.scheduled;
  const sensitiveItemVerifications = sensitiveItemsStats.pendingVerification;
  
  // Calculate verification percentage
  const verificationPercentage = Math.round((sensitiveItemsStats.verifiedToday / sensitiveItemsStats.totalItems) * 100);

  // Page actions
  const actions = (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setShowQRScannerModal(true)}
        className="flex items-center gap-1"
      >
        <QrCode className="h-4 w-4" />
        <span className="hidden sm:inline">Scan QR</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="default" 
        onClick={() => navigate('/transfers')}
        className="flex items-center gap-1 bg-venture-purple hover:bg-venture-purple/90"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">New Transfer</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => navigate('/reports')}
        className="flex items-center gap-1"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Reports</span>
      </Button>
    </div>
  );

  return (
    <PageWrapper withPadding={true}>
      <PageHeader
        title={`Welcome, CPT Rodriguez`}
        description="HandReceipt Dashboard"
        actions={actions}
        className="mb-6 sm:mb-7 md:mb-8"
      />
      
      {/* Summary Stats & Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Inventory"
          value={inventory.length}
          icon={<Package size={20} className="text-blue-500" />}
          change={{
            value: 3.2,
            label: "from last month",
            direction: "up"
          }}
        />

        <StatCard 
          title="Pending Transfers"
          value={pendingTransfersCount}
          icon={<ArrowRightLeft size={20} className="text-purple-500" />}
          change={{
            value: 8.1,
            label: "from last week",
            direction: "down"
          }}
        />

        <StatCard 
          title="Sensitive Items Verified"
          value={`${sensitiveItemsStats.verifiedToday}/${sensitiveItemsStats.totalItems}`}
          icon={<Shield size={20} className="text-green-500" />}
          change={{
            value: 12.4,
            label: "verification rate",
            direction: "up"
          }}
        />

        <StatCard 
          title="Items Needing Maintenance"
          value={pendingMaintenanceCount}
          icon={<AlertTriangle size={20} className="text-amber-500" />}
          change={{
            value: 2.3,
            label: "from last week",
            direction: "down"
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-5 flex items-center tracking-tight">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Quick Actions
        </h3>
        <QuickActions openScanner={() => setShowQRScannerModal(true)} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Pending Transfers */}
          <PendingTransfers />
          
          {/* Inventory Items */}
          <div className="mb-6">
            <MyInventory />
          </div>
          
          {/* Stats Tabs */}
          <Card className="mb-6 overflow-hidden border border-border dashboard-card">
            <CardHeader className="bg-muted/40 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl tracking-tight">Equipment Status</CardTitle>
              </div>
              <CardDescription className="tracking-wide text-xs">Overview of equipment readiness and verification</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-3 w-full rounded-none bg-muted/70">
                  <TabsTrigger value="overview" className="uppercase tracking-wider text-xs font-medium">Overview</TabsTrigger>
                  <TabsTrigger value="readiness" className="uppercase tracking-wider text-xs font-medium">Readiness</TabsTrigger>
                  <TabsTrigger value="verification" className="uppercase tracking-wider text-xs font-medium">Verification</TabsTrigger>
                </TabsList>
                
                <div className="p-4">
                  <TabsContent value="overview" className="m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-muted/20 p-4 rounded-sm">
                        <h4 className="text-sm font-medium text-muted-foreground tracking-wide mb-2">Pending Actions</h4>
                        <div className="text-2xl font-medium">{pendingTransfersCount + pendingMaintenanceCount + sensitiveItemVerifications}</div>
                        <p className="text-xs tracking-wide text-muted-foreground">Across all categories</p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-sm">
                        <h4 className="text-sm font-medium text-muted-foreground tracking-wide mb-2">Transfer Rate</h4>
                        <div className="text-2xl font-medium">8.5/day</div>
                        <p className="text-xs tracking-wide text-muted-foreground">Last 7 days average</p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-sm">
                        <h4 className="text-sm font-medium text-muted-foreground tracking-wide mb-2">QR Scans</h4>
                        <div className="text-2xl font-medium">32</div>
                        <p className="text-xs tracking-wide text-muted-foreground">Last 24 hours</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="readiness" className="m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm tracking-wide">Operational</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">92%</span>
                          <Progress value={92} className="w-32 h-2" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock8 className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="text-sm tracking-wide">In Maintenance</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">5%</span>
                          <Progress value={5} className="w-32 h-2" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          <span className="text-sm tracking-wide">Non-operational</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">3%</span>
                          <Progress value={3} className="w-32 h-2" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="verification" className="m-0">
                    <div className="space-y-4 data-table-military">
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span className="tracking-wide">Today - Morning Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="font-medium">0600</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30 uppercase text-[10px] tracking-wider font-medium">
                          Completed
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span className="tracking-wide">Today - Evening Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="font-medium">1800</span>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 uppercase text-[10px] tracking-wider font-medium">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span className="tracking-wide">Tomorrow - Morning Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="font-medium">0600</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 uppercase text-[10px] tracking-wider font-medium">
                          Scheduled
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-muted/10 py-3">
              <Button 
                variant="ghost" 
                className="w-full text-xs uppercase tracking-wider flex items-center justify-center"
                onClick={() => navigate("/reports")}
              >
                View Detailed Reports
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Column - Recent Activity & Notifications */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <RecentActivity />
          
          {/* QR Management Summary */}
          <Card className="overflow-hidden border border-border dashboard-card">
            <CardHeader className="bg-muted/40 pb-2">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl tracking-tight">QR Management</CardTitle>
              </div>
              <CardDescription className="tracking-wide text-xs">Barcode and QR code status</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="tracking-wide">Total QR Codes</span>
                  <span className="font-medium">{inventory.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="tracking-wide">Needs Reprinting</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 uppercase text-[10px] tracking-wider font-medium">2</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="tracking-wide">Recently Generated</span>
                  <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30 uppercase text-[10px] tracking-wider font-medium">5</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 py-3">
              <Button 
                variant="ghost" 
                className="w-full text-xs uppercase tracking-wider flex items-center justify-center"
                onClick={() => navigate('/qr-management')}
              >
                Manage QR Codes
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Notifications Preview */}
          <Card className="overflow-hidden border border-border dashboard-card">
            <CardHeader className="bg-muted/40 pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl tracking-tight">Team Activity</CardTitle>
              </div>
              <CardDescription className="tracking-wide text-xs">Recent notifications and updates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="p-4 hover:bg-muted/10">
                    <div className="flex items-start">
                      <div className={`h-8 w-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mr-3 ${
                        notification.type === 'transfer-request' ? 'text-amber-500' : 
                        notification.type === 'transfer-approved' ? 'text-green-500' : 
                        'text-blue-500'
                      }`}>
                        {notification.type === 'transfer-request' ? <Send className="h-4 w-4" /> :
                         notification.type === 'transfer-approved' ? <CheckCircle className="h-4 w-4" /> :
                         <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{notification.timeAgo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 py-3">
              <Button 
                variant="ghost" 
                className="w-full text-xs uppercase tracking-wider flex items-center justify-center" 
                onClick={() => navigate('/audit-log')}
              >
                View All Activity
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* QR Scanner Modal */}
      {showQRScannerModal && (
        <QRScannerModal 
          isOpen={showQRScannerModal} 
          onClose={() => setShowQRScannerModal(false)}
          onScan={(code) => {
            console.log("QR Code scanned:", code);
            setShowQRScannerModal(false);
          }}
        />
      )}
    </PageWrapper>
  );
}