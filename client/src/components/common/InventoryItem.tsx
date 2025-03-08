import { useToast } from "@/hooks/use-toast";
import { InventoryItem as InventoryItemType } from "@/types";
import { Package, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <div className="p-4 hover:bg-muted/10 flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary">
          <Package className="h-4 w-4" />
        </div>
        <div className="ml-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{item.name}</h4>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                item.status === "active" 
                  ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border-green-200" 
                  : item.status === "pending" 
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200"
              }`}
            >
              {item.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">SN: {item.serialNumber}</p>
        </div>
      </div>
      <Button 
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
        onClick={handleTransferRequest}
      >
        <ArrowRightLeft className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InventoryItem;
