import { useState, useEffect } from "react";
import { InventoryItem, Component } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { getInventoryItemsFromDB, saveInventoryItemsToDB } from "@/lib/idb";
import { seedDatabase } from "@/lib/seedDB";
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
import { Search, Filter, Plus, Package } from "lucide-react";
import ComponentList from "@/components/inventory/ComponentList";
import { Checkbox } from "@/components/ui/checkbox";
import BulkActionMenu from "@/components/shared/BulkActionMenu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsumablesManager from "@/components/consumables/ConsumablesManager";

interface InventoryProps {
  id?: string;
}

const Inventory: React.FC<InventoryProps> = ({ id }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("equipment");
  const { toast } = useToast();

  useEffect(() => {
    // Seed the database with initial data if needed
    seedDatabase();
    
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getInventoryItemsFromDB();
        setInventory(items);
        console.log(`Loaded ${items.length} inventory items from IndexedDB.`);
      } catch (err) {
        console.error("Failed to load inventory from IndexedDB:", err);
        setError("Failed to load inventory data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveCurrentInventory = async () => {
      if (inventory.length > 0) {
        try {
          await saveInventoryItemsToDB(inventory);
          console.log("Inventory changes saved to IndexedDB.");
        } catch(err) {
          console.error("Failed to save inventory changes to IndexedDB:", err);
          toast({ title: "Sync Error", description: "Failed to save local changes.", variant: "destructive" });
        }
      }
    };

    if (!isLoading) {
      saveCurrentInventory();
    }
  }, [inventory, isLoading, toast]);

  useEffect(() => {
    if (!isLoading && id) {
      const item = inventory.find(item => item.id === id);
      if (item) {
        setSelectedItem(item);
        setDetailsModalOpen(true);
      }
    }
  }, [id, inventory, isLoading]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return filterStatus === "all" 
      ? matchesSearch 
      : matchesSearch && item.status === filterStatus;
  });

  const handleSelectionChange = (itemId: string) => {
    setSelectedItemIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(itemId)) {
        newSelectedIds.delete(itemId);
      } else {
        newSelectedIds.add(itemId);
      }
      return newSelectedIds;
    });
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedItemIds(new Set(filteredInventory.map(item => item.id)));
    } else {
      setSelectedItemIds(new Set());
    }
  };

  const allFilteredSelected = filteredInventory.length > 0 && selectedItemIds.size === filteredInventory.length && 
                            filteredInventory.every(item => selectedItemIds.has(item.id));
  const isIndeterminate = selectedItemIds.size > 0 && !allFilteredSelected;

  const handleTransferRequest = (item: InventoryItem) => {
    setSelectedItem(item);
    setTransferModalOpen(true);
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const handleAddComponent = (newComponentData: Omit<Component, 'id'>) => {
    if (!selectedItem) return;

    const newComponent: Component = {
      ...newComponentData,
      id: uuidv4(),
    };

    const updatedItem = {
      ...selectedItem,
      components: [...(selectedItem.components || []), newComponent],
    };

    setSelectedItem(updatedItem);
    setInventory(prevInventory => 
      prevInventory.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    toast({ title: "Component Added", description: `${newComponent.name} added.` });
  };

  const handleUpdateComponent = (updatedComponent: Component) => {
    if (!selectedItem || !selectedItem.components) return;

    const updatedComponents = selectedItem.components.map(comp =>
      comp.id === updatedComponent.id ? updatedComponent : comp
    );

    const updatedItem = {
      ...selectedItem,
      components: updatedComponents,
    };

    setSelectedItem(updatedItem);
    setInventory(prevInventory => 
      prevInventory.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    toast({ title: "Component Updated", description: `${updatedComponent.name} updated.` });
  };

  const handleRemoveComponent = (componentId: string) => {
    if (!selectedItem || !selectedItem.components) return;

    const componentToRemove = selectedItem.components.find(c => c.id === componentId);
    const updatedComponents = selectedItem.components.filter(comp => comp.id !== componentId);

    const updatedItem = {
      ...selectedItem,
      components: updatedComponents,
    };

    setSelectedItem(updatedItem);
    setInventory(prevInventory => 
      prevInventory.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    toast({ title: "Component Removed", description: `${componentToRemove?.name || 'Component'} removed.` });
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action triggered: ${action}`, { selectedIds: Array.from(selectedItemIds) });
    toast({
      title: `Bulk Action: ${action}`,
      description: `Triggered for ${selectedItemIds.size} items. (Implementation Pending)`,
    });
  };

  const actions = (
    <div className="flex gap-2">
      <Button size="sm" className="flex items-center gap-1">
        <Plus className="h-4 w-4" />
        <span>Add New Equipment</span>
      </Button>
    </div>
  );

  return (
    <PageWrapper withPadding={true}>
      <PageHeader
        title="Inventory"
        description="Track and manage your military equipment and consumables"
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full rounded-none bg-gray-50 dark:bg-white/5 h-10 mb-6">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="consumables">Consumables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="equipment">
          <BulkActionMenu 
            selectedItemCount={selectedItemIds.size} 
            onActionTriggered={handleBulkAction} 
          />

          <Card>
            <CardHeader>
              <CardTitle>Equipment Inventory</CardTitle>
              <CardDescription>View and manage your assigned equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by name or serial number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9">
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

              {isLoading && (
                <div className="space-y-3 py-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}

              {!isLoading && error && (
                <div className="py-8 text-center text-red-500">
                  <p>{error}</p>
                  <p className="text-sm mt-1">Please try again later</p>
                </div>
              )}

              {!isLoading && !error && (
                <div className="rounded-md border">
                  {/* Selection header */}
                  <div className="bg-muted/30 py-2 px-4 flex items-center">
                    <Checkbox 
                      id="select-all"
                      checked={allFilteredSelected} 
                      onCheckedChange={handleSelectAllChange}
                      aria-label="Select all items"
                      className="mr-2"
                      data-indeterminate={isIndeterminate}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium flex-1">
                      {selectedItemIds.size > 0 
                        ? `${selectedItemIds.size} item${selectedItemIds.size > 1 ? 's' : ''} selected` 
                        : 'Select all items'}
                    </label>
                  </div>

                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredInventory.length === 0 ? (
                      <div className="py-8 text-center text-gray-500 dark:text-gray-400">No items found</div>
                    ) : (
                      filteredInventory.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${
                            selectedItemIds.has(item.id) ? 'bg-blue-50/70 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-center flex-grow py-4 pl-4 pr-2 sm:pr-4">
                            <Checkbox 
                              id={`select-${item.id}`}
                              checked={selectedItemIds.has(item.id)} 
                              onCheckedChange={() => handleSelectionChange(item.id)}
                              aria-labelledby={`item-label-${item.id}`}
                              className="mr-4" 
                            />
                            <div className="h-10 w-10 bg-[#4B5320] dark:bg-[#5A6433] rounded-full flex items-center justify-center text-white flex-shrink-0">
                              <Filter className="h-5 w-5" />
                            </div>
                            <div className="ml-4 flex-grow min-w-0">
                              <h4 id={`item-label-${item.id}`} className="font-medium truncate">{item.name}</h4>
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                                <span className="font-mono mr-2 sm:mr-0">SN: {item.serialNumber}</span>
                                <span className="hidden sm:inline mx-2">•</span>
                                <span className="mr-2 sm:mr-0">Assigned: {item.assignedDate}</span>
                                {item.components && item.components.length > 0 && (
                                  <><span className="hidden sm:inline mx-2">•</span><span>{item.components.length} Comp.</span></>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2 justify-end items-center pb-4 pr-4 sm:pb-0 sm:pr-2 sm:pl-0 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleTransferRequest(item)}
                              className="flex items-center space-x-1 text-xs px-2 h-8"
                            >
                              <span>Transfer</span>
                            </Button>
                            <QRCodeGenerator 
                              itemName={item.name} 
                              serialNumber={item.serialNumber}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDetails(item)}
                              className="flex items-center space-x-1 text-xs px-2 h-8"
                            >
                              <span>Details</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="consumables">
          <ConsumablesManager />
        </TabsContent>
      </Tabs>
      
      {selectedItem && (
        <TransferRequestModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          itemName={selectedItem.name}
          serialNumber={selectedItem.serialNumber}
        />
      )}

      {selectedItem && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
              <DialogDescription>View detailed information about this item</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="border-b pb-2 mb-4">
                <h3 className="font-medium text-lg">{selectedItem.name}</h3>
                <p className="text-sm font-mono">SN: {selectedItem.serialNumber}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Category</p>
                  <p>Equipment</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className="capitalize font-medium">
                    {selectedItem.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Assigned Date</p>
                  <p>{selectedItem.assignedDate}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <ComponentList 
                  itemId={selectedItem.id}
                  components={selectedItem.components || []} 
                  onAddComponent={handleAddComponent}
                  onUpdateComponent={handleUpdateComponent}
                  onRemoveComponent={handleRemoveComponent}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default Inventory;
