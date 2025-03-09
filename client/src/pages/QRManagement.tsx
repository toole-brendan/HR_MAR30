import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { Printer, QrCode, RefreshCw, AlertTriangle, Plus, Tag, ArrowUpDown, Filter, Search, X, Calendar, Clock } from "lucide-react";
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
              qrCodeStatus: (item.qrCodeStatus === "damaged" || item.qrCodeStatus === "missing") ? 
                "replaced" as const : 
                "active" as const
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
            qrCodeStatus: "replaced" as const,
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
    <PageWrapper withPadding={true}>
      {/* 8VC Style Header */}
      <div className="pt-16 pb-10">
        {/* Category label - Small all-caps category label */}
        <div className="text-xs uppercase tracking-wider font-medium mb-1 text-muted-foreground">
          QR MANAGEMENT
        </div>
        
        {/* Main title - following 8VC typography */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-1">QR Code Management</h1>
            <p className="text-sm text-muted-foreground">Generate, print, and manage QR codes for equipment tracking</p>
          </div>
          <Button 
            onClick={handleOpenGenerateDialog} 
            className="bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Generate New QR Code
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-12 rounded-none bg-gray-50 dark:bg-white/5 p-1 w-full min-w-fit">
                <TabsTrigger 
                  value="all" 
                  className="uppercase tracking-wider text-xs font-medium h-10 px-4 sm:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-sm"
                >
                  ALL QR CODES
                </TabsTrigger>
                <TabsTrigger 
                  value="damaged" 
                  className="uppercase tracking-wider text-xs font-medium h-10 px-4 sm:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-sm"
                >
                  DAMAGED
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="uppercase tracking-wider text-xs font-medium h-10 px-4 sm:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-sm"
                >
                  REPORTS
                </TabsTrigger>
              </TabsList>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleBatchReplaceDamaged}
              className="flex-shrink-0 flex items-center uppercase tracking-wider text-xs h-10 border-gray-200 dark:border-white/10 whitespace-nowrap"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Replace Damaged
            </Button>
          </div>
          
          <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4 mb-6 overflow-hidden">
            <div className="uppercase text-xs tracking-wider font-medium mb-3 text-gray-500 dark:text-gray-400">
              FILTER OPTIONS
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or serial number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white dark:bg-black border-gray-200 dark:border-white/10 w-full"
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
              
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] sm:w-[180px] bg-white dark:bg-black border-gray-200 dark:border-white/10">
                    <div className="flex items-center truncate">
                      <Filter className="mr-2 flex-shrink-0 h-4 w-4" />
                      <span className="truncate">Status: {statusFilter === "all" ? "All" : statusFilter}</span>
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
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="uppercase tracking-wider text-xs border-gray-200 dark:border-white/10"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black rounded-none">
                    <div className="p-4">
                      <div className="uppercase text-xs tracking-wider font-medium mb-1 text-gray-500 dark:text-gray-400">
                        QR CODE #{item.id.substring(0, 8)}
                      </div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-normal">{item.name}</h3>
                          <div className="text-sm font-mono text-muted-foreground">SN: {item.serialNumber}</div>
                        </div>
                        <Badge className="uppercase text-[10px] tracking-wider font-medium rounded-none py-0.5 px-2.5"
                          variant="outline"
                          {...(() => {
                            switch (item.qrCodeStatus) {
                              case "active":
                                return {
                                  className: "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30"
                                };
                              case "damaged":
                                return {
                                  className: "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/30"
                                };
                              case "missing":
                                return {
                                  className: "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30"
                                };
                              case "replaced":
                                return {
                                  className: "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30"
                                };
                              default:
                                return {};
                            }
                          })()}
                        >
                          {item.qrCodeStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-center py-4 px-4 bg-gray-50 dark:bg-white/5">
                      <QRCodeGenerator 
                        itemName={item.name} 
                        serialNumber={item.serialNumber} 
                      />
                    </div>
                    
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5">
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                          <span className="text-xs text-muted-foreground">Assigned:</span>
                          <span className="ml-1 text-xs font-medium">{item.assignedDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                          <span className="text-xs text-muted-foreground">Status:</span>
                          <span className="ml-1 text-xs font-medium">{item.status}</span>
                        </div>
                        {item.lastPrinted && (
                          <div className="flex items-center">
                            <Printer className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            <span className="text-xs text-muted-foreground">Printed:</span>
                            <span className="ml-1 text-xs font-medium">{item.lastPrinted}</span>
                          </div>
                        )}
                        {item.lastUpdated && (
                          <div className="flex items-center">
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            <span className="text-xs text-muted-foreground">Updated:</span>
                            <span className="ml-1 text-xs font-medium">{item.lastUpdated}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenPrintDialog(item)}
                        className="uppercase tracking-wider text-xs border-gray-200 dark:border-white/10"
                      >
                        <Printer className="mr-2 h-3.5 w-3.5" />
                        Print
                      </Button>
                      {item.qrCodeStatus !== "damaged" ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="uppercase tracking-wider text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20"
                          onClick={() => handleOpenReportDialog(item)}
                        >
                          <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                          Report Issue
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="uppercase tracking-wider text-xs text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/30 dark:hover:bg-blue-900/20"
                          onClick={() => handleOpenPrintDialog(item)}
                        >
                          <RefreshCw className="mr-2 h-3.5 w-3.5" />
                          Replace
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black rounded-none">
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-normal mb-2">No QR Codes Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all" 
                      ? "No QR codes match your search criteria. Try adjusting your filters."
                      : "There are no QR codes in the system yet. Generate a new QR code to get started."}
                  </p>
                  <Button 
                    onClick={handleOpenGenerateDialog} 
                    className="bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Generate QR Code
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="damaged">
            {qrItems.filter(item => item.qrCodeStatus === "damaged").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrItems
                  .filter(item => item.qrCodeStatus === "damaged")
                  .map((item) => (
                    <Card key={item.id} className="overflow-hidden border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black rounded-none">
                      <div className="p-4">
                        <div className="uppercase text-xs tracking-wider font-medium mb-1 text-red-600 dark:text-red-400">
                          DAMAGED QR CODE
                        </div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-normal">{item.name}</h3>
                            <div className="text-sm font-mono text-muted-foreground">SN: {item.serialNumber}</div>
                          </div>
                          <Badge 
                            variant="outline"
                            className="uppercase text-[10px] tracking-wider font-medium rounded-none py-0.5 px-2.5 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/30"
                          >
                            DAMAGED
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-center py-4 px-4 bg-gray-50 dark:bg-white/5">
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
                      
                      <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5">
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            <span className="text-xs text-muted-foreground">Assigned:</span>
                            <span className="ml-1 text-xs font-medium">{item.assignedDate}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            <span className="text-xs text-muted-foreground">Status:</span>
                            <span className="ml-1 text-xs font-medium">{item.status}</span>
                          </div>
                          {item.lastUpdated && (
                            <div className="flex items-center">
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                              <span className="text-xs text-muted-foreground">Reported:</span>
                              <span className="ml-1 text-xs font-medium">{item.lastUpdated}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 flex justify-center">
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs"
                          onClick={() => handleOpenPrintDialog(item)}
                        >
                          <RefreshCw className="mr-2 h-3.5 w-3.5" />
                          Replace QR Code
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black rounded-none">
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-normal mb-2">No Damaged QR Codes</h3>
                  <p className="text-sm text-muted-foreground">
                    There are currently no reported damaged QR codes in the system.
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="reports">
            <Card className="border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black rounded-none">
              <div className="p-4">
                <div className="uppercase text-xs tracking-wider font-medium mb-1 text-gray-500 dark:text-gray-400">
                  QR CODE REPORTS
                </div>
                <h3 className="text-lg font-normal mb-3">Activity Summary</h3>
              </div>
              
              <div className="px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border border-gray-100 dark:border-white/5 bg-white dark:bg-black">
                    <h4 className="text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">TOTAL QR CODES</h4>
                    <div className="text-2xl font-light tracking-tight">{qrItems.length}</div>
                    <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Active inventory items</p>
                  </div>
                  <div className="p-4 border border-gray-100 dark:border-white/5 bg-white dark:bg-black">
                    <h4 className="text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">DAMAGED CODES</h4>
                    <div className="text-2xl font-light tracking-tight">{qrItems.filter(item => item.qrCodeStatus === "damaged").length}</div>
                    <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Pending replacement</p>
                  </div>
                  <div className="p-4 border border-gray-100 dark:border-white/5 bg-white dark:bg-black">
                    <h4 className="text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">REPLACED CODES</h4>
                    <div className="text-2xl font-light tracking-tight">{qrItems.filter(item => item.qrCodeStatus === "replaced").length}</div>
                    <p className="text-xs tracking-wide text-muted-foreground mt-0.5">Last 30 days</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 dark:border-white/5">
                <div className="uppercase text-xs tracking-wider font-medium mb-4 text-gray-500 dark:text-gray-400">
                  RECENT ACTIVITY LOG
                </div>
                <div className="overflow-hidden border border-gray-100 dark:border-white/5">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                        <th className="h-9 px-4 text-left align-middle text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="h-9 px-4 text-left align-middle text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Item</th>
                        <th className="h-9 px-4 text-left align-middle text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Serial Number</th>
                        <th className="h-9 px-4 text-left align-middle text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-white/5">
                        <td className="p-4 align-middle">{new Date().toLocaleDateString()}</td>
                        <td className="p-4 align-middle">M4 Carbine</td>
                        <td className="p-4 align-middle font-mono text-xs">SN12345678</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <RefreshCw className="h-3.5 w-3.5 text-blue-500 mr-2" />
                            <span>QR Code Replaced</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-white/5">
                        <td className="p-4 align-middle">{new Date(Date.now() - 86400000).toLocaleDateString()}</td>
                        <td className="p-4 align-middle">Night Vision Goggles</td>
                        <td className="p-4 align-middle font-mono text-xs">NVG87654321</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <Plus className="h-3.5 w-3.5 text-green-500 mr-2" />
                            <span>QR Code Generated</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-white/5">
                        <td className="p-4 align-middle">{new Date(Date.now() - 172800000).toLocaleDateString()}</td>
                        <td className="p-4 align-middle">Radio Set</td>
                        <td className="p-4 align-middle font-mono text-xs">RS98765432</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 mr-2" />
                            <span>Damaged QR Code Reported</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Report Damaged QR Code Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
          <DialogHeader className="pb-2">
            <div className="uppercase text-xs tracking-wider font-medium mb-1 text-red-600 dark:text-red-400">
              REPORT ISSUE
            </div>
            <DialogTitle className="text-lg font-normal">Damaged QR Code</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Report a damaged or unreadable QR code for replacement.
            </DialogDescription>
          </DialogHeader>
          <Separator className="bg-gray-100 dark:bg-white/5" />
          <div className="py-4">
            {selectedItem && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="uppercase text-[10px] tracking-wider font-medium text-gray-500 dark:text-gray-400">
                      ITEM DETAILS
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <span className="ml-1 font-medium">{selectedItem.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Serial Number:</span>
                        <span className="ml-1 font-medium font-mono">{selectedItem.serialNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="uppercase text-[10px] tracking-wider font-medium text-gray-500 dark:text-gray-400">
                      REASON FOR REPORT
                    </div>
                    <Input
                      id="reason"
                      placeholder="Enter reason for damaged QR code"
                      className="w-full border-gray-200 dark:border-white/10 bg-white dark:bg-black"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground italic">
                      Please provide a brief description of the issue with this QR code.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <Separator className="bg-gray-100 dark:bg-white/5" />
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsReportDialogOpen(false)}
              className="uppercase tracking-wider text-xs border-gray-200 dark:border-white/10"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs"
              onClick={handleReportDamaged}
              disabled={!reportReason}
            >
              <AlertTriangle className="mr-2 h-3.5 w-3.5" />
              Report Damaged
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print QR Code Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-none border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
          <DialogHeader className="pb-2">
            <div className="uppercase text-xs tracking-wider font-medium mb-1 text-blue-600 dark:text-blue-400">
              PRINT QR CODE
            </div>
            <DialogTitle className="text-lg font-normal">Generate Printable QR Code</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Preview and print the QR code for this equipment item.
            </DialogDescription>
          </DialogHeader>
          <Separator className="bg-gray-100 dark:bg-white/5" />
          <div className="py-4">
            {selectedItem && (
              <div className="flex flex-col items-center">
                <div className="space-y-2 mb-4 text-center">
                  <div className="uppercase text-[10px] tracking-wider font-medium text-gray-500 dark:text-gray-400">
                    ITEM INFORMATION
                  </div>
                  <h3 className="text-lg font-normal">{selectedItem.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground">SN: {selectedItem.serialNumber}</p>
                </div>
                
                <div className="p-6 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 mb-4">
                  <QRCodeGenerator 
                    itemName={selectedItem.name} 
                    serialNumber={selectedItem.serialNumber} 
                  />
                </div>
                
                <div className="text-sm text-center space-y-2 mb-4 w-full border border-gray-100 dark:border-white/5 p-3">
                  <div className="uppercase text-[10px] tracking-wider font-medium text-gray-500 dark:text-gray-400">
                    IMPORTANT NOTE
                  </div>
                  {selectedItem.qrCodeStatus === "damaged" ? (
                    <p className="text-sm">This action will mark the QR code as <span className="font-medium text-blue-600 dark:text-blue-400">replaced</span> in the system.</p>
                  ) : (
                    <p className="text-sm">Print this QR code and attach it securely to the equipment for easy tracking.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Separator className="bg-gray-100 dark:bg-white/5" />
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsPrintDialogOpen(false)}
              className="uppercase tracking-wider text-xs border-gray-200 dark:border-white/10"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs"
              onClick={handlePrintQRCode}
            >
              <Printer className="mr-2 h-3.5 w-3.5" />
              {selectedItem?.qrCodeStatus === "damaged" ? "Print Replacement" : "Print QR Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate New QR Code Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-none border-gray-200 dark:border-white/10 shadow-none bg-white dark:bg-black">
          <DialogHeader className="pb-2">
            <div className="uppercase text-xs tracking-wider font-medium mb-1 text-green-600 dark:text-green-400">
              CREATE NEW
            </div>
            <DialogTitle className="text-lg font-normal">Generate New QR Code</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Create a new QR code for equipment inventory tracking.
            </DialogDescription>
          </DialogHeader>
          <Separator className="bg-gray-100 dark:bg-white/5" />
          <div className="py-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="uppercase text-[10px] tracking-wider font-medium text-gray-500 dark:text-gray-400">
                  EQUIPMENT DETAILS
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-item-name" className="text-xs uppercase tracking-wider">Item Name</Label>
                    <Input
                      id="new-item-name"
                      placeholder="Enter item name"
                      className="w-full border-gray-200 dark:border-white/10 bg-white dark:bg-black"
                      value={newItemInfo.name}
                      onChange={(e) => setNewItemInfo({...newItemInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-serial-number" className="text-xs uppercase tracking-wider">Serial Number</Label>
                    <Input
                      id="new-serial-number"
                      placeholder="Enter serial number"
                      className="w-full border-gray-200 dark:border-white/10 bg-white dark:bg-black font-mono"
                      value={newItemInfo.serialNumber}
                      onChange={(e) => setNewItemInfo({...newItemInfo, serialNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              {newItemInfo.name && newItemInfo.serialNumber && (
                <div className="space-y-3">
                  <div className="uppercase text-[10px] tracking-wider font-medium text-gray-500 dark:text-gray-400">
                    PREVIEW QR CODE
                  </div>
                  <div className="flex justify-center">
                    <div className="p-6 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                      <QRCodeGenerator 
                        itemName={newItemInfo.name} 
                        serialNumber={newItemInfo.serialNumber} 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    This QR code will be automatically associated with this equipment item.
                  </p>
                </div>
              )}
            </div>
          </div>
          <Separator className="bg-gray-100 dark:bg-white/5" />
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsGenerateDialogOpen(false)}
              className="uppercase tracking-wider text-xs border-gray-200 dark:border-white/10"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary-600 uppercase tracking-wider text-xs"
              onClick={handleGenerateNewQRCode}
              disabled={!newItemInfo.name || !newItemInfo.serialNumber}
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Generate QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
};

export default QRManagement;