import { useState } from "react";
import { inventory } from "@/lib/mockData";
import InventoryItem from "../common/InventoryItem";

const MyInventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-[#1C2541] text-white flex justify-between items-center">
        <h3 className="font-bold">My Inventory</h3>
        <a href="#" className="text-sm text-gray-200 hover:text-white">View All</a>
      </div>
      
      <div className="p-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search my inventory" 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B5320]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {filteredInventory.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No items found
          </div>
        ) : (
          filteredInventory.map((item) => (
            <InventoryItem key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyInventory;
