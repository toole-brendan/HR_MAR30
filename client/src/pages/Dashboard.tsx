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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';

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

  return (
    <StandardPageLayout
      title={`Welcome, ${user?.name || 'User'}`}
      description="HandReceipt Dashboard"
      size="full"
      className="dashboard-container"
    >
      {/* Summary Stats & Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-primary" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        <Card className="dashboard-card border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 text-amber-500" />
              Transfer Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        <Card className="dashboard-card border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-500" />
              Sensitive Items
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        <Card className="dashboard-card border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-blue-500" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
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
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
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
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="readiness">Readiness</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingTransfersCount + pendingMaintenanceCount + sensitiveItemVerifications}</div>
                    <p className="text-xs text-muted-foreground">Across all categories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Transfer Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8.5/day</div>
                    <p className="text-xs text-muted-foreground">Last 7 days average</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">QR Scans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">32</div>
                    <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="readiness">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Readiness</CardTitle>
                  <CardDescription>Current status of all assigned equipment</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Schedule</CardTitle>
                  <CardDescription>Upcoming sensitive items verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b pb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>Today - Morning Check</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        <span>0600</span>
                      </div>
                      <div className="badge-military success">Completed</div>
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
                      <div className="badge-military warning">Pending</div>
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
                      <div className="badge-military primary">Scheduled</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - Recent Activity & Notifications */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <RecentActivity />
          
          {/* QR Management Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-primary" />
                QR Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Total QR Codes</span>
                  <span className="font-medium">{inventory.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Needs Reprinting</span>
                  <span className="font-medium text-amber-500">2</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Recently Generated</span>
                  <span className="font-medium text-green-500">5</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/qr-management')}>
                Manage QR Codes
              </Button>
            </CardFooter>
          </Card>
          
          {/* Notifications Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Team Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="p-3 hover:bg-muted/40">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.timeAgo}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <Button variant="ghost" className="w-full text-xs flex items-center justify-center" onClick={() => navigate('/audit-log')}>
                View All Activity
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}