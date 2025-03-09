import { useState } from "react";
import { transfers } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className="overflow-hidden border border-gray-200 dark:border-white/10 mb-6 shadow-none bg-white dark:bg-black">
      <div className="p-4 flex justify-between items-baseline">
        <div>
          <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
            ACTIVE TRANSFERS
          </div>
          <div className="text-lg font-normal text-gray-900 dark:text-white">
            Recent transfer requests
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:bg-transparent hover:text-purple-800 dark:hover:text-purple-300"
          onClick={() => navigate("/transfers")}
        >
          VIEW ALL
        </Button>
      </div>
      
      <CardContent className="p-0">
        {pendingTransfers.length === 0 ? (
          <div className="px-4 pb-4 text-center text-muted-foreground">
            No pending transfer requests
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5 px-4 pb-2">
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
    </Card>
  );
};

export default PendingTransfers;
