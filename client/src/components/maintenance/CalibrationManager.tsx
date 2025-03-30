import React, { useState, useEffect, useMemo } from 'react';
import { getInventoryItemsFromDB, saveInventoryItemsToDB } from '@/lib/idb';
import { InventoryItem, CalibrationInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Calendar, Edit, History, Check, X, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { parseISO, format, differenceInDays, isValid, addDays } from 'date-fns';

// Helper to calculate calibration status based on due date
const getCalibrationStatus = (dueDateStr?: string): CalibrationInfo['status'] => {
    if (!dueDateStr) return undefined; // Or 'unknown'?
    try {
        const dueDate = parseISO(dueDateStr);
        if (!isValid(dueDate)) return undefined;
        const today = new Date();
        const daysUntilDue = differenceInDays(dueDate, today);

        if (daysUntilDue < 0) return 'overdue';
        if (daysUntilDue <= 30) return 'due-soon'; // Example: due within 30 days
        return 'current';
    } catch (e) {
        console.error("Error parsing due date for status:", dueDateStr, e);
        return undefined;
    }
};

const CalibrationManager: React.FC = () => {
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<CalibrationInfo>>({});
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [performCalItem, setPerformCalItem] = useState<InventoryItem | null>(null);
  const [calibrationNotes, setCalibrationNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getInventoryItemsFromDB();
        setAllItems(items);
      } catch (err) {
        console.error("Failed to load inventory for calibration:", err);
        setError("Failed to load inventory data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter for calibration items and update status dynamically
  const calibrationItems = useMemo(() => {
    return allItems
      .filter(item => item.requiresCalibration)
      .map(item => ({
        ...item,
        calibrationInfo: {
          ...item.calibrationInfo,
          // Recalculate status based on current date
          status: getCalibrationStatus(item.calibrationInfo?.nextCalibrationDueDate)
        }
      }));
  }, [allItems]);

  // Edit Modal Handlers
  const handleStartEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditFormData(item.calibrationInfo || {});
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    // Ensure calibrationInfo exists before updating
    const baseCalibrationInfo = editingItem.calibrationInfo || {}; 
    const history = baseCalibrationInfo.history || [];

    const updatedItem: InventoryItem = {
      ...editingItem,
      calibrationInfo: {
        ...baseCalibrationInfo,
        ...editFormData,
         history: [
            ...history,
            { date: new Date().toISOString(), notes: 'Calibration info updated via UI.' }
        ]
      },
    };
    
    // Ensure calibrationInfo exists before accessing properties
    if (updatedItem.calibrationInfo) {
        // Recalculate status based on potentially updated due date
        updatedItem.calibrationInfo.status = getCalibrationStatus(updatedItem.calibrationInfo.nextCalibrationDueDate);
    } else {
        // Should not happen based on logic above, but good practice
        console.warn("Calibration info was unexpectedly null during save.");
    }

    try {
      // Update the item in the main list state
      setAllItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
      // Persist the change to IndexedDB
      const currentItemsInDB = await getInventoryItemsFromDB();
      const updatedItemsForDB = currentItemsInDB.map(item => item.id === updatedItem.id ? updatedItem : item);
      await saveInventoryItemsToDB(updatedItemsForDB);
      
      toast({ title: "Success", description: `Calibration info for ${updatedItem.name} saved.` });
      setEditingItem(null); // Close modal
    } catch (err) {
      console.error("Failed to save calibration changes:", err);
      toast({ title: "Error", description: "Failed to save changes to database.", variant: "destructive" });
    }
  };

  // History Modal Handlers
  const handleShowHistory = (item: InventoryItem) => {
    setHistoryItem(item);
  };

  // New function to perform a calibration
  const handlePerformCalibration = (item: InventoryItem) => {
    setPerformCalItem(item);
    setCalibrationNotes("");
  };

  // Save the calibration
  const handleSaveCalibration = async () => {
    if (!performCalItem) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Determine next due date based on interval or default to 1 year
    const intervalDays = performCalItem.calibrationInfo?.calibrationIntervalDays || 365;
    const nextDueDate = format(addDays(new Date(), intervalDays), 'yyyy-MM-dd');
    
    // Ensure calibrationInfo exists before updating
    const baseCalibrationInfo = performCalItem.calibrationInfo || {}; 
    const history = baseCalibrationInfo.history || [];

    const updatedItem: InventoryItem = {
      ...performCalItem,
      calibrationInfo: {
        ...baseCalibrationInfo,
        lastCalibrationDate: today,
        nextCalibrationDueDate: nextDueDate,
        notes: calibrationNotes || baseCalibrationInfo.notes,
        history: [
          ...history,
          { 
            date: new Date().toISOString(), 
            notes: `Calibration performed. ${calibrationNotes ? `Notes: ${calibrationNotes}` : ''}` 
          }
        ],
        status: 'current' // It's current right after calibration
      },
    };

    try {
      // Update the item in the main list state
      setAllItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
      
      // Persist the change to IndexedDB
      const currentItemsInDB = await getInventoryItemsFromDB();
      const updatedItemsForDB = currentItemsInDB.map(item => item.id === updatedItem.id ? updatedItem : item);
      await saveInventoryItemsToDB(updatedItemsForDB);
      
      toast({ 
        title: "Calibration Completed", 
        description: `${updatedItem.name} has been calibrated and is due again on ${nextDueDate}.` 
      });
      
      setPerformCalItem(null); // Close modal
    } catch (err) {
      console.error("Failed to save calibration:", err);
      toast({ 
        title: "Error", 
        description: "Failed to record calibration.", 
        variant: "destructive" 
      });
    }
  };

  // Filter items based on search term
  const filteredCalibrationItems = useMemo(() => {
    if (!searchTerm.trim()) return calibrationItems;
    
    const searchLower = searchTerm.toLowerCase();
    return calibrationItems.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.serialNumber.toLowerCase().includes(searchLower)
    );
  }, [calibrationItems, searchTerm]);

  // Calculate notification stats
  const notificationStats = useMemo(() => {
    const overdueCount = calibrationItems.filter(
      item => item.calibrationInfo?.status === 'overdue'
    ).length;
    
    const dueSoonCount = calibrationItems.filter(
      item => item.calibrationInfo?.status === 'due-soon'
    ).length;
    
    return { overdueCount, dueSoonCount };
  }, [calibrationItems]);

  // --- Render Logic ---
  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calibration Management</CardTitle>
        <CardDescription>Track and manage items requiring calibration.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Notifications Section */}
        {(notificationStats.overdueCount > 0 || notificationStats.dueSoonCount > 0) && (
          <div className="mb-6 space-y-4">
            {notificationStats.overdueCount > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Overdue Calibration</AlertTitle>
                <AlertDescription>
                  {notificationStats.overdueCount} {notificationStats.overdueCount === 1 ? 'item needs' : 'items need'} immediate calibration.
                </AlertDescription>
              </Alert>
            )}
            
            {notificationStats.dueSoonCount > 0 && (
              <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/10 dark:border-amber-800 dark:text-amber-400">
                <Clock className="h-4 w-4" />
                <AlertTitle>Upcoming Calibration</AlertTitle>
                <AlertDescription>
                  {notificationStats.dueSoonCount} {notificationStats.dueSoonCount === 1 ? 'item is' : 'items are'} due for calibration within 30 days.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {/* Search and Controls */}
        <div className="flex items-center mb-4 gap-4">
          <div className="relative flex-1">
            <Input 
              placeholder="Search by name or serial number" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {calibrationItems.length === 0 ? (
          <p className="text-muted-foreground">No items marked as requiring calibration.</p>
        ) : filteredCalibrationItems.length === 0 ? (
          <p className="text-muted-foreground">No matching calibration items found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Calibrated</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalibrationItems.map(item => {
                 // Determine Badge variant and class based on status
                 let badgeVariant: "destructive" | "secondary" | "default" = "secondary";
                 let badgeClass = "";
                 const status = item.calibrationInfo?.status;
                 if (status === 'overdue') {
                    badgeVariant = "destructive";
                 } else if (status === 'due-soon') {
                    badgeVariant = "secondary"; // Use secondary as base for warning
                    badgeClass = "text-amber-600 border-amber-400 dark:text-amber-400 dark:border-amber-600"; // Add warning colors
                 } else if (status === 'current') {
                     badgeVariant = "default"; // Use default for current/success
                     badgeClass = "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"; // Add success colors
                 }
                  
                return (
                   <TableRow key={item.id}>
                     <TableCell className="font-medium">{item.name}</TableCell>
                     <TableCell className="font-mono text-xs">{item.serialNumber}</TableCell>
                     <TableCell>
                       {status ? (
                         <Badge variant={badgeVariant} className={badgeClass}>
                           {status === 'overdue' && 'Overdue'}
                           {status === 'due-soon' && 'Due Soon'}
                           {status === 'current' && 'Current'}
                           {!['overdue', 'due-soon', 'current'].includes(status) && status}
                         </Badge>
                       ) : (
                         <Badge variant="secondary">Unknown</Badge>
                       )}
                     </TableCell>
                     <TableCell>{item.calibrationInfo?.lastCalibrationDate || '-'}</TableCell>
                     <TableCell>{item.calibrationInfo?.nextCalibrationDueDate || '-'}</TableCell>
                     <TableCell className="text-right space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View History" 
                          onClick={() => handleShowHistory(item)} 
                          disabled={!item.calibrationInfo?.history?.length}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Edit Calibration Info" 
                          onClick={() => handleStartEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant={status === 'overdue' || status === 'due-soon' ? "destructive" : "ghost"}
                          size="icon" 
                          title="Perform Calibration" 
                          onClick={() => handlePerformCalibration(item)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                     </TableCell>
                   </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="bg-muted/20 justify-between py-2">
        <div className="text-sm text-muted-foreground">
          Total: {calibrationItems.length} items
        </div>
        <div className="text-sm">
          {notificationStats.overdueCount > 0 && (
            <Badge variant="destructive" className="mr-2">
              {notificationStats.overdueCount} Overdue
            </Badge>
          )}
          {notificationStats.dueSoonCount > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-400 dark:text-amber-400 dark:border-amber-600">
              {notificationStats.dueSoonCount} Due Soon
            </Badge>
          )}
        </div>
      </CardFooter>
      
      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Calibration Info: {editingItem.name}</DialogTitle>
              <DialogDescription>SN: {editingItem.serialNumber}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                 <label htmlFor="lastCalDate" className="text-right">Last Cal Date</label>
                 <Input id="lastCalDate" name="lastCalibrationDate" type="date" value={editFormData.lastCalibrationDate || ''} onChange={handleEditFormChange} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <label htmlFor="nextDueDate" className="text-right">Next Due Date</label>
                 <Input id="nextDueDate" name="nextCalibrationDueDate" type="date" value={editFormData.nextCalibrationDueDate || ''} onChange={handleEditFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <label htmlFor="interval" className="text-right">Interval (Days)</label>
                 <Input id="interval" name="calibrationIntervalDays" type="number" value={editFormData.calibrationIntervalDays || ''} onChange={handleEditFormChange} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <label htmlFor="notes" className="text-right">Notes</label>
                 <Textarea id="notes" name="notes" value={editFormData.notes || ''} onChange={handleEditFormChange} className="col-span-3" rows={3} />
              </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
               <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* History Dialog */}
      {historyItem && (
         <Dialog open={!!historyItem} onOpenChange={(open) => !open && setHistoryItem(null)}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Calibration History: {historyItem.name}</DialogTitle>
                  <DialogDescription>SN: {historyItem.serialNumber}</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
                    {historyItem.calibrationInfo?.history && historyItem.calibrationInfo.history.length > 0 ? (
                        <ul className="space-y-3">
                            {[...historyItem.calibrationInfo.history].reverse().map((entry, index) => ( // Show newest first
                                <li key={index} className="text-sm border-b pb-2 last:border-b-0">
                                    <p><strong>Date:</strong> {format(parseISO(entry.date), 'yyyy-MM-dd HH:mm')}</p>
                                    {entry.performedBy && <p><strong>Performed By:</strong> {entry.performedBy}</p>}
                                    {entry.notes && <p className="mt-1 text-muted-foreground">{entry.notes}</p>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No history recorded.</p>
                    )}
                </div>
                <DialogFooter className="mt-4">
                   <Button variant="outline" onClick={() => setHistoryItem(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
         </Dialog>
      )}
      
      {/* Perform Calibration Dialog */}
      {performCalItem && (
        <Dialog open={!!performCalItem} onOpenChange={(open) => !open && setPerformCalItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Perform Calibration: {performCalItem.name}</DialogTitle>
              <DialogDescription>SN: {performCalItem.serialNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="text-sm mb-2">
                  <span className="font-medium">Last Calibration:</span> {performCalItem.calibrationInfo?.lastCalibrationDate || 'Never'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Current Status:</span> 
                  <Badge variant={
                    performCalItem.calibrationInfo?.status === 'overdue' ? 'destructive' : 
                    performCalItem.calibrationInfo?.status === 'due-soon' ? 'secondary' : 'default'
                  } className="ml-2">
                    {performCalItem.calibrationInfo?.status === 'overdue' && 'Overdue'}
                    {performCalItem.calibrationInfo?.status === 'due-soon' && 'Due Soon'}
                    {performCalItem.calibrationInfo?.status === 'current' && 'Current'}
                    {!performCalItem.calibrationInfo?.status && 'Unknown'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Calibration Notes</label>
                <Textarea 
                  placeholder="Enter notes about this calibration..." 
                  value={calibrationNotes}
                  onChange={(e) => setCalibrationNotes(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="bg-green-50 text-green-800 dark:bg-green-900/10 dark:text-green-400 p-3 rounded-md">
                <p className="text-sm">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  Recording this calibration will:
                </p>
                <ul className="text-sm list-disc pl-6 mt-2">
                  <li>Mark today as the last calibration date</li>
                  <li>Set next due date based on calibration interval ({performCalItem.calibrationInfo?.calibrationIntervalDays || 365} days)</li>
                  <li>Add this event to the calibration history</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPerformCalItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCalibration} variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Calibration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default CalibrationManager; 