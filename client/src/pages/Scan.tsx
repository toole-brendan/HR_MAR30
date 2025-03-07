import { useState } from "react";
import QRScannerModal from "@/components/modals/QRScannerModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Scan: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);

  const openScanner = () => {
    setScannerOpen(true);
  };

  const closeScanner = () => {
    setScannerOpen(false);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1C2541] mb-2">QR Scanner</h2>
        <p className="text-gray-600">Scan QR codes to find and transfer equipment</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How to scan equipment</CardTitle>
          <CardDescription>Follow these steps to scan and manage equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Position the QR code within the scanner frame</li>
            <li>Hold steady until the code is recognized</li>
            <li>Verify the equipment details displayed</li>
            <li>Proceed with the transfer or inventory action</li>
          </ol>
          <div className="mt-6 flex justify-center">
            <Button 
              className="bg-[#4B5320] hover:bg-[#3a4019] text-white py-6 px-8 text-lg"
              onClick={openScanner}
            >
              <i className="fas fa-qrcode mr-2"></i>
              Open Scanner
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recently Scanned</CardTitle>
          <CardDescription>Your scan history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            <div className="py-3 flex items-center">
              <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white mr-3">
                <i className="fas fa-box"></i>
              </div>
              <div>
                <p className="font-medium">M4A1 Carbine</p>
                <p className="text-sm text-gray-500 font-mono">SN: 88574921</p>
              </div>
              <p className="ml-auto text-sm text-gray-500">2 hours ago</p>
            </div>
            <div className="py-3 flex items-center">
              <div className="h-10 w-10 bg-[#4B5320] rounded-full flex items-center justify-center text-white mr-3">
                <i className="fas fa-box"></i>
              </div>
              <div>
                <p className="font-medium">Night Vision Goggles</p>
                <p className="text-sm text-gray-500 font-mono">SN: 74835621</p>
              </div>
              <p className="ml-auto text-sm text-gray-500">Yesterday</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <QRScannerModal isOpen={scannerOpen} onClose={closeScanner} />
    </>
  );
};

export default Scan;
