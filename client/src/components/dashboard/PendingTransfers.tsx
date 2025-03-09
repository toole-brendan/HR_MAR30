import { useState } from "react";
import { transfers } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RepeatIcon, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Transfer } from "@/types";
import { TransferItem } from "@/components/dashboard/TransferItem";

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
          <div className="divide-y divide-border p-4">
            {pendingTransfers.map((transfer) => (
              <TransferItem 
                key={transfer.id}
                id={transfer.id}
                name={transfer.name}
                source={transfer.from}
                destination={transfer.to}
                status="pending"
                direction="inbound"
                onAccept={() => handleApprove(transfer.id)}
                onDecline={() => handleReject(transfer.id)}
              />
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
