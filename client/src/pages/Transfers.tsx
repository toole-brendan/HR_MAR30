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
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Filter, CheckCircle, XCircle } from "lucide-react";

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

  // Page actions for consistent header layout
  const actions = (
    <Button size="sm" variant="outline" className="flex items-center gap-1">
      <Filter className="h-4 w-4" />
      <span>Filter</span>
    </Button>
  );

  return (
    <PageWrapper withPadding={true}>
      <PageHeader
        title="Transfer Requests"
        description="Manage equipment transfer requests"
        actions={actions}
        className="mb-4 sm:mb-5 md:mb-6"
      />

      <Card>
        <CardHeader>
          <CardTitle>Equipment Transfer Management</CardTitle>
          <CardDescription>View and manage all transfer requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2">{pendingTransfers.length}</span>
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingTransfers.length === 0 ? (
                  <div className="py-4 text-center text-gray-500 dark:text-gray-400">No pending transfer requests</div>
                ) : (
                  pendingTransfers.map((transfer) => (
                    <div key={transfer.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4B5320] dark:bg-[#5A6433] rounded-full flex items-center justify-center text-white">
                          <Filter className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{transfer.name}</h4>
                          <div className="flex text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-mono">SN: {transfer.serialNumber}</span>
                            <span className="mx-2">•</span>
                            <span>From: {transfer.from}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge status={transfer.status} className="mr-4" />
                        <div className="flex space-x-2">
                          <Button 
                            size="icon"
                            className="h-9 w-9 rounded-full bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                            onClick={() => handleApprove(transfer.id)}
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                          <Button 
                            size="icon"
                            className="h-9 w-9 rounded-full bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                            onClick={() => handleReject(transfer.id)}
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="approved">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {approvedTransfers.length === 0 ? (
                  <div className="py-4 text-center text-gray-500 dark:text-gray-400">No approved transfer requests</div>
                ) : (
                  approvedTransfers.map((transfer) => (
                    <div key={transfer.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4B5320] dark:bg-[#5A6433] rounded-full flex items-center justify-center text-white">
                          <Filter className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{transfer.name}</h4>
                          <div className="flex text-sm text-gray-500 dark:text-gray-400">
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
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {rejectedTransfers.length === 0 ? (
                  <div className="py-4 text-center text-gray-500 dark:text-gray-400">No rejected transfer requests</div>
                ) : (
                  rejectedTransfers.map((transfer) => (
                    <div key={transfer.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4B5320] dark:bg-[#5A6433] rounded-full flex items-center justify-center text-white">
                          <Filter className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{transfer.name}</h4>
                          <div className="flex text-sm text-gray-500 dark:text-gray-400">
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
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {transferList.length === 0 ? (
                  <div className="py-4 text-center text-gray-500 dark:text-gray-400">No transfer requests</div>
                ) : (
                  transferList.map((transfer) => (
                    <div key={transfer.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4B5320] dark:bg-[#5A6433] rounded-full flex items-center justify-center text-white">
                          <Filter className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{transfer.name}</h4>
                          <div className="flex text-sm text-gray-500 dark:text-gray-400">
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
    </PageWrapper>
  );
};

export default Transfers;
