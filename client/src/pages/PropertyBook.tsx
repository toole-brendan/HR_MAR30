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
      <PageHeader
        title="Property Book"
        description="View your assigned equipment and items signed down to others"
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />
      
      <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="signedout">Signed Down to Others</TabsTrigger>
        </TabsList>

        {/* Common Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search by name, serial number or assignee"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="w-full md:w-64">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
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

        {/* Assigned to Me Tab */}
        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Assigned to Me</CardTitle>
              <CardDescription>All equipment directly assigned to you on your hand receipt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredItems(assignedToMe, "assigned").length === 0 ? (
                  <div className="py-4 text-center text-gray-500 dark:text-gray-400">No items found</div>
                ) : (
                  getFilteredItems(assignedToMe, "assigned").map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className={`h-10 w-10 ${getCategoryColor(item.name)} rounded-full flex items-center justify-center text-white`}>
                          {getCategoryIcon(item.name)}
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 dark:text-gray-400">
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
                          className="flex items-center space-x-1"
                        >
                          <span>Transfer</span>
                        </Button>
                        <QRCodeGenerator 
                          itemName={item.name} 
                          serialNumber={item.serialNumber}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                          className="flex items-center space-x-1"
                        >
                          <span>Details</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signed Out to Others Tab */}
        <TabsContent value="signedout">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Signed Down to Others</CardTitle>
              <CardDescription>Track equipment you've signed out to subordinates or other units</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Signed To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredItems(signedOutItems, "signedout").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                        No items signed out to others
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredItems(signedOutItems, "signedout").map((item) => (
                      <TableRow key={item.id}>
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
                          <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30">
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
            </CardContent>
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Equipment Details</DialogTitle>
              <DialogDescription>
                Detailed information about this military equipment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="border-b pb-2">
                <h3 className="font-medium text-lg">{selectedItem.name}</h3>
                <p className="text-sm font-mono">SN: {selectedItem.serialNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Category</p>
                  <p className="capitalize">{getCategoryFromName(selectedItem.name)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className="capitalize">{selectedItem.status}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Assigned Date</p>
                  <p>{selectedItem.assignedDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Inspection</p>
                  <p>Feb 28, 2024</p>
                </div>
              </div>
              <div className="border-t pt-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Current Hand Receipt Path</p>
                <div className="text-sm space-y-1 mt-1 flex flex-col">
                  <span>Battalion → Company → Platoon → Squad → You</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Service History</p>
                <ul className="text-sm space-y-1 mt-1">
                  <li>- Maintenance check (Jan 2024)</li>
                  <li>- Issued to current holder (Dec 2023)</li>
                  <li>- Inventory verification (Oct 2023)</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
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
              >
                Export History
              </Button>
              <Button 
                size="sm" 
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