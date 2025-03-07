import { useState } from "react";
import { transfers } from "@/lib/mockData";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/common/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const Transfers: React.FC = () => {
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
  const approvedTransfers = transferList.filter(transfer => transfer.status === "approved");
  const rejectedTransfers = transferList.filter(transfer => transfer.status === "rejected");

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1C2541] mb-2">Transfer Requests</h2>
        <p className="text-gray-600">Manage equipment transfer requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Transfer Management</CardTitle>
          <CardDescription>View and manage all transfer requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending <span className="ml-2 bg-[#FFC107] text-white text-xs rounded-full px-2">{pendingTransfers.length}</span>
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <div className="divide-y divide-gray-200">
                {pendingTransfers.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">No pending transfer requests</div>
                ) : (
                  pendingTransfers.map((transfer) => (
                    <div key={transfer.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white">
                          <i className="fas fa-box"></i>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{transfer.name}</h4>
                          <div className="flex text-sm text-gray-500">
                            <span className="font-mono">SN: {transfer.serialNumber}</span>
                            <span className="mx-2">•</span>
                            <span>From: {transfer.from}</span>
                          </div>
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
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="approved">
              <div className="divide-y divide-gray-200">
                {approvedTransfers.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">No approved transfer requests</div>
                ) : (
                  approvedTransfers.map((transfer) => (
                    <div key={transfer.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white">
                          <i className="fas fa-box"></i>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{transfer.name}</h4>
                          <div className="flex text-sm text-gray-500">
                            <span className="font-mono">SN: {transfer.serialNumber}</span>
                            <span className="mx-2">•</span>
                            <span>From: {transfer.from}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={transfer.status} />
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="rejected">
              <div className="divide-y divide-gray-200">
                {rejectedTransfers.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">No rejected transfer requests</div>
                ) : (
                  rejectedTransfers.map((transfer) => (
                    <div key={transfer.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white">
                          <i className="fas fa-box"></i>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{transfer.name}</h4>
                          <div className="flex text-sm text-gray-500">
                            <span className="font-mono">SN: {transfer.serialNumber}</span>
                            <span className="mx-2">•</span>
                            <span>From: {transfer.from}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={transfer.status} />
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all">
              <div className="divide-y divide-gray-200">
                {transferList.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">No transfer requests</div>
                ) : (
                  transferList.map((transfer) => (
                    <div key={transfer.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white">
                          <i className="fas fa-box"></i>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{transfer.name}</h4>
                          <div className="flex text-sm text-gray-500">
                            <span className="font-mono">SN: {transfer.serialNumber}</span>
                            <span className="mx-2">•</span>
                            <span>From: {transfer.from}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={transfer.status} />
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default Transfers;
