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
  Activity
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
        className="flex items-center gap-1"
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
        title={`Welcome, ${user?.name || 'User'}`}
        description="HandReceipt Dashboard"
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />
      
      {/* Summary Stats & Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="overflow-hidden border border-border">
          <CardHeader className="pb-2 bg-muted/40">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-primary" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold mb-1">{inventory.length}</div>
            <p className="text-sm text-muted-foreground">Total inventory items</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="p-0 h-auto text-xs flex items-center" onClick={() => navigate('/property-book')}>
              View Property Book
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border border-border border-l-4 border-l-amber-500">
          <CardHeader className="pb-2 bg-muted/40">
            <CardTitle className="text-lg flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 text-amber-500" />
              Transfer Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold mb-1">{pendingTransfersCount}</div>
            <p className="text-sm text-muted-foreground">Pending approvals</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="p-0 h-auto text-xs flex items-center" onClick={() => navigate('/transfers')}>
              Manage Transfers
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border border-border border-l-4 border-l-red-500">
          <CardHeader className="pb-2 bg-muted/40">
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-500" />
              Sensitive Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-3xl font-bold">{sensitiveItemsStats.verifiedToday}</div>
              <div className="text-sm text-muted-foreground">of {sensitiveItemsStats.totalItems} verified</div>
            </div>
            <Progress value={verificationPercentage} className="h-2" />
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="ghost" className="p-0 h-auto text-xs flex items-center" onClick={() => navigate('/sensitive-items')}>
              Verify Items
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border border-border border-l-4 border-l-blue-500">
          <CardHeader className="pb-2 bg-muted/40">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-blue-500" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold mb-1">{pendingMaintenanceCount}</div>
            <p className="text-sm text-muted-foreground">Scheduled maintenance items</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="p-0 h-auto text-xs flex items-center" onClick={() => navigate('/maintenance')}>
              View Maintenance
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
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
          <Card className="mb-6 overflow-hidden border border-border">
            <CardHeader className="bg-muted/40 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Equipment Status</CardTitle>
              </div>
              <CardDescription>Overview of equipment readiness and verification</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-3 w-full rounded-none bg-muted/70">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="readiness">Readiness</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>
                
                <div className="p-4">
                  <TabsContent value="overview" className="m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-muted/20 p-4 rounded-sm">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Pending Actions</h4>
                        <div className="text-2xl font-bold">{pendingTransfersCount + pendingMaintenanceCount + sensitiveItemVerifications}</div>
                        <p className="text-xs text-muted-foreground">Across all categories</p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-sm">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Transfer Rate</h4>
                        <div className="text-2xl font-bold">8.5/day</div>
                        <p className="text-xs text-muted-foreground">Last 7 days average</p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-sm">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">QR Scans</h4>
                        <div className="text-2xl font-bold">32</div>
                        <p className="text-xs text-muted-foreground">Last 24 hours</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="readiness" className="m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm">Operational</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">92%</span>
                          <Progress value={92} className="w-32 h-2" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock8 className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="text-sm">In Maintenance</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">5%</span>
                          <Progress value={5} className="w-32 h-2" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          <span className="text-sm">Non-operational</span>
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
                          <span>Today - Morning Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span>0600</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30">
                          Completed
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>Today - Evening Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span>1800</span>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>Tomorrow - Morning Check</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span>0600</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30">
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
                className="w-full text-xs flex items-center justify-center"
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
          <Card className="overflow-hidden border border-border">
            <CardHeader className="bg-muted/40 pb-2">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">QR Management</CardTitle>
              </div>
              <CardDescription>Barcode and QR code status</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Total QR Codes</span>
                  <span className="font-medium">{inventory.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span>Needs Reprinting</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">2</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span>Recently Generated</span>
                  <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30">5</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 py-3">
              <Button 
                variant="ghost" 
                className="w-full text-xs flex items-center justify-center"
                onClick={() => navigate('/qr-management')}
              >
                Manage QR Codes
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Notifications Preview */}
          <Card className="overflow-hidden border border-border">
            <CardHeader className="bg-muted/40 pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Team Activity</CardTitle>
              </div>
              <CardDescription>Recent notifications and updates</CardDescription>
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
                className="w-full text-xs flex items-center justify-center" 
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