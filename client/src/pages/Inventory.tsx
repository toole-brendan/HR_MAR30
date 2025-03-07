import { useState } from "react";
import { inventory } from "@/lib/mockData";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransferRequest = (itemName: string) => {
    toast({
      title: "Transfer Initiated",
      description: `Transfer request initiated for ${itemName}`,
    });
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1C2541] mb-2">Inventory</h2>
        <p className="text-gray-600">Track and manage your equipment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
          <CardDescription>View and manage your assigned equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Input
                placeholder="Search by name or serial number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredInventory.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No items found</div>
            ) : (
              filteredInventory.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white">
                      <i className="fas fa-box"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                        <span className="font-mono">SN: {item.serialNumber}</span>
                        <span className="hidden sm:inline mx-2">•</span>
                        <span>Assigned: {item.assignedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-[#1C2541] hover:text-[#4B5320] p-2"
                      onClick={() => handleTransferRequest(item.name)}
                      title="Request Transfer"
                    >
                      <i className="fas fa-exchange-alt"></i>
                    </button>
                    <button 
                      className="text-[#1C2541] hover:text-[#4B5320] p-2"
                      onClick={() => {
                        toast({
                          title: "QR Code Generated",
                          description: `QR code for ${item.name} has been generated`,
                        });
                      }}
                      title="Generate QR Code"
                    >
                      <i className="fas fa-qrcode"></i>
                    </button>
                    <button 
                      className="text-[#1C2541] hover:text-[#4B5320] p-2"
                      onClick={() => {
                        toast({
                          title: "Item Details",
                          description: `Viewing details for ${item.name}`,
                        });
                      }}
                      title="View Details"
                    >
                      <i className="fas fa-info-circle"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Inventory;
