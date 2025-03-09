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
        className="flex items-center gap-1 uppercase tracking-wider text-xs"
      >
        <QrCode className="h-4 w-4" />
        <span className="hidden sm:inline">Scan QR</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="default" 
        onClick={() => navigate('/transfers')}
        className="flex items-center gap-1 bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">New Transfer</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => navigate('/reports')}
        className="flex items-center gap-1 uppercase tracking-wider text-xs"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Reports</span>
      </Button>
    </div>
  );

  return (
    <PageWrapper withPadding={true}>
      {/* Header section with 8VC style formatting */}
      <div className="mb-6 sm:mb-7 md:mb-8">
        {/* Category label - Small all-caps category label */}
        <div className="text-category-tag mb-1 text-muted-foreground">
          DASHBOARD
        </div>
        
        {/* Main title - following 8VC typography */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-1">Welcome, CPT Rodriguez</h1>
            <p className="text-subtitle text-muted-foreground">HandReceipt Supply Chain System</p>
          </div>
          {actions}
        </div>
        
        {/* Subtle horizontal divider */}
        <Separator className="mt-6" />
      </div>
      
      {/* Summary Stats - Metric cards with 8VC styling */}
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
          icon={<ArrowRightLeft size={20} className="text-primary" />}
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

      {/* Quick Actions with 8VC styled header */}
      <div className="mb-8">
        <div className="text-section-header mb-4 text-muted-foreground">
          QUICK ACTIONS
        </div>
        <QuickActions openScanner={() => setShowQRScannerModal(true)} />
      </div>

      {/* Main Content Grid with 8VC split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Pending Transfers */}
          <PendingTransfers />
          
          {/* Inventory Items */}
          <div className="mb-6">
            <MyInventory />
          </div>
          
          {/* Stats Tabs */}
          <Card className="mb-6 overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  EQUIPMENT STATUS
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Readiness and verification
                </div>
              </div>
            </div>
            
            <CardContent className="p-0">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-3 w-full rounded-none bg-gray-50 dark:bg-white/5 h-8">
                  <TabsTrigger value="overview" className="uppercase tracking-wider text-[10px] font-medium">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="readiness" className="uppercase tracking-wider text-[10px] font-medium">READINESS</TabsTrigger>
                  <TabsTrigger value="verification" className="uppercase tracking-wider text-[10px] font-medium">VERIFICATION</TabsTrigger>
                </TabsList>
                
                <div className="p-3">
                  <TabsContent value="overview" className="m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 border border-gray-100 dark:border-white/5 bg-white dark:bg-black">
                        <h4 className="text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">PENDING ACTIONS</h4>
                        <div className="text-2xl font-light tracking-tight">{pendingTransfersCount + pendingMaintenanceCount + sensitiveItemVerifications}</div>
                        <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Across all categories</p>
                      </div>
                      <div className="p-3 border border-gray-100 dark:border-white/5 bg-white dark:bg-black">
                        <h4 className="text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">TRANSFER RATE</h4>
                        <div className="text-2xl font-light tracking-tight">8.5/day</div>
                        <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Last 7 days average</p>
                      </div>
                      <div className="p-3 border border-gray-100 dark:border-white/5 bg-white dark:bg-black">
                        <h4 className="text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">QR SCANS</h4>
                        <div className="text-2xl font-light tracking-tight">32</div>
                        <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Last 24 hours</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="readiness" className="m-0">
                    <div className="space-y-3">
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
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span className="tracking-wide text-sm">Today - Morning Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="font-medium text-sm">0600</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30 uppercase text-[10px] tracking-wider font-medium rounded-none">
                          Completed
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span className="tracking-wide text-sm">Today - Evening Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="font-medium text-sm">1800</span>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 uppercase text-[10px] tracking-wider font-medium rounded-none">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span className="tracking-wide text-sm">Tomorrow - Morning Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="font-medium text-sm">0600</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 uppercase text-[10px] tracking-wider font-medium rounded-none">
                          Scheduled
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
            <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5 flex justify-end">
              <Button 
                variant="ghost" 
                className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300"
                onClick={() => navigate("/reports")}
              >
                VIEW ALL REPORTS
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Right Column - Recent Activity & Notifications */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <RecentActivity />
          
          {/* QR Management Summary */}
          <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  QR TRACKING
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Barcode status
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300"
                onClick={() => navigate('/qr-management')}
              >
                MANAGE ALL
              </Button>
            </div>
            
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="tracking-wide text-gray-700 dark:text-gray-300">Total QR Codes</span>
                  <span className="font-medium text-gray-900 dark:text-white">{inventory.length}</span>
                </div>
                <Separator className="bg-gray-100 dark:bg-white/5" />
                <div className="flex justify-between items-center text-sm">
                  <span className="tracking-wide text-gray-700 dark:text-gray-300">Needs Reprinting</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 border-amber-200 dark:border-amber-700/50 uppercase text-[10px] tracking-wider rounded-none">2</Badge>
                </div>
                <Separator className="bg-gray-100 dark:bg-white/5" />
                <div className="flex justify-between items-center text-sm">
                  <span className="tracking-wide text-gray-700 dark:text-gray-300">Recently Generated</span>
                  <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-500 border-green-200 dark:border-green-700/50 uppercase text-[10px] tracking-wider rounded-none">5</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications Preview */}
          <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  TEAM ACTIVITY
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Recent notifications
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300"
                onClick={() => navigate('/audit-log')}
              >
                VIEW ALL
              </Button>
            </div>
            
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-start">
                      <div className={`h-8 w-8 flex-shrink-0 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mr-3 ${
                        notification.type === 'transfer-request' ? 'text-amber-500' : 
                        notification.type === 'transfer-approved' ? 'text-green-500' : 
                        'text-blue-500'
                      }`}>
                        {notification.type === 'transfer-request' ? <Send className="h-4 w-4" /> :
                         notification.type === 'transfer-approved' ? <CheckCircle className="h-4 w-4" /> :
                         <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{notification.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.timeAgo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
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