import { useState } from "react";
import { transfers } from "@/lib/mockData";
import StatusBadge from "../common/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, RepeatIcon, ArrowRightLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Transfer } from "@/types";
import { Badge } from "@/components/ui/badge";

const PendingTransfers: React.FC = () => {
  const [transferList, setTransferList] = useState(transfers);
  const { toast } = useToast();
  const [, navigate] = useLocation();

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
      description: "The transfer request has been approved",
    });
  };

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
      description: "The transfer request has been rejected",
    });
  };

  const pendingTransfers = transferList
    .filter(transfer => transfer.status === "pending")
    .slice(0, 2); // Only show 2 items on dashboard

  const TransferItem = ({ transfer }: { transfer: Transfer }) => (
    <div className="border-b border-border">
      <div className="p-4 hover:bg-muted/10 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-sm">{transfer.name}</h4>
            <div className="flex items-center space-x-3">
              <p className="text-xs text-muted-foreground font-mono">SN: {transfer.serialNumber}</p>
              <Badge variant="outline" className="text-xs">From: {transfer.from}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <StatusBadge status={transfer.status} className="mr-4" />
          <div className="flex space-x-2">
            <Button 
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-green-500/20 text-green-600 border-green-200 hover:bg-green-500/30 hover:text-green-700"
              title="Approve"
              onClick={() => handleApprove(transfer.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-red-500/20 text-red-600 border-red-200 hover:bg-red-500/30 hover:text-red-700" 
              title="Reject"
              onClick={() => handleReject(transfer.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden border border-border mb-6">
      <CardHeader className="bg-muted/40 pb-2">
        <div className="flex items-center gap-2">
          <RepeatIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Pending Transfer Requests</CardTitle>
        </div>
        <CardDescription>Equipment transfer requests requiring approval</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {pendingTransfers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No pending transfer requests
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingTransfers.map((transfer) => (
              <TransferItem key={transfer.id} transfer={transfer} />
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/10 py-3">
        <Button 
          variant="ghost" 
          className="w-full text-xs flex items-center justify-center" 
          onClick={() => navigate("/transfers")}
        >
          View All Transfers
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PendingTransfers;
