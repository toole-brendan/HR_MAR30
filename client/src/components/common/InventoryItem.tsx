import { useToast } from "@/hooks/use-toast";
import { InventoryItem as InventoryItemType } from "@/types";

interface InventoryItemProps {
  item: InventoryItemType;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ item }) => {
  const { toast } = useToast();

  const handleTransferRequest = () => {
    toast({
      title: "Transfer Initiated",
      description: `Transfer request initiated for ${item.name}`,
    });
  };

  return (
    <div className="p-4 hover:bg-gray-50 flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white">
          <i className="fas fa-box"></i>
        </div>
        <div className="ml-4">
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-gray-500 font-mono">SN: {item.serialNumber}</p>
        </div>
      </div>
      <button 
        className="text-[#1C2541] hover:text-[#4B5320]"
        onClick={handleTransferRequest}
      >
        <i className="fas fa-exchange-alt"></i>
      </button>
    </div>
  );
};

export default InventoryItem;
