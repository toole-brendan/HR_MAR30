import { useState, useEffect, useReducer, useCallback, useMemo } from "react";
// import { useParams } from 'react-router-dom'; // Removed import as it's not installed/used
import { transfers as initialTransfers, user as mockUser } from "@/lib/mockData";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import StatusBadge from "@/components/common/StatusBadge"; // Ensure this path is correct
import QRScannerModal from "@/components/shared/QRScannerModal"; // Ensure this path is correct
import { useToast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ArrowUp, // Added for sort indicator
  ArrowDown, // Added for sort indicator
  AlignLeft,
  Fingerprint,
  Share2,
  MoreVertical,
  History,
  Inbox,
  ExternalLink,
  AlertCircle,
  CornerDownLeft,
  Award,
  Printer,
  Loader2, // For loading state
  BookOpen // For Property Book link
} from "lucide-react";
import { format, parseISO } from "date-fns";
import QRCodeGenerator from "@/components/common/QRCodeGenerator";

// --- State Management with useReducer ---

type SortField = 'date' | 'name' | 'from' | 'to';
type SortOrder = 'asc' | 'desc';
type TransferView = 'incoming' | 'outgoing' | 'history';
type TransferStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface TransfersState {
  transfers: Transfer[];
  searchTerm: string;
  filterStatus: TransferStatusFilter;
  activeView: TransferView;
  sortConfig: SortConfig;
  showScanner: boolean;
  showNewTransfer: boolean;
  showTransferDetails: Transfer | null;
  transferToConfirm: { id: string; action: 'approve' | 'reject' } | null;
  loadingStates: { [key: string]: boolean }; // To track loading for approve/reject actions
}

type TransfersAction =
  | { type: 'SET_TRANSFERS'; payload: Transfer[] }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_FILTER_STATUS'; payload: TransferStatusFilter }
  | { type: 'SET_ACTIVE_VIEW'; payload: TransferView }
  | { type: 'SET_SORT_CONFIG'; payload: SortField }
  | { type: 'TOGGLE_SCANNER'; payload: boolean }
  | { type: 'TOGGLE_NEW_TRANSFER'; payload: boolean }
  | { type: 'SHOW_DETAILS'; payload: Transfer | null }
  | { type: 'CONFIRM_ACTION'; payload: { id: string; action: 'approve' | 'reject' } | null }
  | { type: 'START_LOADING'; payload: string } // Transfer ID
  | { type: 'STOP_LOADING'; payload: string } // Transfer ID
  | { type: 'UPDATE_TRANSFER'; payload: Transfer } // Update a single transfer
  | { type: 'ADD_TRANSFER'; payload: Transfer } // Add a new transfer
  | { type: 'RESET_FILTERS' };

const initialState: TransfersState = {
  transfers: initialTransfers, // Load initial data
  searchTerm: "",
  filterStatus: "all",
  activeView: 'incoming',
  sortConfig: { field: 'date', order: 'desc' },
  showScanner: false,
  showNewTransfer: false,
  showTransferDetails: null,
  transferToConfirm: null,
  loadingStates: {},
};

