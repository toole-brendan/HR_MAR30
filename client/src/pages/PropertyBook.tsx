import { useState, useEffect, useMemo } from "react";
import { transfers as mockTransfers } from "@/lib/mockData";
import { InventoryItem, Transfer, Component } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { getInventoryItemsFromDB, saveInventoryItemsToDB } from "@/lib/idb";
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
import ComponentList from "@/components/inventory/ComponentList";
import { 
  Search, 
  Filter, 
  ArrowDownUp, 
  ArrowLeftRight,
  Info, 
  ClipboardCheck, 
  Calendar, 
  ShieldCheck, 
  Send, 
  CheckCircle,
  FileText
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import BulkActionMenu from "@/components/shared/BulkActionMenu";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyBookProps {
  id?: string;
}

const PropertyBook: React.FC<PropertyBookProps> = ({ id }) => {
  const [propertyBookItems, setPropertyBookItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getInventoryItemsFromDB();
        setPropertyBookItems(items);
        console.log(`Loaded ${items.length} property book items from IndexedDB.`);
      } catch (err) {
        console.error("Failed to load property book items from IndexedDB:", err);
        setError("Failed to load property book data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  type DisplayItem = InventoryItem & { 
    assignedTo?: string; 
    transferDate?: string; 
  };

  const assignedToMe: DisplayItem[] = propertyBookItems;
  const signedOutItems: DisplayItem[] = useMemo(() => {
    return mockTransfers
      .filter(transfer => transfer.status === "approved")
      .map(transfer => {
        const originalItem = propertyBookItems.find(i => i.serialNumber === transfer.serialNumber);
        return {
          ...(originalItem || {}),
          id: originalItem?.id || transfer.id,
          name: transfer.name,
          serialNumber: transfer.serialNumber,
          status: "active" as const,
          assignedTo: transfer.to,
          transferDate: transfer.date,
          assignedDate: originalItem?.assignedDate || transfer.date,
          components: originalItem?.components || [],
          isComponent: originalItem?.isComponent || false,
          parentItemId: originalItem?.parentItemId,
        }
      });
  }, [propertyBookItems]);

  const getFilteredItems = (items: DisplayItem[], tab: string): DisplayItem[] => {
    return items.filter(item => {
      const name = item.name || '';
      const serialNumber = item.serialNumber || '';
      const assignedTo = (tab === "signedout" && item.assignedTo) ? item.assignedTo.toLowerCase() : '';
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch = 
        name.toLowerCase().includes(searchTermLower) ||
        serialNumber.toLowerCase().includes(searchTermLower) ||
        (tab === "signedout" && assignedTo.includes(searchTermLower));
      
      const category = getCategoryFromName(name);
      const matchesCategory = filterCategory === "all" || category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const getCategoryFromName = (name: string): string => {
    if (!name) return 'other';
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

  const handleAddComponent = async (newComponentData: Omit<Component, 'id'>) => {
    if (!selectedItem) return;
    const newComponent: Component = { ...newComponentData, id: uuidv4() };
    const updatedItem = {
      ...selectedItem,
      components: [...(selectedItem.components || []), newComponent],
    };
    setSelectedItem(updatedItem);
    try {
      await updateItemInDb(updatedItem);
      toast({ title: "Component Added", description: `${newComponent.name} added.` });
    } catch (err) {
      console.error("Failed to add component:", err);
      toast({ title: "Error", description: "Failed to save component changes.", variant: "destructive" });
      setSelectedItem(selectedItem);
    }
  };

  const handleUpdateComponent = async (updatedComponent: Component) => {
    if (!selectedItem || !selectedItem.components) return;
    const updatedComponents = selectedItem.components.map(comp =>
      comp.id === updatedComponent.id ? updatedComponent : comp
    );
    const updatedItem = { ...selectedItem, components: updatedComponents };
    setSelectedItem(updatedItem);
    try {
      await updateItemInDb(updatedItem);
      toast({ title: "Component Updated", description: `${updatedComponent.name} updated.` });
    } catch (err) {
      console.error("Failed to update component:", err);
      toast({ title: "Error", description: "Failed to save component changes.", variant: "destructive" });
      setSelectedItem(selectedItem);
    }
  };

  const handleRemoveComponent = async (componentId: string) => {
    if (!selectedItem || !selectedItem.components) return;
    const componentToRemove = selectedItem.components.find(c => c.id === componentId);
    const updatedComponents = selectedItem.components.filter(comp => comp.id !== componentId);
    const updatedItem = { ...selectedItem, components: updatedComponents };
    setSelectedItem(updatedItem);
    try {
      await updateItemInDb(updatedItem);
      toast({ title: "Component Removed", description: `${componentToRemove?.name || 'Component'} removed.` });
    } catch (err) {
      console.error("Failed to remove component:", err);
      toast({ title: "Error", description: "Failed to save component changes.", variant: "destructive" });
      setSelectedItem(selectedItem);
    }
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

  const actions = (
    <div className="flex gap-2">
      <Button 
        variant="default"
        size="sm"
        className="text-xs uppercase tracking-wider flex items-center gap-1.5"
        onClick={() => {
          toast({
            title: "Export Generated",
            description: "Property book report has been generated"
          });
        }}
      >
        <FileText className="h-4 w-4" />
        EXPORT REPORT
      </Button>
      <QRCodeGenerator 
        itemName={activeTab === 'assigned' ? "My Property" : "Signed Out Items"} 
        serialNumber={`PROPERTY-BOOK-${activeTab.toUpperCase()}`}
        onGenerate={(qrValue) => {
          toast({
            title: "QR Code Generated",
            description: `Ready to scan ${activeTab === 'assigned' ? 'your' : 'signed out'} items`
          });
        }}
      />
    </div>
  );

  useEffect(() => {
    if (!isLoading && id) {
      const assignedItem = propertyBookItems.find(item => item.id === id);
      const signedOutItemDetails = signedOutItems.find(item => item.id === id); 
      
      let itemToSelect: DisplayItem | null = null;
      if (assignedItem) { itemToSelect = assignedItem; } 
      else if (signedOutItemDetails) { itemToSelect = signedOutItemDetails; }

      if (itemToSelect) {
        const finalSelectedItem: InventoryItem = {
           id: itemToSelect.id,
           name: itemToSelect.name,
           serialNumber: itemToSelect.serialNumber,
           assignedDate: itemToSelect.assignedDate || '',
           status: itemToSelect.status,
           components: itemToSelect.components || [],
           isComponent: itemToSelect.isComponent || false,
           parentItemId: itemToSelect.parentItemId
        };
        setSelectedItem(finalSelectedItem);
        setDetailsModalOpen(true);
      }
    }
  }, [id, propertyBookItems, signedOutItems, isLoading]);

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

  const getCurrentTabItems = () => {
    return activeTab === 'assigned' ? assignedToMe : signedOutItems;
  };
  const currentFilteredItems = getFilteredItems(getCurrentTabItems(), activeTab);

  const handleSelectAllChange = (checked: boolean) => {
    const currentTabItemIds = currentFilteredItems.map(item => item.id);
    if (checked) {
      setSelectedItemIds(prev => new Set([...Array.from(prev), ...currentTabItemIds]));
    } else {
      setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        currentTabItemIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };

  const allFilteredInTabSelected = currentFilteredItems.length > 0 && 
                                 currentFilteredItems.every(item => selectedItemIds.has(item.id));
  const isIndeterminate = currentFilteredItems.some(item => selectedItemIds.has(item.id)) && !allFilteredInTabSelected;

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action triggered: ${action}`, { selectedIds: Array.from(selectedItemIds) });
    toast({
      title: `Bulk Action: ${action}`,
      description: `Triggered for ${selectedItemIds.size} items. (Implementation Pending)`,
    });
  };

  const updateItemInDb = async (updatedItem: InventoryItem) => {
    const currentItems = await getInventoryItemsFromDB(); 
    const updatedItems = currentItems.map(item => item.id === updatedItem.id ? updatedItem : item);
    await saveInventoryItemsToDB(updatedItems);
    setPropertyBookItems(updatedItems);
    console.log(`Item ${updatedItem.id} updated in IndexedDB.`);
  };

  const renderTable = (items: DisplayItem[], tab: string) => {
    const filtered = getFilteredItems(items, tab);
    const allSelected = filtered.length > 0 && filtered.every(item => selectedItemIds.has(item.id));
    const indeterminate = filtered.some(item => selectedItemIds.has(item.id)) && !allSelected;

    return (
      <>
        {isLoading && (
           <div className="space-y-2 p-4">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
           </div>
        )}
        {error && (
          <div className="p-4 text-center text-red-600">Error: {error}</div>
        )}
        {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] px-2">
                     <Checkbox 
                        id={`select-all-${tab}`}
                        checked={allSelected}
                        onCheckedChange={handleSelectAllChange}
                        aria-label={`Select all items in ${tab} tab`}
                        data-state={indeterminate ? 'indeterminate' : (allSelected ? 'checked' : 'unchecked')}
                     />
                  </TableHead>
                  <TableHead className="w-[80px]">Icon</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Serial Number</TableHead>
                  {tab === 'assigned' ? (
                    <TableHead>Assigned Date</TableHead>
                  ) : (
                    <TableHead>Assigned To</TableHead>
                  )}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No items found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow 
                       key={item.id}
                       data-state={selectedItemIds.has(item.id) ? 'selected' : ''}
                       className="data-[state=selected]:bg-blue-50/70 dark:data-[state=selected]:bg-blue-900/20"
                     >
                       <TableCell className="px-2">
                          <Checkbox 
                             id={`select-${item.id}`}
                             checked={selectedItemIds.has(item.id)}
                             onCheckedChange={() => handleSelectionChange(item.id)}
                             aria-labelledby={`item-label-${item.id}`}
                          />
                       </TableCell>
                       <TableCell>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${getCategoryColor(item.name)}`}>
                          {getCategoryIcon(item.name)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div id={`item-label-${item.id}`} className="font-medium">{item.name}</div>
                        {item.components && item.components.length > 0 && (
                          <div className="text-xs text-muted-foreground">{item.components.length} Component(s)</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{item.serialNumber}</span>
                      </TableCell>
                      {tab === 'assigned' ? (
                         <TableCell>{item.assignedDate}</TableCell> 
                      ) : (
                         <TableCell>{item.assignedTo}</TableCell> 
                      )}
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`text-[10px] uppercase tracking-wider font-medium rounded-none ${item.status === "active" ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-500 border border-green-200 dark:border-green-700/50" : item.status === "pending" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-200 dark:border-amber-700/50" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500 border border-blue-200 dark:border-blue-700/50"}`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end items-center gap-1">
                          {tab === 'assigned' && (
                            <Button variant="ghost" size="sm" onClick={() => handleTransferRequest(item as InventoryItem)} className="flex items-center gap-1 h-8 px-2 text-xs">
                              <ArrowLeftRight className="h-3.5 w-3.5"/>
                              <span>Transfer</span>
                            </Button>
                          )}
                          {tab === 'signedout' && (
                             <Button variant="ghost" size="sm" onClick={() => toast({title: "Recall Action", description: "Recall workflow initiated for "+item.name})} className="flex items-center gap-1 h-8 px-2 text-xs">
                              <CheckCircle className="h-3.5 w-3.5"/>
                              <span>Recall</span>
                            </Button>
                          )}
                          <QRCodeGenerator 
                            itemName={item.name} 
                            serialNumber={item.serialNumber}
                          />
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item as InventoryItem)} className="flex items-center gap-1 h-8 px-2 text-xs">
                            <Info className="h-3.5 w-3.5"/>
                            <span>Details</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
      </>
    );
  };

  return (
    <PageWrapper withPadding={true}>
      <div className="pt-16 pb-10">
        <div className="text-xs uppercase tracking-wider font-medium mb-1 text-muted-foreground">
          EQUIPMENT
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-1">Property Book</h1>
            <p className="text-sm text-muted-foreground">View your assigned equipment and items signed down to others</p>
          </div>
          {actions}
        </div>
      </div>
      
      <BulkActionMenu 
        selectedItemCount={selectedItemIds.size} 
        onActionTriggered={handleBulkAction} 
      />

      <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 rounded-none bg-gray-50 dark:bg-white/5 h-10">
          <TabsTrigger value="assigned" className="uppercase tracking-wider text-xs font-medium rounded-none">
            Assigned to Me
          </TabsTrigger>
          <TabsTrigger value="signedout" className="uppercase tracking-wider text-xs font-medium rounded-none">
            Signed Down to Others
          </TabsTrigger>
        </TabsList>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider font-medium mb-4 text-muted-foreground">
            SEARCH & FILTERS
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder={`Search ${activeTab === 'assigned' ? 'assigned items' : 'signed out items'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none h-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-full md:w-64">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-white dark:bg-black border-gray-200 dark:border-white/10 rounded-none h-9">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                   {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="assigned">
          <Card className="rounded-none shadow-none border border-gray-200 dark:border-white/10 bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="text-base font-medium">Assigned to Me</CardTitle>
              <CardDescription className="text-sm">Equipment currently under your direct responsibility.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderTable(assignedToMe, "assigned")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signedout">
          <Card className="rounded-none shadow-none border border-gray-200 dark:border-white/10 bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="text-base font-medium">Signed Down to Others</CardTitle>
              <CardDescription className="text-sm">Equipment you have signed out to subordinates.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderTable(signedOutItems, "signedout")}
            </CardContent>
          </Card>
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
          <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Equipment Details</DialogTitle>
              <DialogDescription>
                Detailed information for {selectedItem.name} (SN: {selectedItem.serialNumber})
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-6 border-b pb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Category</p>
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-xs ${getCategoryColor(selectedItem.name)}`}>
                      {getCategoryIcon(selectedItem.name)}
                    </div>
                    <span className="capitalize">{getCategoryFromName(selectedItem.name)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <Badge 
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wider font-medium rounded-none ${selectedItem.status === "active" ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-500 border border-green-200 dark:border-green-700/50" : selectedItem.status === "pending" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-200 dark:border-amber-700/50" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500 border border-blue-200 dark:border-blue-700/50"}`}
                  >
                    {selectedItem.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Assigned Date</p>
                  <p>{selectedItem.assignedDate || "N/A"}</p>
                </div>
              </div>

              <div className="mb-4">
                 <ComponentList 
                   itemId={selectedItem.id}
                   components={selectedItem.components || []} 
                   onAddComponent={handleAddComponent}
                   onUpdateComponent={handleUpdateComponent}
                   onRemoveComponent={handleRemoveComponent}
                 />
               </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default PropertyBook;