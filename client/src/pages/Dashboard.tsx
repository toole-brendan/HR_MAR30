import { useState } from "react";
import QuickActions from "@/components/dashboard/QuickActions";
import PendingTransfers from "@/components/dashboard/PendingTransfers";
import RecentActivity from "@/components/dashboard/RecentActivity";
import MyInventory from "@/components/dashboard/MyInventory";
import QRScannerModal from "@/components/modals/QRScannerModal";
import { useAuth } from "@/context/AuthContext";

const Dashboard: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const { user } = useAuth();

  const openScanner = () => {
    setScannerOpen(true);
  };

  const closeScanner = () => {
    setScannerOpen(false);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1C2541] mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome back, {user?.name}. You have 8 pending transfer requests.</p>
      </div>
      
      <QuickActions openScanner={openScanner} />
      
      <PendingTransfers />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <MyInventory />
      </div>

      <QRScannerModal isOpen={scannerOpen} onClose={closeScanner} />
    </>
  );
};

export default Dashboard;
