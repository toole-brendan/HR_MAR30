import { useState, useEffect, useRef } from "react";
import { scanQRCode, stopScanner } from "@/lib/qrScanner";
import { useToast } from "@/hooks/use-toast";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [flashOn, setFlashOn] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen && videoRef.current) {
      scanQRCode(videoRef.current, (result) => {
        toast({
          title: "QR Code Scanned",
          description: `Item found: ${result}`,
        });
        onClose();
      }, (error) => {
        toast({
          title: "Scan Error",
          description: error.message,
          variant: "destructive",
        });
      });
    }
    
    return () => {
      if (isOpen) {
        stopScanner();
      }
    };
  }, [isOpen, onClose, toast]);
  
  const toggleFlash = () => {
    setFlashOn(!flashOn);
    // In a real implementation, this would toggle the device flash
    toast({
      title: `Flash ${!flashOn ? 'On' : 'Off'}`,
      description: "Flash control would be implemented with device APIs",
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-full max-w-md mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#1C2541]">Scan QR Code</h3>
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-600">Position the QR code within the frame to scan.</p>
      </div>
      
      <div className="relative w-[280px] h-[280px] border-2 border-white rounded-[16px] overflow-hidden mb-4">
        <div className="absolute h-[2px] w-full bg-[#FFC107] animate-[scan_2s_infinite_linear]"></div>
        <video 
          ref={videoRef} 
          className="h-full w-full" 
          autoPlay 
          playsInline 
          muted
        ></video>
      </div>
      
      <div className="flex space-x-2">
        <button 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          onClick={toggleFlash}
        >
          <i className={`fas fa-bolt mr-2 ${flashOn ? 'text-[#FFC107]' : ''}`}></i>
          Flash
        </button>
        <button 
          className="px-4 py-2 bg-[#4B5320] text-white rounded-md hover:bg-opacity-90"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QRScannerModal;