function transfersReducer(state: TransfersState, action: TransfersAction): TransfersState {
  switch (action.type) {
    case 'SET_TRANSFERS':
      return { ...state, transfers: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload };
    case 'SET_ACTIVE_VIEW':
      // Reset search/filter when changing views?
      return { ...state, activeView: action.payload, searchTerm: '', filterStatus: 'all' };
    case 'SET_SORT_CONFIG':
      const newOrder = state.sortConfig.field === action.payload && state.sortConfig.order === 'asc' ? 'desc' : 'asc';
      return { ...state, sortConfig: { field: action.payload, order: newOrder } };
    case 'TOGGLE_SCANNER':
      return { ...state, showScanner: action.payload };
    case 'TOGGLE_NEW_TRANSFER':
      return { ...state, showNewTransfer: action.payload };
    case 'SHOW_DETAILS':
      return { ...state, showTransferDetails: action.payload };
    case 'CONFIRM_ACTION':
      return { ...state, transferToConfirm: action.payload };
    case 'START_LOADING':
      return { ...state, loadingStates: { ...state.loadingStates, [action.payload]: true } };
    case 'STOP_LOADING':
      const { [action.payload]: _, ...restLoading } = state.loadingStates;
      return { ...state, loadingStates: restLoading };
    case 'UPDATE_TRANSFER':
      return {
        ...state,
        transfers: state.transfers.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'ADD_TRANSFER':
      return {
        ...state,
        transfers: [action.payload, ...state.transfers],
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        searchTerm: "",
        filterStatus: "all",
        sortConfig: { field: 'date', order: 'desc' },
      };
    default:
      return state;
  }
}

// --- Component Definition ---

interface TransfersProps {
  // id?: string; // If using path param like /transfers/:id
}

const Transfers: React.FC<TransfersProps> = () => {
  // Use route params if needed
  // const { id: routeParamId } = useParams<{ id?: string }>(); // Removed usage
  const { user } = useAuth();
  const { toast } = useToast();

  const [state, dispatch] = useReducer(transfersReducer, initialState);
  const { transfers, searchTerm, filterStatus, activeView, sortConfig, showScanner, showNewTransfer, showTransferDetails, transferToConfirm, loadingStates } = state;

  // Use the mock user directly for the demo
  const currentUser = mockUser.name; // "CPT Rodriguez, Michael"

  // Effect to show specific transfer details if ID is in route param (Keep this logic general for future use, but it won't trigger without router)
  /* // Commented out as useParams is removed
  useEffect(() => {
    if (routeParamId) {
      const transfer = transfers.find(t => t.id === routeParamId);
      if (transfer) {
        dispatch({ type: 'SHOW_DETAILS', payload: transfer });
      }
    }
  }, [routeParamId, transfers]);
  */

  // Simulate Async Operation
  const simulateAsyncOperation = (duration = 500) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  // --- Transfer Actions with Async Simulation ---
  const handleApprove = async (id: string) => {
    dispatch({ type: 'START_LOADING', payload: id });
    await simulateAsyncOperation();

    const updatedTransfer: Transfer = {
      ...transfers.find(t => t.id === id)!,
      status: "approved",
      approvedDate: new Date().toISOString(),
    };

    // TODO: In a real app, update backend/IndexedDB here
    dispatch({ type: 'UPDATE_TRANSFER', payload: updatedTransfer });
    dispatch({ type: 'STOP_LOADING', payload: id });
    dispatch({ type: 'CONFIRM_ACTION', payload: null }); // Close confirmation dialog

    toast({
      title: "Transfer Approved",
      description: `Transfer of ${updatedTransfer.name} approved.`, // More specific
      variant: "default", // Changed from 'success'
    });
  };

  const handleReject = async (id: string, reason: string = "Rejected by recipient") => {
    dispatch({ type: 'START_LOADING', payload: id });
    await simulateAsyncOperation();

    const updatedTransfer: Transfer = {
      ...transfers.find(t => t.id === id)!,
      status: "rejected",
      rejectedDate: new Date().toISOString(),
      rejectionReason: reason,
    };

    // TODO: Update backend/IndexedDB
    dispatch({ type: 'UPDATE_TRANSFER', payload: updatedTransfer });
    dispatch({ type: 'STOP_LOADING', payload: id });
    dispatch({ type: 'CONFIRM_ACTION', payload: null }); // Close confirmation dialog

    toast({
      title: "Transfer Rejected",
      description: `Transfer of ${updatedTransfer.name} rejected.`, // More specific
      variant: "destructive",
    });
  };

  const handleCreateTransfer = async (data: { itemName: string; serialNumber: string; to: string }) => {
    dispatch({ type: 'START_LOADING', payload: 'new-transfer' }); // Use a unique key for loading
    await simulateAsyncOperation();

    const newTransfer: Transfer = {
      id: `TR${Math.floor(Math.random() * 90000) + 10000}`, // 5 digit random ID
      name: data.itemName,
      serialNumber: data.serialNumber,
      from: currentUser,
      to: data.to,
      date: new Date().toISOString(),
      status: "pending"
    };

    // TODO: Update backend/IndexedDB
    dispatch({ type: 'ADD_TRANSFER', payload: newTransfer });
    dispatch({ type: 'TOGGLE_NEW_TRANSFER', payload: false });
    dispatch({ type: 'STOP_LOADING', payload: 'new-transfer' });

    toast({
      title: "Transfer Created",
      description: `Transfer request for ${data.itemName} has been sent to ${data.to}`, // Use backticks
    });
  };

  // --- QR Scanner Callback ---
  const handleScanComplete = (result: string) => {
    try {
      const [serialNumber, name] = result.split('|');
      if (!serialNumber) throw new Error("Invalid QR Code format");

      const existingTransfer = transfers.find(item => item.serialNumber === serialNumber);

      if (existingTransfer) {
        dispatch({ type: 'SHOW_DETAILS', payload: existingTransfer });
        toast({ title: "Transfer Found", description: `Showing details for ${existingTransfer.name}` });
      } else {
        // Pre-fill new transfer form? (Optional enhancement)
        dispatch({ type: 'TOGGLE_NEW_TRANSFER', payload: true });
        toast({ title: "New Transfer Initiated", description: `Ready to create transfer for SN: ${serialNumber}` });
      }
    } catch (error) {
      toast({ title: "QR Scan Error", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      dispatch({ type: 'TOGGLE_SCANNER', payload: false });
    }
  };

  // --- Filtering and Sorting Logic (Memoized) ---
  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesView =
        (activeView === 'incoming' && transfer.to === currentUser) ||
        (activeView === 'outgoing' && transfer.from === currentUser) ||
        (activeView === 'history' && (transfer.to === currentUser || transfer.from === currentUser));

      const matchesSearch =
        !searchTerm || // Return true if searchTerm is empty
        transfer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.to.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        transfer.status === filterStatus;

      return matchesView && matchesSearch && matchesStatus;
    });
  }, [transfers, activeView, currentUser, searchTerm, filterStatus]);

  const sortedTransfers = useMemo(() => {
    return [...filteredTransfers].sort((a, b) => {
      let comparison = 0;
      const fieldA = a[sortConfig.field];
      const fieldB = b[sortConfig.field];

      if (sortConfig.field === 'date') {
        // Compare ISO date strings directly
        comparison = (fieldA && fieldB) ? fieldA.localeCompare(fieldB) : 0;
      } else if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        comparison = fieldA.localeCompare(fieldB);
      }
      // Add more specific comparisons if needed (e.g., numbers)

      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
  }, [filteredTransfers, sortConfig]);

  // --- Derived State ---
  const incomingPendingCount = useMemo(() => {
    return transfers.filter(
      transfer => transfer.to === currentUser && transfer.status === "pending"
    ).length;
  }, [transfers, currentUser]);

  // --- Event Handlers ---
  const handleSort = (field: SortField) => {
    dispatch({ type: 'SET_SORT_CONFIG', payload: field });
  };

  const handleResetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const handleExportTransfer = (id: string) => {
    const transfer = transfers.find(t => t.id === id);
    toast({ title: "Exporting Transfer", description: `Preparing PDF for ${transfer?.name || 'item'}...` });
    setTimeout(() => {
      toast({ title: "Export Complete (Demo)", description: `Transfer document for ${transfer?.name || 'item'} exported.` });
    }, 1500);
  };

  // --- Initial Notification Effect ---
  useEffect(() => {
    if (incomingPendingCount > 0) {
      const timer = setTimeout(() => {
        toast({
          title: `${incomingPendingCount} Pending Incoming Transfer${incomingPendingCount > 1 ? 's' : ''}`,
          description: `You have ${incomingPendingCount} transfer request${incomingPendingCount > 1 ? 's' : ''} waiting for review.`,
          variant: "default",
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [incomingPendingCount, toast]); // Dependency on toast ensures it's stable

  // --- UI Helper Functions ---
  const getPageDescription = useCallback(() => {
    switch (activeView) {
      case 'incoming': return "Review and manage transfer requests sent to you";
      case 'outgoing': return "Track transfer requests you've initiated";
      case 'history': return "View your complete transfer history (incoming and outgoing)";
      default: return "Manage equipment transfer requests and assignments";
    }
  }, [activeView]);

  const getPageTitle = () => "Transfers"; // Title is constant

  // --- Internal Components ---

  // Enhanced Table Header with Sort Indicators
  const TransferListHeader = () => (
    <div className="grid grid-cols-[100px_1.5fr_1fr_1fr_120px_140px] gap-4 border-b px-4 py-3 bg-muted/50 sticky top-0 z-10 text-xs uppercase tracking-wider text-muted-foreground font-medium">
      {(['date', 'name', 'from', 'to'] as SortField[]).map((field) => (
        <div
          key={field}
          className="flex items-center cursor-pointer hover:text-foreground transition-colors group"
          onClick={() => handleSort(field)}
        >
          <span>{field === 'name' ? 'Item / SN' : field.charAt(0).toUpperCase() + field.slice(1)}</span>
          {sortConfig.field === field ? (
            sortConfig.order === 'asc' ? (
              <ArrowUp className="h-3 w-3 ml-1 text-foreground" />
            ) : (
              <ArrowDown className="h-3 w-3 ml-1 text-foreground" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
      ))}
      <div>Status</div>
      <div className="text-right">Actions</div>
    </div>
  );

  // Extracted Transfer Row Component
  const TransferRow = ({ transfer }: { transfer: Transfer }) => {
    const isRecipient = transfer.to === currentUser;
    const isSender = transfer.from === currentUser;
    const isPendingIncoming = activeView === 'incoming' && transfer.status === 'pending' && isRecipient;
    const isLoading = loadingStates[transfer.id]; // Check loading state

    return (
      <div className="grid grid-cols-[100px_1.5fr_1fr_1fr_120px_140px] gap-4 border-b px-4 py-4 hover:bg-muted/50 transition-colors text-sm items-center">
        {/* Date */}
        <div>
          <div className="font-medium">{format(parseISO(transfer.date), 'ddMMMyyyy').toUpperCase()}</div>
          <div className="text-xs text-muted-foreground">{format(parseISO(transfer.date), 'HH:mm')}</div>
        </div>

        {/* Item */}
        <div>
          <div className="font-medium truncate" title={transfer.name}>{transfer.name}</div>
          <div className="text-xs text-muted-foreground font-mono tracking-wider">SN: {transfer.serialNumber}</div>
        </div>

        {/* From */}
        <div className={`truncate ${isSender && activeView === 'history' ? 'font-semibold' : ''}`} title={transfer.from}>{transfer.from}</div>

        {/* To */}
        <div className={`truncate ${isRecipient && activeView === 'history' ? 'font-semibold' : ''}`} title={transfer.to}>{transfer.to}</div>

        {/* Status */}
        <div>
          <StatusBadge status={transfer.status} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2">
          {isPendingIncoming ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 bg-transparent border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 uppercase text-[10px] tracking-wider rounded-none font-semibold"
                onClick={() => dispatch({ type: 'CONFIRM_ACTION', payload: { id: transfer.id, action: 'approve' } })}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Accept'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 bg-transparent border-destructive/80 text-destructive hover:bg-destructive/10 uppercase text-[10px] tracking-wider rounded-none font-semibold"
                onClick={() => dispatch({ type: 'CONFIRM_ACTION', payload: { id: transfer.id, action: 'reject' } })}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Decline'}
              </Button>
            </>
          ) : (
            // Show details button for other cases
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => dispatch({ type: 'SHOW_DETAILS', payload: transfer })}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Details</span>
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Extracted Empty State Component
  const EmptyState = () => {
    let title = '';
    let description = '';
    let icon: React.ReactNode = <History className="h-8 w-8 text-muted-foreground" />;
    let showInitiateButton = false;

    const baseDesc = searchTerm || filterStatus !== 'all'
      ? "Try adjusting your search or filter criteria."
      : "";

    if (activeView === 'incoming') {
      title = 'No Incoming Transfers';
      description = `You have no ${filterStatus !== 'all' ? filterStatus + ' ' : ''}incoming transfers${searchTerm ? ' matching your search' : ''}. ${baseDesc}`.trim();
      icon = <Inbox className="h-8 w-8 text-muted-foreground" />;
    } else if (activeView === 'outgoing') {
      title = 'No Outgoing Transfers';
      description = `You have no ${filterStatus !== 'all' ? filterStatus + ' ' : ''}outgoing transfers${searchTerm ? ' matching your search' : ''}. ${baseDesc}`.trim();
      icon = <ExternalLink className="h-8 w-8 text-muted-foreground" />;
      showInitiateButton = !searchTerm && filterStatus === 'all'; // Show button only if no filters active
    } else { // history
      title = 'No Transfer History';
      description = `No transfer history found${searchTerm ? ' matching your search' : ''}${filterStatus !== 'all' ? ' with status ' + filterStatus : ''}. ${baseDesc}`.trim();
    }

    return (
      <div className="py-16 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
        {showInitiateButton && (
          <Button
            variant="blue" // Use blue variant as per style guide
            className="mt-6"
            onClick={() => dispatch({ type: 'TOGGLE_NEW_TRANSFER', payload: true })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Initiate New Transfer
          </Button>
        )}
      </div>
    );
  };

  // --- Render Logic ---
  return (
    <PageWrapper withPadding={true}>
      <div className="pt-16 pb-10">
        {/* Page Header */}
        <div className="text-xs uppercase tracking-wider font-medium mb-1 text-muted-foreground">
          EQUIPMENT
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-1">{getPageTitle()}</h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {getPageDescription()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="blue"
              onClick={() => dispatch({ type: 'TOGGLE_NEW_TRANSFER', payload: true })}
              className="h-9 px-3 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">New Transfer</span>
            </Button>
            <Button
              size="sm"
              variant="blue"
              onClick={() => dispatch({ type: 'TOGGLE_SCANNER', payload: true })}
              className="h-9 px-3 flex items-center gap-1.5"
            >
              <ScanLine className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Scan QR</span>
            </Button>
            {/* QR Code Generator might be less relevant here than in QRManagement */}
            {/* <QRCodeGenerator ... /> */}
          </div>
        </div>
      </div>

      {/* Tabs - Styling updated to match guide */}
      <Tabs
        value={activeView}
        onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: value as TransferView })}
        className="w-full mb-6"
      >
        <TabsList className="grid grid-cols-3 w-full h-10 border rounded-none bg-card">
          {(['incoming', 'outgoing', 'history'] as TransferView[]).map((view) => (
            <TabsTrigger
              key={view}
              value={view}
              className="text-xs uppercase tracking-wider rounded-none data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-foreground"
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
              {view === 'incoming' && incomingPendingCount > 0 && (
                <Badge
                  className="ml-2 px-1.5 py-0.5 h-5 min-w-[1.25rem] bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center"
                >
                  {incomingPendingCount}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filter Bar Card - Styling updated */}
      <Card className="mb-6 border-border shadow-none bg-card rounded-none">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="flex-grow w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeView} transfers... (name, SN, user)`}
                value={searchTerm}
                onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                className="pl-8 w-full rounded-none h-9"
              />
            </div>
          </div>
          <div className="w-full md:w-[180px]">
            <Select
              value={filterStatus}
              onValueChange={(value) => dispatch({ type: 'SET_FILTER_STATUS', payload: value as TransferStatusFilter })}
            >
              <SelectTrigger className="w-full rounded-none h-9 text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleResetFilters}
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-9 px-3 rounded-none hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="text-xs uppercase tracking-wider">Reset</span>
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Card - Transfer List */}
      <Card className="overflow-hidden border-border shadow-none bg-card rounded-none">
        <CardContent className="p-0">
          {sortedTransfers.length > 0 ? (
            <>
              <TransferListHeader />
              <ScrollArea className="h-[calc(100vh-450px)]"> {/* Adjust height as needed */}
                {sortedTransfers.map((transfer) => (
                  <TransferRow key={transfer.id} transfer={transfer} />
                ))}
              </ScrollArea>
            </>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      {/* --- Modals and Dialogs --- */}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScannerModal
          isOpen={showScanner}
          onClose={() => dispatch({ type: 'TOGGLE_SCANNER', payload: false })}
          onScan={handleScanComplete}
        />
      )}

      {/* New Transfer Dialog - Simplified */}
      <Dialog open={showNewTransfer} onOpenChange={(open) => dispatch({ type: 'TOGGLE_NEW_TRANSFER', payload: open })}>
        <DialogContent className="sm:max-w-md bg-card rounded-none">
          <DialogHeader>
            <DialogTitle>Initiate Equipment Transfer</DialogTitle>
            <DialogDescription>
              Create a new transfer request to reassign equipment.
            </DialogDescription>
          </DialogHeader>
          <form id="new-transfer-form" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleCreateTransfer({
              itemName: formData.get('item-name') as string || 'Unknown Item',
              serialNumber: formData.get('serial-number') as string || 'N/A',
              to: formData.get('to') as string || 'Unknown Recipient',
            });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input id="item-name" name="item-name" placeholder="e.g., M4A1 Carbine" className="rounded-none" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serial-number">Serial Number</Label>
                <Input id="serial-number" name="serial-number" placeholder="e.g., W123456" className="rounded-none" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="from">From (Current Holder)</Label>
                <Input id="from" value={currentUser} disabled className="bg-muted/50 rounded-none" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to">To (Recipient)</Label>
                <Input id="to" name="to" placeholder="e.g., SFC Smith, Anna" className="rounded-none" required />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" className="rounded-none" onClick={() => dispatch({ type: 'TOGGLE_NEW_TRANSFER', payload: false })}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="rounded-none" disabled={loadingStates['new-transfer']}>
                {loadingStates['new-transfer'] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Transfer Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Details Dialog - Enhanced */}
      <Dialog open={!!showTransferDetails} onOpenChange={(open) => !open && dispatch({ type: 'SHOW_DETAILS', payload: null })}>
        <DialogContent className="sm:max-w-lg bg-card rounded-none">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>
              Detailed information for Transfer ID: {showTransferDetails?.id}
            </DialogDescription>
          </DialogHeader>
          {showTransferDetails && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="mt-4 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">{showTransferDetails.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono tracking-wider">SN: {showTransferDetails.serialNumber}</p>
                    </div>
                    <StatusBadge status={showTransferDetails.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">From</p>
                      <p className="font-medium flex items-center">
                        {showTransferDetails.from}
                        {showTransferDetails.from === currentUser && <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4 rounded-sm border-current">You</Badge>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">To</p>
                      <p className="font-medium flex items-center">
                        {showTransferDetails.to}
                        {showTransferDetails.to === currentUser && <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4 rounded-sm border-current">You</Badge>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Request Date</p>
                      <p className="font-medium">{format(parseISO(showTransferDetails.date), 'ddMMMyyyy').toUpperCase()}, {format(parseISO(showTransferDetails.date), 'HH:mm')}</p>
                    </div>
                    {showTransferDetails.status === 'approved' && showTransferDetails.approvedDate && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Approved Date</p>
                        <p className="font-medium">{format(parseISO(showTransferDetails.approvedDate), 'ddMMMyyyy').toUpperCase()}, {format(parseISO(showTransferDetails.approvedDate), 'HH:mm')}</p>
                      </div>
                    )}
                    {showTransferDetails.status === 'rejected' && showTransferDetails.rejectedDate && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Rejected Date</p>
                        <p className="font-medium">{format(parseISO(showTransferDetails.rejectedDate), 'ddMMMyyyy').toUpperCase()}, {format(parseISO(showTransferDetails.rejectedDate), 'HH:mm')}</p>
                      </div>
                    )}
                    {showTransferDetails.status === 'rejected' && showTransferDetails.rejectionReason && (
                       <div className="col-span-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Rejection Reason</p>
                        <p className="font-medium text-destructive">{showTransferDetails.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Timeline - Enhanced */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Transfer Timeline</h4>
                  <div className="relative pl-6 space-y-4 border-l border-border ml-1.5">
                    {/* Requested */}
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-blue-500 border-2 border-card"></div>
                    <div>
                      <p className="text-sm font-medium">Transfer Requested</p>
                      <p className="text-xs text-muted-foreground">By {showTransferDetails.from} on {format(parseISO(showTransferDetails.date), 'ddMMMyyyy').toUpperCase()}, {format(parseISO(showTransferDetails.date), 'HH:mm')}</p>
                    </div>

                    {/* Approved/Rejected */}
                    {(showTransferDetails.status === 'approved' || showTransferDetails.status === 'rejected') && (
                      <>
                        <div className={`absolute -left-[7px] top-[calc(50%)] w-3 h-3 rounded-full border-2 border-card ${showTransferDetails.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="text-sm font-medium">Transfer {showTransferDetails.status.charAt(0).toUpperCase() + showTransferDetails.status.slice(1)}</p>
                          <p className="text-xs text-muted-foreground">
                            By {showTransferDetails.to === currentUser ? 'You' : showTransferDetails.to} on
                            {' '}
                            {showTransferDetails.approvedDate && `${format(parseISO(showTransferDetails.approvedDate), 'ddMMMyyyy').toUpperCase()}, ${format(parseISO(showTransferDetails.approvedDate), 'HH:mm')}`}
                            {showTransferDetails.rejectedDate && `${format(parseISO(showTransferDetails.rejectedDate), 'ddMMMyyyy').toUpperCase()}, ${format(parseISO(showTransferDetails.rejectedDate), 'HH:mm')}`}
                          </p>
                          {showTransferDetails.rejectionReason && <p className="text-xs text-destructive mt-1">Reason: {showTransferDetails.rejectionReason}</p>}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Item Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Item Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Simulate Link to Property Book */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-none"
                      onClick={() => toast({ title: "Navigate (Demo)", description: `Opening Property Book for SN: ${showTransferDetails.serialNumber}` })}
                    >
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" /> View in Property Book
                    </Button>

                    {/* Export Action */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-none"
                      onClick={() => handleExportTransfer(showTransferDetails.id)}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5" /> Export PDF
                    </Button>
                  </div>
                </div>

                 {/* QR Code (Optional) */}
                 {/*
                 <Separator className="bg-border" />
                 <div className="space-y-2">
                    <h4 className="text-sm font-medium">Item QR Code</h4>
                    <div className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto">
                      <QRCodeGenerator
                        itemName={showTransferDetails.name}
                        serialNumber={showTransferDetails.serialNumber}
                      />
                    </div>
                  </div>
                  */}

              </div>
            </ScrollArea>
          )}
          <DialogFooter className="mt-6 flex justify-between sm:justify-between">
             <Button variant="outline" className="rounded-none" onClick={() => dispatch({ type: 'SHOW_DETAILS', payload: null })}>
              Close
            </Button>

            {/* Contextual Actions (Approve/Reject in Details) */}
            {showTransferDetails?.status === "pending" && showTransferDetails.to === currentUser && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-none border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => dispatch({ type: 'CONFIRM_ACTION', payload: { id: showTransferDetails.id, action: 'reject' } })}
                  disabled={loadingStates[showTransferDetails.id]}
                >
                  {loadingStates[showTransferDetails.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Decline
                </Button>
                <Button
                  variant="default" // Use default (likely blue based on theme) or a specific green variant if defined
                  size="sm"
                  className="h-9 px-3 rounded-none bg-green-600 hover:bg-green-700 text-white" // Explicit green for accept
                  onClick={() => dispatch({ type: 'CONFIRM_ACTION', payload: { id: showTransferDetails.id, action: 'approve' } })}
                  disabled={loadingStates[showTransferDetails.id]}
                >
                  {loadingStates[showTransferDetails.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Accept
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={transferToConfirm ? true : undefined} onOpenChange={(open) => !open && dispatch({ type: 'CONFIRM_ACTION', payload: null })}>
        <AlertDialogContent className="bg-card rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {transferToConfirm?.action} this transfer request for item '{transfers.find(t => t.id === transferToConfirm?.id)?.name}'?
              {transferToConfirm?.action === 'reject' && ' This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none" onClick={() => dispatch({ type: 'CONFIRM_ACTION', payload: null })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={`rounded-none ${transferToConfirm?.action === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'}`}
              onClick={() => {
                if (transferToConfirm?.action === 'approve') {
                  handleApprove(transferToConfirm.id);
                } else if (transferToConfirm?.action === 'reject') {
                  // Maybe add a reason input here in future?
                  handleReject(transferToConfirm.id);
                }
              }}
              disabled={!!(transferToConfirm && loadingStates[transferToConfirm.id])}
            >
              {transferToConfirm && loadingStates[transferToConfirm.id] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                   transferToConfirm?.action === 'approve' ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />
              )}
              Confirm {transferToConfirm?.action?.charAt(0).toUpperCase()}{transferToConfirm?.action?.slice(1)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageWrapper>
  );
};

export default Transfers;
