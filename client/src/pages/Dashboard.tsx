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
  Download,
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
        className="flex items-center gap-1 uppercase tracking-wider text-xs font-medium"
      >
        <QrCode className="h-4 w-4" />
        <span className="hidden sm:inline">Scan QR</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="default" 
        onClick={() => navigate('/transfers')}
        className="flex items-center gap-1 bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs font-medium"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Item</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => navigate('/reports')}
        className="flex items-center gap-1 uppercase tracking-wider text-xs font-medium"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export CSV</span>
      </Button>
    </div>
  );

  return (
    <PageWrapper withPadding={true}>
      {/* Header section with 8VC style formatting based on screenshots */}
      <div className="mb-8">
        {/* Category label - Small all-caps category label */}
        <div className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1.5">
          INVENTORY
        </div>
        
        {/* Main title - following 8VC typography */}
        <h1 className="text-3xl font-normal tracking-tight mb-1.5">Inventory Management</h1>
        <p className="text-muted-foreground text-base tracking-wide">
          Manage and track your inventory items across all locations
        </p>
        
        {/* Subtle horizontal divider */}
        <Separator className="mt-5 mb-8 bg-gray-100 dark:bg-white/5" />
        
        {/* Page actions aligned to the right, similar to screenshots */}
        <div className="flex justify-end mb-6">
          {actions}
        </div>
      </div>
      
      {/* Summary Stats - Metric cards with 8VC styling exactly matching the screenshots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-5">
            <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              FULFILLMENT RATE
            </div>
            <div className="flex items-end">
              <div className="text-3xl font-light tracking-tight">96.8%</div>
              <div className="ml-2 flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                <span className="mr-1">↑</span> 2.1%
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">vs previous period</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-5">
            <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              AVG. PROCESSING TIME
            </div>
            <div className="flex items-end">
              <div className="text-3xl font-light tracking-tight">1.4 days</div>
              <div className="ml-2 flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                <span className="mr-1">↓</span> 0.3 days
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">vs previous period</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-5">
            <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              ORDER ACCURACY
            </div>
            <div className="flex items-end">
              <div className="text-3xl font-light tracking-tight">99.2%</div>
              <div className="ml-2 flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                <span className="mr-1">↑</span> 0.5%
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">vs previous period</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid following 8VC layout from screenshots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {/* Inventory Items Table - styled based on screenshots */}
          <div className="border border-gray-200 dark:border-white/5 rounded-none bg-white dark:bg-black mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-white/5">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                ITEMS
              </div>
              <div className="text-xl font-normal">
                Low stock items
              </div>
            </div>
            
            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  placeholder="Search by name, code, or description" 
                  className="w-full pl-9 py-2 px-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-black rounded-sm text-sm"
                />
              </div>
              
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">Item</th>
                      <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">Code</th>
                      <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">Location</th>
                      <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.slice(0, 3).map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 rounded-sm bg-primary/10 flex items-center justify-center mr-3 text-primary">
                              <Package className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-muted-foreground">SN: {item.serialNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">WH{index + 100}</td>
                        <td className="py-3 px-4 text-sm">Warehouse A</td>
                        <td className="py-3 px-4">
                          <Badge className="uppercase text-[10px] tracking-wider font-medium bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="p-4 flex justify-end">
                  <Button 
                    variant="ghost" 
                    className="text-xs uppercase tracking-wider text-primary hover:bg-transparent hover:text-primary-600 font-medium"
                    onClick={() => navigate("/property-book")}
                  >
                    View All
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Information Blocks styled to match screenshots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 dark:border-white/5 bg-white dark:bg-black p-6">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-3">
                OVERVIEW
              </div>
              <h3 className="text-lg font-normal mb-3">What is HandReceipt?</h3>
              <div className="text-sm text-muted-foreground space-y-4">
                <p>
                  HandReceipt is a specialized military logistics system for equipment tracking and transfer management using QR code technology.
                </p>
                <p>
                  This blockchain-powered platform ensures accuracy, security, and transparency in inventory management operations.
                </p>
                <div className="flex items-center mt-4 text-xs text-primary">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 mr-2">
                    <CheckCircle className="h-3 w-3" />
                  </span>
                  All data is securely stored on blockchain infrastructure with enterprise-grade security.
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-white/5 bg-white dark:bg-black p-6">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-3">
                BENEFITS
              </div>
              <h3 className="text-lg font-normal mb-3">Commercial Benefits</h3>
              <div className="space-y-3">
                {[
                  "Immediate verification when equipment is transferred",
                  "Create custom transfer conditions (receipt verification, etc.)",
                  "Transparent, immutable transaction record for audit",
                  "Reduced administrative overhead and paperwork",
                  "Integration with existing military systems"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 mt-0.5 mr-2">
                      <CheckCircle className="h-3 w-3" />
                    </span>
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Recent Activity & Transfers */}
        <div className="space-y-6">
          {/* Activity Feed styled to match screenshots */}
          <div className="border border-gray-200 dark:border-white/5 bg-white dark:bg-black">
            <div className="p-6 border-b border-gray-200 dark:border-white/5">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                ACTIVITY LOG
              </div>
              <div className="text-xl font-normal">
                Recent blockchain activity
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {activities.slice(0, 3).map(activity => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-start">
                    <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center mr-3 
                      ${activity.type === 'transfer-approved' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                        activity.type === 'transfer-rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
                        'bg-primary/10 text-primary'}`
                    }>
                      {activity.type === 'transfer-approved' ? <CheckCircle className="h-4 w-4" /> :
                      activity.type === 'transfer-rejected' ? <AlertTriangle className="h-4 w-4" /> :
                      <Activity className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{activity.description}</h4>
                      <div className="flex items-center mt-1">
                        <div className="text-xs text-muted-foreground">{activity.user}</div>
                        <div className="text-xs text-muted-foreground mx-2">•</div>
                        <div className="text-xs text-muted-foreground">{activity.timeAgo}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 flex justify-end border-t border-gray-100 dark:border-white/5">
              <Button 
                variant="ghost" 
                className="text-xs uppercase tracking-wider text-primary hover:bg-transparent hover:text-primary-600 font-medium"
                onClick={() => navigate('/audit-log')}
              >
                View All Activity
              </Button>
            </div>
          </div>
          
          {/* Pending Transfers styled to match screenshots */}
          <div className="border border-gray-200 dark:border-white/5 bg-white dark:bg-black">
            <div className="p-6 border-b border-gray-200 dark:border-white/5">
              <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                TRANSFERS
              </div>
              <div className="text-xl font-normal">
                Pending requests
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {transfers.filter(t => t.status === "pending").slice(0, 2).map(transfer => (
                <div key={transfer.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">{transfer.name}</div>
                    <Badge className="uppercase text-[10px] tracking-wider font-medium bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">
                      Pending
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <div className="text-muted-foreground mb-1">From</div>
                      <div>{transfer.from}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">To</div>
                      <div>{transfer.to}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-xs uppercase tracking-wider font-medium h-8">
                      Decline
                    </Button>
                    <Button variant="default" size="sm" className="text-xs uppercase tracking-wider font-medium h-8 bg-primary hover:bg-primary-600">
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 flex justify-end border-t border-gray-100 dark:border-white/5">
              <Button 
                variant="ghost" 
                className="text-xs uppercase tracking-wider text-primary hover:bg-transparent hover:text-primary-600 font-medium"
                onClick={() => navigate('/transfers')}
              >
                View All Transfers
              </Button>
            </div>
          </div>
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