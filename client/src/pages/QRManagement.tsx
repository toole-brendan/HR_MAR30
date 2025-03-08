import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Printer, QrCode, RefreshCw, AlertTriangle, Plus, Tag, ArrowUpDown, Filter, Search, X } from "lucide-react";
import QRCodeGenerator from "@/components/common/QRCodeGenerator";
import { inventory } from "@/lib/mockData";
import { InventoryItem } from "@/types";

// Interface for QR code item
interface QRCodeItem extends InventoryItem {
  qrCodeStatus: "active" | "damaged" | "missing" | "replaced";
  lastPrinted?: string;
  lastUpdated?: string;
}

// Mock data for QR code items based on inventory items
const mockQRItems: QRCodeItem[] = inventory.map((item) => ({
  ...item,
  qrCodeStatus: Math.random() > 0.8 ? "damaged" as const : "active" as const,
  lastPrinted: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
  lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}));

const QRManagement = () => {
  const [qrItems, setQrItems] = useState<QRCodeItem[]>(mockQRItems);
  const [filteredItems, setFilteredItems] = useState<QRCodeItem[]>(mockQRItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QRCodeItem | null>(null);
  const [newItemInfo, setNewItemInfo] = useState({ name: "", serialNumber: "" });
  const [reportReason, setReportReason] = useState("");
  const { toast } = useToast();
  // Apply filters
  useEffect(() => {
    let result = qrItems;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (item) => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => item.qrCodeStatus === statusFilter);
    }
    
    setFilteredItems(result);
  }, [qrItems, searchTerm, statusFilter]);

  // Handle opening the report dialog
  const handleOpenReportDialog = (item: QRCodeItem) => {
    setSelectedItem(item);
    setIsReportDialogOpen(true);
  };

  // Handle opening the print dialog
  const handleOpenPrintDialog = (item: QRCodeItem) => {
    setSelectedItem(item);
    setIsPrintDialogOpen(true);
  };

  // Handle opening the generate dialog
  const handleOpenGenerateDialog = () => {
    setNewItemInfo({ name: "", serialNumber: "" });
    setIsGenerateDialogOpen(true);
  };

  // Handle reporting a damaged QR code
  const handleReportDamaged = () => {
    if (selectedItem && reportReason) {
      // Update the QR code status in the list
      const updatedItems = qrItems.map(item => 
        item.id === selectedItem.id ? { ...item, qrCodeStatus: "damaged" as const } : item
      );
      
      setQrItems(updatedItems);
      
      toast({
        title: "QR Code Reported",
        description: `The QR code for ${selectedItem.name} has been reported as damaged.`,
      });
      
      setIsReportDialogOpen(false);
      setReportReason("");
    }
  };

  // Handle printing a QR code
  const handlePrintQRCode = () => {
    if (selectedItem) {
      // In a real application, this would trigger a print process
      // Update the last printed date
      const updatedItems = qrItems.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              lastPrinted: new Date().toISOString().split('T')[0],
              qrCodeStatus: item.qrCodeStatus === "damaged" || item.qrCodeStatus === "missing" ? "replaced" : "active"
            } 
          : item
      );
      
      setQrItems(updatedItems);
      
      toast({
        title: "QR Code Printed",
        description: `The QR code for ${selectedItem.name} has been sent to print.`,
      });
      
      setIsPrintDialogOpen(false);
    }
  };

  // Handle generating a new QR code
  const handleGenerateNewQRCode = () => {
    if (newItemInfo.name && newItemInfo.serialNumber) {
      // In a real application, this would create a new item with a QR code
      const newItem: QRCodeItem = {
        id: `qr-${Date.now()}`,
        name: newItemInfo.name,
        serialNumber: newItemInfo.serialNumber,
        assignedDate: new Date().toISOString().split('T')[0],
        status: "active",
        qrCodeStatus: "active",
        lastUpdated: new Date().toISOString().split('T')[0],
        lastPrinted: new Date().toISOString().split('T')[0]
      };
      
      setQrItems([newItem, ...qrItems]);
      
      toast({
        title: "QR Code Generated",
        description: `A new QR code for ${newItemInfo.name} has been created.`,
      });
      
      setIsGenerateDialogOpen(false);
      setNewItemInfo({ name: "", serialNumber: "" });
    }
  };

  // Function to batch replace damaged QR codes
  const handleBatchReplaceDamaged = () => {
    const damagedItems = qrItems.filter(item => item.qrCodeStatus === "damaged");
    
    if (damagedItems.length === 0) {
      toast({
        title: "No Damaged QR Codes",
        description: "There are no damaged QR codes to replace.",
      });
      return;
    }
    
    // Update all damaged QR codes to replaced
    const updatedItems = qrItems.map(item => 
      item.qrCodeStatus === "damaged" 
        ? { 
            ...item, 
            qrCodeStatus: "replaced",
            lastPrinted: new Date().toISOString().split('T')[0]
          } 
        : item
    );
    
    setQrItems(updatedItems);
    
    toast({
      title: "Batch Replace Initiated",
      description: `${damagedItems.length} damaged QR codes have been queued for printing.`,
    });
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Render QR code status badge
  const renderStatusBadge = (status: QRCodeItem["qrCodeStatus"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case "damaged":
        return <Badge className="bg-red-500 hover:bg-red-600">Damaged</Badge>;
      case "missing":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Missing</Badge>;
      case "replaced":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Replaced</Badge>;
      default:
        return null;
    }
  };

  return (
    <StandardPageLayout
      title="QR Code Management"
      description="Generate, print, and manage QR codes for equipment tracking"
      actions={
        <Button onClick={handleOpenGenerateDialog} className="bg-[#4B5320] hover:bg-[#3a4019]">
          <Plus className="mr-2 h-4 w-4" /> Generate New QR Code
        </Button>
      }
    >
      <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All QR Codes</TabsTrigger>
              <TabsTrigger value="damaged">Damaged</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleBatchReplaceDamaged}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Replace Damaged
              </Button>
            </div>
          </div>
          
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or serial number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-white dark:bg-white/10"
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3" 
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="replaced">Replaced</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || statusFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription>SN: {item.serialNumber}</CardDescription>
                        </div>
                        {renderStatusBadge(item.qrCodeStatus)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-center py-3">
                        <QRCodeGenerator 
                          itemName={item.name} 
                          serialNumber={item.serialNumber} 
                        />
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="ml-1 font-medium">{item.status}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Assigned:</span>
                          <span className="ml-1 font-medium">{item.assignedDate}</span>
                        </div>
                        {item.lastPrinted && (
                          <div>
                            <span className="text-muted-foreground">Last Printed:</span>
                            <span className="ml-1 font-medium">{item.lastPrinted}</span>
                          </div>
                        )}
                        {item.lastUpdated && (
                          <div>
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span className="ml-1 font-medium">{item.lastUpdated}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenPrintDialog(item)}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      {item.qrCodeStatus !== "damaged" ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleOpenReportDialog(item)}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Report Issue
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-500 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleOpenPrintDialog(item)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Replace
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 flex flex-col items-center justify-center text-center">
                <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No QR Codes Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "No QR codes match your search criteria. Try adjusting your filters."
                    : "There are no QR codes in the system yet. Generate a new QR code to get started."}
                </p>
                <Button onClick={handleOpenGenerateDialog} className="bg-[#4B5320] hover:bg-[#3a4019]">
                  <Plus className="mr-2 h-4 w-4" /> Generate QR Code
                </Button>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="damaged">
            {qrItems.filter(item => item.qrCodeStatus === "damaged").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrItems
                  .filter(item => item.qrCodeStatus === "damaged")
                  .map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <CardDescription>SN: {item.serialNumber}</CardDescription>
                          </div>
                          {renderStatusBadge(item.qrCodeStatus)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-center py-3">
                          <div className="relative">
                            <QRCodeGenerator 
                              itemName={item.name} 
                              serialNumber={item.serialNumber} 
                            />
                            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                              <AlertTriangle className="h-12 w-12 text-red-500" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className="ml-1 font-medium">{item.status}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Assigned:</span>
                            <span className="ml-1 font-medium">{item.assignedDate}</span>
                          </div>
                          {item.lastUpdated && (
                            <div>
                              <span className="text-muted-foreground">Reported:</span>
                              <span className="ml-1 font-medium">{item.lastUpdated}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-center">
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-[#4B5320] hover:bg-[#3a4019]"
                          onClick={() => handleOpenPrintDialog(item)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Replace QR Code
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="p-8 flex flex-col items-center justify-center text-center">
                <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Damaged QR Codes</h3>
                <p className="text-muted-foreground">
                  There are currently no reported damaged QR codes in the system.
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Activity Report</CardTitle>
                <CardDescription>
                  Overview of QR code management activities and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{qrItems.length}</div>
                        <div className="text-sm text-muted-foreground">Total QR Codes</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {qrItems.filter(item => item.qrCodeStatus === "damaged").length}
                        </div>
                        <div className="text-sm text-muted-foreground">Damaged QR Codes</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {qrItems.filter(item => item.qrCodeStatus === "replaced").length}
                        </div>
                        <div className="text-sm text-muted-foreground">Replaced QR Codes</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Item</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Serial Number</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">{new Date().toLocaleDateString()}</td>
                          <td className="p-4 align-middle">M4 Carbine</td>
                          <td className="p-4 align-middle">SN12345678</td>
                          <td className="p-4 align-middle">QR Code Replaced</td>
                        </tr>
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">{new Date(Date.now() - 86400000).toLocaleDateString()}</td>
                          <td className="p-4 align-middle">Night Vision Goggles</td>
                          <td className="p-4 align-middle">NVG87654321</td>
                          <td className="p-4 align-middle">QR Code Generated</td>
                        </tr>
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">{new Date(Date.now() - 172800000).toLocaleDateString()}</td>
                          <td className="p-4 align-middle">Radio Set</td>
                          <td className="p-4 align-middle">RS98765432</td>
                          <td className="p-4 align-middle">Damaged QR Code Reported</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Report Damaged QR Code Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Damaged QR Code</DialogTitle>
            <DialogDescription>
              Report a damaged or unreadable QR code for replacement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedItem && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium" htmlFor="item-name">Item:</label>
                  <div id="item-name" className="col-span-3 font-medium">{selectedItem.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium" htmlFor="serial-number">Serial Number:</label>
                  <div id="serial-number" className="col-span-3">{selectedItem.serialNumber}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium" htmlFor="reason">Reason:</label>
                  <Input
                    id="reason"
                    placeholder="Enter reason for damaged QR code"
                    className="col-span-3"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-[#4B5320] hover:bg-[#3a4019]"
              onClick={handleReportDamaged}
              disabled={!reportReason}
            >
              Report Damaged
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print QR Code Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Print QR Code</DialogTitle>
            <DialogDescription>
              Preview and print the QR code for this equipment item.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center">
            {selectedItem && (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold">{selectedItem.name}</h3>
                  <p className="text-sm text-muted-foreground">SN: {selectedItem.serialNumber}</p>
                </div>
                <div className="p-6 border rounded-lg bg-gray-50 mb-4">
                  <QRCodeGenerator 
                    itemName={selectedItem.name} 
                    serialNumber={selectedItem.serialNumber} 
                  />
                </div>
                <div className="text-sm text-muted-foreground text-center mb-4">
                  {selectedItem.qrCodeStatus === "damaged" ? (
                    <p>Printing this QR code will mark it as replaced</p>
                  ) : (
                    <p>Print this QR code and attach it to the equipment</p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#4B5320] hover:bg-[#3a4019]"
              onClick={handlePrintQRCode}
            >
              <Printer className="mr-2 h-4 w-4" />
              {selectedItem?.qrCodeStatus === "damaged" ? "Print Replacement" : "Print QR Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate New QR Code Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Generate New QR Code</DialogTitle>
            <DialogDescription>
              Create a new QR code for equipment tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium" htmlFor="new-item-name">Item Name:</label>
              <Input
                id="new-item-name"
                placeholder="Enter item name"
                className="col-span-3"
                value={newItemInfo.name}
                onChange={(e) => setNewItemInfo({...newItemInfo, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium" htmlFor="new-serial-number">Serial Number:</label>
              <Input
                id="new-serial-number"
                placeholder="Enter serial number"
                className="col-span-3"
                value={newItemInfo.serialNumber}
                onChange={(e) => setNewItemInfo({...newItemInfo, serialNumber: e.target.value})}
              />
            </div>
            
            {newItemInfo.name && newItemInfo.serialNumber && (
              <div className="flex justify-center my-4">
                <div className="p-6 border rounded-lg bg-gray-50">
                  <QRCodeGenerator 
                    itemName={newItemInfo.name} 
                    serialNumber={newItemInfo.serialNumber} 
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#4B5320] hover:bg-[#3a4019]"
              onClick={handleGenerateNewQRCode}
              disabled={!newItemInfo.name || !newItemInfo.serialNumber}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate & Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
};

export default QRManagement;