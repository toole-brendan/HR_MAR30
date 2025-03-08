import { useState, useEffect } from "react";
import { transfers } from "@/lib/mockData";
import { Transfer } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/common/StatusBadge";
import QRScannerModal from "@/components/shared/QRScannerModal";
import { useToast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { 
  Filter, 
  CheckCircle, 
  XCircle, 
  ScanLine, 
  Clock, 
  FileText, 
  Send, 
  Search,
  Plus,
  ChevronDown,
  RefreshCw,
  Calendar,
  ArrowUpDown,
  AlignLeft,
  Fingerprint,
  Share2,
  MoreVertical,
  History,
  Inbox,
  ExternalLink,
  AlertCircle,
  CornerDownLeft,
  Award
} from "lucide-react";
import { format } from "date-fns";
import QRCodeGenerator from "@/components/common/QRCodeGenerator";

// Define sorting options
type SortField = 'date' | 'name' | 'from' | 'to';
type SortOrder = 'asc' | 'desc';
type TransferView = 'incoming' | 'outgoing' | 'history';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

const Transfers: React.FC = () => {
  const { user } = useAuth();
  const [transferList, setTransferList] = useState(transfers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showNewTransfer, setShowNewTransfer] = useState(false);
  const [showTransferDetails, setShowTransferDetails] = useState<Transfer | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeView, setActiveView] = useState<TransferView>('incoming');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', order: 'desc' });
  const { toast } = useToast();

  // Simulate current user (in a real app, this would come from auth context)
  const currentUser = user?.name || "John Doe";

  // Handle approving a transfer request
  const handleApprove = (id: string) => {
    setTransferList(
      transferList.map(transfer => 
        transfer.id === id 
          ? { ...transfer, status: "approved" } 
          : transfer
      )
    );
    
    toast({
      title: "Transfer Approved",
      description: "You have approved the transfer request. The item is now assigned to the recipient.",
      variant: "default",
    });
  };

  // Handle rejecting a transfer request
  const handleReject = (id: string) => {
    setTransferList(
      transferList.map(transfer => 
        transfer.id === id 
          ? { ...transfer, status: "rejected" } 
          : transfer
      )
    );
    
    toast({
      title: "Transfer Rejected",
      description: "You have rejected the transfer request. The item remains assigned to you.",
      variant: "destructive",
    });
  };

  // QR Scanner callback
  const handleScanComplete = (result: string) => {
    try {
      // Parse the QR code data (expected format: serialNumber|name)
      const [serialNumber, name] = result.split('|');
      
      if (!serialNumber) {
        toast({
          title: "Invalid QR Code",
          description: "The scanned QR code is not valid for transfers",
          variant: "destructive",
        });
        return;
      }

      // Find if item exists in inventory
      const existingTransfer = transferList.find(item => item.serialNumber === serialNumber);
      
      if (existingTransfer) {
        // Show details of existing transfer
        setShowTransferDetails(existingTransfer);
        toast({
          title: "Item Found",
          description: `Found transfer for ${existingTransfer.name}`,
        });
      } else {
        // Prepare to create a new transfer
        setShowNewTransfer(true);
        toast({
          title: "New Transfer",
          description: `Ready to create transfer for SN: ${serialNumber}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error Processing QR Code",
        description: "Unable to process the scanned QR code",
        variant: "destructive",
      });
    } finally {
      setShowScanner(false);
    }
  };

  // Filter transfers based on active view, search term and status filter
  const filteredTransfers = transferList.filter(transfer => {
    // Filter by view (incoming, outgoing, history)
    const matchesView = 
      (activeView === 'incoming' && transfer.to === currentUser) ||
      (activeView === 'outgoing' && transfer.from === currentUser) ||
      (activeView === 'history' && (transfer.to === currentUser || transfer.from === currentUser));
    
    // Filter by search term
    const matchesSearch = 
      transfer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = 
      filterStatus === "all" || 
      transfer.status === filterStatus;
    
    return matchesView && matchesSearch && matchesStatus;
  });

  // Sort the filtered transfers
  const sortedTransfers = [...filteredTransfers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortConfig.field) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'from':
        comparison = a.from.localeCompare(b.from);
        break;
      case 'to':
        comparison = a.to.localeCompare(b.to);
        break;
      default:
        break;
    }
    
    return sortConfig.order === 'asc' ? comparison : -comparison;
  });

  // Get transfers by status
  const pendingTransfers = sortedTransfers.filter(transfer => transfer.status === "pending");
  const approvedTransfers = sortedTransfers.filter(transfer => transfer.status === "approved");
  const rejectedTransfers = sortedTransfers.filter(transfer => transfer.status === "rejected");

  // Get incoming pending transfers count
  const incomingPendingCount = transferList.filter(
    transfer => transfer.to === currentUser && transfer.status === "pending"
  ).length;

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      order: prevConfig.field === field && prevConfig.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Create a new transfer (mock implementation)
  const handleCreateTransfer = (data: any) => {
    const newTransfer: Transfer = {
      id: `TR${Math.floor(Math.random() * 10000)}`,
      name: data.itemName,
      serialNumber: data.serialNumber,
      from: currentUser,
      to: data.to,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: "pending"
    };
    
    setTransferList([newTransfer, ...transferList]);
    setShowNewTransfer(false);
    
    toast({
      title: "Transfer Created",
      description: `Transfer request for ${data.itemName} has been sent to ${data.to}`,
    });
  };

  // Export transfer as PDF (mock function)
  const handleExportTransfer = (id: string) => {
    toast({
      title: "Exporting Transfer",
      description: "Preparing PDF document...",
    });
    
    // Simulate PDF generation delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Transfer document has been exported",
      });
    }, 1500);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setSortConfig({ field: 'date', order: 'desc' });
  };

  // Automatically show notification when page loads with pending transfers
  useEffect(() => {
    if (incomingPendingCount > 0) {
      setTimeout(() => {
        toast({
          title: `${incomingPendingCount} Pending Transfer${incomingPendingCount > 1 ? 's' : ''}`,
          description: `You have ${incomingPendingCount} pending transfer request${incomingPendingCount > 1 ? 's' : ''} waiting for your approval.`,
          variant: "default",
        });
      }, 1000);
    }
  }, []);

  // Page actions
  const actions = (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setShowScanner(true)}
        className="flex items-center gap-1"
      >
        <ScanLine className="h-4 w-4" />
        <span className="hidden sm:inline">Scan QR</span>
      </Button>
      
      <Button 
        size="sm" 
        variant="default" 
        onClick={() => {
          setShowNewTransfer(true);
          setActiveView('outgoing');
        }}
        className="flex items-center gap-1"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Initiate Transfer</span>
      </Button>
    </div>
  );

  // Table header component
  const TableHeader = () => (
    <div className="px-4 py-3 mb-2 flex items-center justify-between bg-muted/40 rounded-md">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden md:flex"
          onClick={() => handleSort('name')}
        >
          <span>Item</span>
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
        </Button>
        
        <div className="md:hidden text-sm font-medium">Item / Details</div>
      </div>
      
      <div className="hidden md:flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleSort('from')}
        >
          <span>{activeView === 'incoming' ? 'From' : 'Sender'}</span>
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleSort('to')}
        >
          <span>{activeView === 'outgoing' ? 'To' : 'Recipient'}</span>
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleSort('date')}
        >
          <span>Date</span>
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
        </Button>
        
        <div className="w-24 text-right text-sm">Status</div>
        <div className="w-16"></div>
      </div>
    </div>
  );

  // Transfer item row component
  const TransferRow = ({ transfer }: { transfer: Transfer }) => {
    const formattedDate = new Date(transfer.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Determine if the current user is the recipient (to handle approve/reject)
    const isRecipient = transfer.to === currentUser;
    const isSender = transfer.from === currentUser;
    
    // For pending transfers, show action buttons only to the recipient
    const showActions = transfer.status === "pending" && isRecipient;
    
    // For history view, highlight the user's role
    const userRole = isRecipient ? "recipient" : (isSender ? "sender" : "");
    
    return (
      <div className={`px-4 py-3 flex flex-col md:flex-row md:items-center justify-between border-b last:border-0 ${
        transfer.status === "pending" && isRecipient ? "bg-amber-50/40 dark:bg-amber-900/10" : ""
      }`}>
        <div className="flex items-center gap-3 mb-2 md:mb-0 flex-1 min-w-0">
          <div className="h-10 w-10 flex-shrink-0 bg-[#4B5320] dark:bg-[#5A6433] rounded-full flex items-center justify-center text-white">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{transfer.name}</div>
            <div className="text-sm text-muted-foreground font-mono">SN: {transfer.serialNumber}</div>
            
            {/* Mobile view only */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 md:hidden">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                <span>{isRecipient ? 'From: ' : 'Sender: '}{transfer.from}</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Send className="h-3 w-3" />
                <span>{isSender ? 'To: ' : 'Recipient: '}{transfer.to}</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
              
              {/* Show user's role indicator in history view */}
              {activeView === 'history' && userRole && (
                <div className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {userRole === "recipient" ? "To You" : "From You"}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop view only */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="w-24 truncate">
            {transfer.from}
            {/* Show pill if user is sender in history view */}
            {activeView === 'history' && isSender && (
              <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">You</span>
            )}
          </div>
          <div className="w-24 truncate">
            {transfer.to}
            {/* Show pill if user is recipient in history view */}
            {activeView === 'history' && isRecipient && (
              <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">You</span>
            )}
          </div>
          <div className="w-24 text-sm">{formattedDate}</div>
          <div className="w-24 text-right">
            <StatusBadge status={transfer.status} />
          </div>
          <div className="w-16 flex justify-end">
            {showActions ? (
              <div className="flex space-x-1">
                <Button 
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={() => handleApprove(transfer.id)}
                  title="Approve"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => handleReject(transfer.id)}
                  title="Reject"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowTransferDetails(transfer)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportTransfer(transfer.id)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Mobile view actions */}
        <div className="flex md:hidden justify-between items-center">
          <StatusBadge status={transfer.status} />
          
          <div className="flex">
            {showActions ? (
              <div className="flex space-x-1">
                <Button 
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={() => handleApprove(transfer.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => handleReject(transfer.id)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTransferDetails(transfer)}
              >
                Details
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Empty state component
  const EmptyState = ({ view, status }: { view: TransferView, status?: string }) => {
    let title = '';
    let description = '';
    let icon = <History className="h-6 w-6 text-muted-foreground" />;
    
    if (view === 'incoming') {
      if (status === 'pending') {
        title = 'No Incoming Transfers';
        description = 'You have no pending transfer requests to review.';
        icon = <Inbox className="h-6 w-6 text-muted-foreground" />;
      } else {
        title = 'No Incoming Transfers';
        description = 'You have no incoming transfers with this status.';
      }
    } else if (view === 'outgoing') {
      title = 'No Outgoing Transfers';
      description = 'You have not initiated any transfer requests.';
      icon = <ExternalLink className="h-6 w-6 text-muted-foreground" />;
    } else {
      title = 'No Transfer History';
      description = 'You have no transfer history to display.';
    }
    
    return (
      <div className="py-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          {description}
        </p>
        {view === 'outgoing' && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowNewTransfer(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Initiate New Transfer
          </Button>
        )}
      </div>
    );
  };

  // Get page description based on active view
  const getPageDescription = () => {
    switch (activeView) {
      case 'incoming':
        return "Review and manage transfer requests sent to you";
      case 'outgoing':
        return "Track transfer requests you've initiated";
      case 'history':
        return "View your complete transfer history";
      default:
        return "Manage equipment transfer requests and assignments";
    }
  };

  // Get page title based on active view
  const getPageTitle = () => {
    switch (activeView) {
      case 'incoming':
        return "Incoming Transfers";
      case 'outgoing':
        return "Outgoing Transfers";
      case 'history':
        return "Transfer History";
      default:
        return "Transfer Requests";
    }
  };

  return (
    <PageWrapper withPadding={true}>
      <PageHeader
        title={getPageTitle()}
        description={getPageDescription()}
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />
      
      {/* View Selection Tabs */}
      <div className="mb-4">
        <Tabs 
          defaultValue="incoming" 
          value={activeView}
          onValueChange={(value) => setActiveView(value as TransferView)}
          className="w-full"
        >
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="incoming" className="flex items-center">
              <Inbox className="h-4 w-4 mr-2" />
              <span>Incoming</span>
              {incomingPendingCount > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2">
                  {incomingPendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-2" />
              <span>Outgoing</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, serial number, personnel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleResetFilters}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeView === 'incoming' && (
              <div className="flex items-center">
                <Inbox className="h-5 w-5 mr-2" />
                <span>Incoming Transfers</span>
              </div>
            )}
            {activeView === 'outgoing' && (
              <div className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                <span>Outgoing Transfers</span>
              </div>
            )}
            {activeView === 'history' && (
              <div className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                <span>Transfer History</span>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            {activeView === 'incoming' && "Review transfer requests sent to you for approval"}
            {activeView === 'outgoing' && "Track transfer requests you've initiated to others"}
            {activeView === 'history' && "Complete record of all your equipment transfers"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Transfer Status Tabs - Only show on incoming view */}
          {activeView === 'incoming' && (
            <Tabs defaultValue="pending" className="mb-4">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2">{pendingTransfers.length}</span>
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                {TableHeader()}
                <div className="rounded-md border">
                  {pendingTransfers.length === 0 ? (
                    <EmptyState view={activeView} status="pending" />
                  ) : (
                    pendingTransfers.map((transfer) => (
                      <TransferRow key={transfer.id} transfer={transfer} />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="approved">
                {TableHeader()}
                <div className="rounded-md border">
                  {approvedTransfers.length === 0 ? (
                    <EmptyState view={activeView} status="approved" />
                  ) : (
                    approvedTransfers.map((transfer) => (
                      <TransferRow key={transfer.id} transfer={transfer} />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="rejected">
                {TableHeader()}
                <div className="rounded-md border">
                  {rejectedTransfers.length === 0 ? (
                    <EmptyState view={activeView} status="rejected" />
                  ) : (
                    rejectedTransfers.map((transfer) => (
                      <TransferRow key={transfer.id} transfer={transfer} />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="all">
                {TableHeader()}
                <div className="rounded-md border">
                  {sortedTransfers.length === 0 ? (
                    <EmptyState view={activeView} />
                  ) : (
                    sortedTransfers.map((transfer) => (
                      <TransferRow key={transfer.id} transfer={transfer} />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {/* For outgoing and history, just show the list without status tabs */}
          {(activeView === 'outgoing' || activeView === 'history') && (
            <>
              {TableHeader()}
              <div className="rounded-md border">
                {sortedTransfers.length === 0 ? (
                  <EmptyState view={activeView} />
                ) : (
                  sortedTransfers.map((transfer) => (
                    <TransferRow key={transfer.id} transfer={transfer} />
                  ))
                )}
              </div>
            </>
          )}
          
          {/* Helpful hints section */}
          {activeView === 'incoming' && pendingTransfers.length > 0 && (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50 p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Pending Approval Required</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    You have pending transfer requests that require your action. Review and approve or reject these requests to update your equipment inventory.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeView === 'outgoing' && (
            <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/50 p-4">
              <div className="flex items-start">
                <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Outgoing Transfers</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Track the status of transfer requests you've initiated. Recipients will need to approve transfers before the equipment is reassigned.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div>Showing {sortedTransfers.length} transfer requests</div>
          <div>Last updated: {format(new Date(), 'MMM d, yyyy HH:mm')}</div>
        </CardFooter>
      </Card>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleScanComplete}
        />
      )}

      {/* New Transfer Dialog */}
      <Dialog open={showNewTransfer} onOpenChange={setShowNewTransfer}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Initiate Equipment Transfer</DialogTitle>
            <DialogDescription>
              Create a new transfer request to reassign equipment to another person
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input id="item-name" placeholder="Enter item name" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="serial-number">Serial Number</Label>
              <Input id="serial-number" placeholder="Enter serial number" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="from">From (Current Holder)</Label>
              <Input id="from" value={currentUser} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">You are transferring this item from your inventory</p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="to">To (New Holder)</Label>
              <Input id="to" placeholder="Enter recipient's name" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowNewTransfer(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleCreateTransfer({
              itemName: (document.getElementById('item-name') as HTMLInputElement)?.value || 'Unknown Item',
              serialNumber: (document.getElementById('serial-number') as HTMLInputElement)?.value || 'NA',
              from: currentUser,
              to: (document.getElementById('to') as HTMLInputElement)?.value || 'Unknown',
            })}>
              <Send className="h-4 w-4 mr-2" />
              Send Transfer Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Details Dialog */}
      <Dialog open={!!showTransferDetails} onOpenChange={(open) => !open && setShowTransferDetails(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transfer request
            </DialogDescription>
          </DialogHeader>
          
          {showTransferDetails && (
            <div className="mt-4 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{showTransferDetails.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">SN: {showTransferDetails.serialNumber}</p>
                  </div>
                  <StatusBadge status={showTransferDetails.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">From</p>
                    <p className="font-medium flex items-center">
                      {showTransferDetails.from}
                      {showTransferDetails.from === currentUser && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">To</p>
                    <p className="font-medium flex items-center">
                      {showTransferDetails.to}
                      {showTransferDetails.to === currentUser && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Request Date</p>
                    <p className="font-medium">{new Date(showTransferDetails.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Transfer ID</p>
                    <p className="font-mono">{showTransferDetails.id}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* QR Code */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Item QR Code</h4>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeGenerator 
                    itemName={showTransferDetails.name}
                    serialNumber={showTransferDetails.serialNumber}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Scan this QR code to quickly access this item in the system
                </p>
              </div>
              
              {/* Timeline (mock) */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Transfer Timeline</h4>
                <div className="space-y-3 mt-2">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <div className="w-px h-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Transfer Requested</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(showTransferDetails.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {showTransferDetails.status !== "pending" && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          showTransferDetails.status === "approved" 
                            ? "bg-green-500" 
                            : "bg-red-500"
                        }`}></div>
                        <div className="w-px h-full bg-transparent"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {showTransferDetails.status === "approved" 
                            ? "Transfer Approved" 
                            : "Transfer Rejected"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Chain of custody */}
              {showTransferDetails.status === 'approved' && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Chain of Custody Record</h4>
                  <div className="rounded-md border p-3 text-sm">
                    <p className="text-muted-foreground mb-2">This transfer is part of the permanent, tamper-proof chain of custody record for this item.</p>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span>Blockchain verified on {format(new Date(), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setShowTransferDetails(null)}>
              Close
            </Button>
            
            <div className="flex gap-2">
              {showTransferDetails?.status === "pending" && showTransferDetails.to === currentUser && (
                <>
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => {
                      handleReject(showTransferDetails.id);
                      setShowTransferDetails(null);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      handleApprove(showTransferDetails.id);
                      setShowTransferDetails(null);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              
              {(showTransferDetails?.status !== "pending" || showTransferDetails?.to !== currentUser) && (
                <Button onClick={() => handleExportTransfer(showTransferDetails?.id || "")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
};

export default Transfers;
