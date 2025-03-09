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
    <Card className="overflow-hidden border border-border mb-6 dashboard-card">
      {/* 8VC Style Header */}
      <div className="p-6 pb-4">
        {/* Category Label */}
        <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
          ACTIVE TRANSFERS
        </div>
        {/* Main Title */}
        <div className="text-lg font-normal text-gray-900 dark:text-white">
          Recent transfer requests
        </div>
      </div>
      
      <CardContent className="p-0">
        {pendingTransfers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No pending transfer requests
          </div>
        ) : (
          <div className="divide-y divide-border px-6">
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
      
      {/* 8VC Style Footer with right-aligned View All link */}
      <div className="px-6 py-4 flex justify-end">
        <Button 
          variant="ghost" 
          className="text-xs uppercase tracking-wider text-primary hover:bg-transparent hover:text-primary-600"
          onClick={() => navigate("/transfers")}
        >
          VIEW ALL
        </Button>
      </div>
    </Card>
  );
};

export default PendingTransfers;
