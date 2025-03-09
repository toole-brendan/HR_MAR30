import { useState } from "react";
import { inventory as mockInventory, transfers as mockTransfers } from "@/lib/mockData";
import { InventoryItem, Transfer } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { PageWrapper } from "@/components/ui/page-wrapper";
import QRCodeGenerator from "@/components/common/QRCodeGenerator";
import TransferRequestModal from "@/components/modals/TransferRequestModal";
import { Search, Filter, ArrowDownUp, Info, ClipboardCheck, Calendar, ShieldCheck } from "lucide-react";

const PropertyBook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
  const { toast } = useToast();

  // Mock data for items signed out to others
  const signedOutItems = mockTransfers
    .filter(transfer => transfer.status === "approved" && transfer.from === "SSgt. John Doe")
    .map(transfer => ({
      id: transfer.id,
      name: transfer.name,
      serialNumber: transfer.serialNumber,
      assignedTo: transfer.to,
      transferDate: transfer.date,
      status: "active" as const,
    }));

  // Get items directly assigned to the user
  const assignedToMe = mockInventory;

  const getFilteredItems = (items: any[], tab: string) => {
    return items.filter(item => {
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tab === "signedout" && item.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return filterCategory === "all" 
        ? matchesSearch 
        : matchesSearch && getCategoryFromName(item.name) === filterCategory;
    });
  };

  // Simplified function to determine category from item name
  const getCategoryFromName = (name: string): string => {
    const nameLC = name.toLowerCase();
    if (nameLC.includes("helmet") || nameLC.includes("vest") || nameLC.includes("boots")) return "protective";
    if (nameLC.includes("knife") || nameLC.includes("carbine") || nameLC.includes("m4")) return "weapon";
    if (nameLC.includes("radio") || nameLC.includes("comm")) return "communication";
    if (nameLC.includes("goggles") || nameLC.includes("optic")) return "optics";
    if (nameLC.includes("medical") || nameLC.includes("first aid")) return "medical";
    if (nameLC.includes("backpack") || nameLC.includes("pack")) return "gear";
    return "other";
  };

  const handleTransferRequest = (item: InventoryItem) => {
    setSelectedItem(item);
    setTransferModalOpen(true);
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const getCategoryIcon = (name: string) => {
    const category = getCategoryFromName(name);
    
    switch (category) {
      case "protective":
        return <ShieldCheck className="h-5 w-5" />;
      case "weapon":
        return <Filter className="h-5 w-5" />;
      case "communication":
        return <ArrowDownUp className="h-5 w-5" />;
      case "optics":
        return <Search className="h-5 w-5" />;
      case "medical":
        return <ClipboardCheck className="h-5 w-5" />;
      case "gear":
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (name: string): string => {
    const category = getCategoryFromName(name);
    
    switch (category) {
      case "protective":
        return "bg-blue-700 dark:bg-blue-900";
      case "weapon":
        return "bg-red-700 dark:bg-red-900";
      case "communication":
        return "bg-green-700 dark:bg-green-900";
      case "optics":
        return "bg-purple-700 dark:bg-purple-900";
      case "medical":
        return "bg-amber-700 dark:bg-amber-900";
      case "gear":
        return "bg-slate-700 dark:bg-slate-900";
      default:
        return "bg-gray-700 dark:bg-gray-900";
    }
  };

  // Display options based on category
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "protective", label: "Protective Equipment" },
    { value: "weapon", label: "Weapons & Firearms" },
    { value: "communication", label: "Communication Devices" },
    { value: "optics", label: "Optics & Vision" },
    { value: "medical", label: "Medical Supplies" },
    { value: "gear", label: "Tactical Gear" },
    { value: "other", label: "Other Equipment" }
  ];

  // Actions for page header
  const actions = (
    <div className="flex gap-2">
      <QRCodeGenerator 
        itemName="Bulk Scan" 
        serialNumber="PROPERTY-BOOK"
        onGenerate={(qrValue) => {
          toast({
            title: "QR Code Generated",
            description: "Ready to scan multiple items"
          });
        }}
      />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          toast({
            title: "Export Generated",
            description: "Property book report has been generated"
          });
        }}
      >
        Export Report
      </Button>
    </div>
  );

  return (
    <PageWrapper withPadding={true}>
      {/* Header section with 8VC style formatting */}
      <div className="mb-6 sm:mb-7 md:mb-8">
        {/* Category label - Small all-caps category label */}
        <div className="text-category-tag mb-1 text-muted-foreground">
          EQUIPMENT
        </div>
        
        {/* Main title - following 8VC typography */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-1">Property Book</h1>
            <p className="text-subtitle text-muted-foreground">View your assigned equipment and items signed down to others</p>
          </div>
          {actions}
        </div>
        
        {/* Subtle horizontal divider */}
        <div className="horizontal-divider mt-6"></div>
      </div>
      
      <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 rounded-none bg-gray-50 dark:bg-white/5 h-10">
          <TabsTrigger value="assigned" className="uppercase tracking-wider text-xs font-medium rounded-none">
            Assigned to Me
          </TabsTrigger>
          <TabsTrigger value="signedout" className="uppercase tracking-wider text-xs font-medium rounded-none">
            Signed Down to Others
          </TabsTrigger>
        </TabsList>

        {/* Common Filters */}
        <div className="mb-6">
          <div className="text-section-header mb-4 text-muted-foreground">
            SEARCH & FILTERS
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, serial number or assignee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-full md:w-64">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Assigned to Me Tab */}
        <TabsContent value="assigned">
          <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  PERSONAL EQUIPMENT
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Items Assigned to Me
                </div>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-white/10">
                {getFilteredItems(assignedToMe, "assigned").length === 0 ? (
                  <div className="py-6 text-center text-gray-500 dark:text-gray-400">No items found</div>
                ) : (
                  getFilteredItems(assignedToMe, "assigned").map((item) => (
                    <div key={item.id} className="py-4 px-4 flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className={`h-10 w-10 ${getCategoryColor(item.name)} rounded-full flex items-center justify-center text-white`}>
                          {getCategoryIcon(item.name)}
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium tracking-tight">{item.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center text-xs tracking-wide uppercase text-gray-500 dark:text-gray-400">
                            <span className="font-mono">SN: {item.serialNumber}</span>
                            <span className="hidden sm:inline mx-2">•</span>
                            <span>Assigned: {item.assignedDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTransferRequest(item)}
                          className="text-xs uppercase tracking-wider rounded-none border-gray-200 dark:border-white/10"
                        >
                          Transfer
                        </Button>
                        <QRCodeGenerator 
                          itemName={item.name} 
                          serialNumber={item.serialNumber}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                          className="text-xs uppercase tracking-wider rounded-none border-gray-200 dark:border-white/10"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <div className="px-4 py-2 border-t border-gray-200 dark:border-white/10">
              <div className="text-xs tracking-wide text-muted-foreground">
                {getFilteredItems(assignedToMe, "assigned").length} items displayed • Last updated: Today, 08:30
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Signed Out to Others Tab */}
        <TabsContent value="signedout">
          <Card className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
            <div className="p-4 flex justify-between items-baseline">
              <div>
                <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
                  SIGNED-DOWN EQUIPMENT
                </div>
                <div className="text-lg font-normal text-gray-900 dark:text-white">
                  Items Signed to Others
                </div>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 dark:border-white/10">
                      <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Item</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Serial Number</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Signed To</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredItems(signedOutItems, "signedout").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-6">
                          No items signed out to others
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredItems(signedOutItems, "signedout").map((item) => (
                        <TableRow key={item.id} className="border-b border-gray-200 dark:border-white/10">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className={`h-8 w-8 ${getCategoryColor(item.name)} rounded-full flex items-center justify-center text-white mr-2`}>
                                {getCategoryIcon(item.name)}
                              </div>
                              {item.name}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                          <TableCell>{item.assignedTo}</TableCell>
                          <TableCell>{item.transferDate}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30 uppercase text-[10px] tracking-wider font-medium rounded-none">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Verification Requested",
                                    description: `Request sent to ${item.assignedTo}`
                                  });
                                }}
                                className="text-xs uppercase tracking-wider rounded-none border-gray-200 dark:border-white/10"
                              >
                                Verify
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Item Recalled",
                                    description: `Recall notice sent to ${item.assignedTo}`
                                  });
                                }}
                                className="text-xs uppercase tracking-wider rounded-none border-gray-200 dark:border-white/10"
                              >
                                Recall
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <div className="px-4 py-2 border-t border-gray-200 dark:border-white/10">
              <div className="text-xs tracking-wide text-muted-foreground">
                {getFilteredItems(signedOutItems, "signedout").length} items displayed • Last updated: Today, 08:30
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Request Modal */}
      {selectedItem && (
        <TransferRequestModal 
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          itemName={selectedItem.name}
          serialNumber={selectedItem.serialNumber}
        />
      )}

      {/* Details Modal */}
      {selectedItem && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none">
            <DialogHeader className="border-b border-gray-200 dark:border-white/10 pb-4">
              <div className="text-category-tag mb-1 text-muted-foreground">
                EQUIPMENT DETAILS
              </div>
              <DialogTitle className="font-normal text-xl tracking-tight">{selectedItem.name}</DialogTitle>
              <DialogDescription className="text-sm tracking-wide text-muted-foreground mt-1">
                Serial number: <span className="font-mono">{selectedItem.serialNumber}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Category</p>
                  <p className="capitalize text-sm font-medium">{getCategoryFromName(selectedItem.name)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                  <p className="capitalize text-sm font-medium">{selectedItem.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Assigned Date</p>
                  <p className="text-sm font-medium">{selectedItem.assignedDate}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Last Inspection</p>
                  <p className="text-sm font-medium">Feb 28, 2024</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-white/10">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Current Hand Receipt Path</p>
                <div className="text-sm font-medium space-y-1 flex flex-col">
                  <span>Battalion → Company → Platoon → Squad → You</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-white/10">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Service History</p>
                <ul className="text-sm font-medium space-y-1">
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 bg-gray-500 dark:bg-gray-400 rounded-full mr-2"></span>
                    Maintenance check (Jan 2024)
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 bg-gray-500 dark:bg-gray-400 rounded-full mr-2"></span>
                    Issued to current holder (Dec 2023)
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 bg-gray-500 dark:bg-gray-400 rounded-full mr-2"></span>
                    Inventory verification (Oct 2023)
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-200 dark:border-white/10 pt-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setDetailsModalOpen(false);
                  toast({
                    title: "History Exported",
                    description: "Item history has been exported to PDF"
                  });
                }}
                className="text-xs uppercase tracking-wider rounded-none border-gray-200 dark:border-white/10"
              >
                Export History
              </Button>
              <Button 
                size="sm"
                className="text-xs uppercase tracking-wider rounded-none bg-primary hover:bg-primary-600"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setTransferModalOpen(true);
                }}
              >
                Transfer Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default PropertyBook;