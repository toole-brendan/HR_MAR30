import { useState } from "react";
import { transfers } from "@/lib/mockData";
import StatusBadge from "../common/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const PendingTransfers: React.FC = () => {
  const [transferList, setTransferList] = useState(transfers);
  const { toast } = useToast();

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

  const pendingTransfers = transferList.filter(transfer => transfer.status === "pending");

  return (
    <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
      <div className="p-4 bg-[#1C2541] text-white flex justify-between items-center">
        <h3 className="font-bold">Pending Transfer Requests</h3>
        <a href="#" className="text-sm text-gray-200 hover:text-white">View All</a>
      </div>
      
      {pendingTransfers.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No pending transfer requests
        </div>
      ) : (
        pendingTransfers.map((transfer) => (
          <div key={transfer.id} className="border-b border-gray-200">
            <div className="p-4 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white">
                  <i className="fas fa-box"></i>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">{transfer.name}</h4>
                  <p className="text-sm text-gray-500 font-mono">SN: {transfer.serialNumber}</p>
                </div>
              </div>
              <div className="flex items-center">
                <StatusBadge status={transfer.status} className="mr-4" />
                <div className="flex space-x-2">
                  <button 
                    className="p-2 rounded-full bg-[#28A745] text-white hover:bg-opacity-90" 
                    title="Approve"
                    onClick={() => handleApprove(transfer.id)}
                  >
                    <i className="fas fa-check"></i>
                  </button>
                  <button 
                    className="p-2 rounded-full bg-[#DC3545] text-white hover:bg-opacity-90" 
                    title="Reject"
                    onClick={() => handleReject(transfer.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PendingTransfers;
