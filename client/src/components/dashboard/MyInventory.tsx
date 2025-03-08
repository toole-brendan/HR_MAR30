import { useState } from "react";
import { inventory } from "@/lib/mockData";
import InventoryItem from "../common/InventoryItem";
import { Search, Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="overflow-hidden border border-border mb-6">
      <CardHeader className="bg-muted/40 pb-2">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">My Inventory</CardTitle>
        </div>
        <CardDescription>Recently assigned equipment</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4 bg-muted/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search my inventory" 
              className="w-full pl-9 bg-white dark:bg-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="divide-y divide-border">
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
      
      <CardFooter className="bg-muted/10 py-3">
        <Button 
          variant="ghost" 
          className="w-full text-xs flex items-center justify-center" 
          onClick={() => navigate("/property-book")}
        >
          View All Inventory
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyInventory;
