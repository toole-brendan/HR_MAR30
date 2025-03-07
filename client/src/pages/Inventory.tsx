import { useState } from "react";
import { inventory } from "@/lib/mockData";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "@/components/common/QRCodeGenerator";
import TransferRequestModal from "@/components/modals/TransferRequestModal";
import { PageHeader } from "@/components/ui/page-header";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Search, Filter, Plus } from "lucide-react";

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<{id: string, name: string, serialNumber: string} | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return filterStatus === "all" 
      ? matchesSearch 
      : matchesSearch && item.status === filterStatus;
  });

  const handleTransferRequest = (item: {id: string, name: string, serialNumber: string}) => {
    setSelectedItem(item);
    setTransferModalOpen(true);
  };

  const handleViewDetails = (item: {id: string, name: string, serialNumber: string}) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  // Page actions for consistent header layout
  const actions = (
    <Button size="sm" className="flex items-center gap-1">
      <Plus className="h-4 w-4" />
      <span>Add New Equipment</span>
    </Button>
  );

  return (
    <PageWrapper withPadding={true}>
      <PageHeader
        title="Inventory"
        description="Track and manage your military equipment"
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
          <CardDescription>View and manage your assigned equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name or serial number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInventory.length === 0 ? (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400">No items found</div>
            ) : (
              filteredInventory.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div className="h-10 w-10 bg-[#4B5320] dark:bg-[#5A6433] rounded-full flex items-center justify-center text-white">
                      <Filter className="h-5 w-5" />
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
                  <p>Tactical Equipment</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p>Active</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Assigned Date</p>
                  <p>Mar 15, 2024</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Inspection</p>
                  <p>Feb 28, 2024</p>
                </div>
              </div>
              <div className="border-t pt-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Service History</p>
                <ul className="text-sm space-y-1 mt-1">
                  <li>- Maintenance check (Jan 2024)</li>
                  <li>- Battery replacement (Dec 2023)</li>
                  <li>- Firmware update (Oct 2023)</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default Inventory;
