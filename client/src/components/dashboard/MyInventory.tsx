import { useState } from "react";
import { inventory } from "@/lib/mockData";
import InventoryItem from "../common/InventoryItem";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

const MyInventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3); // Only show 3 items on dashboard
  
  return (
    <Card className="overflow-hidden border border-border mb-6 dashboard-card">
      {/* 8VC Style Header */}
      <div className="p-6 pb-4">
        {/* Category Label */}
        <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">
          INVENTORY ALERT
        </div>
        {/* Main Title */}
        <div className="text-lg font-normal text-gray-900 dark:text-white">
          Low stock items
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search inventory" 
              className="w-full pl-9 bg-white dark:bg-white/10 rounded-none border-gray-200 dark:border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="divide-y divide-border px-6">
          {filteredInventory.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No items found
            </div>
          ) : (
            filteredInventory.map((item) => (
              <InventoryItem key={item.id} item={item} />
            ))
          )}
        </div>
      </CardContent>
      
      {/* 8VC Style Footer with right-aligned View All link */}
      <div className="px-6 py-4 flex justify-end">
        <Button 
          variant="ghost" 
          className="text-xs uppercase tracking-wider text-primary hover:bg-transparent hover:text-primary-600"
          onClick={() => navigate("/property-book")}
        >
          VIEW ALL
        </Button>
      </div>
    </Card>
  );
};

export default MyInventory;
