import { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { scanQRCode, stopScanner } from '@/lib/qrScanner';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan?: (code: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ 
  isOpen, 
  onClose,
  onScan 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      setScanning(true);
      setError(null);
      
      // Start QR scanning
      scanQRCode(
        videoRef.current, 
        (result) => {
          console.log('QR Code scanned:', result);
          if (onScan) {
            onScan(result);
          }
          onClose();
        },
        (error) => {
          console.error('QR scanning error:', error);
          setError('Unable to access camera or scanning failed');
          setScanning(false);
        }
      );
    }

    return () => {
      // Clean up when component unmounts or modal closes
      if (scanning) {
        stopScanner();
        setScanning(false);
      }
    };
  }, [isOpen, onScan, onClose, scanning]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Scan QR Code
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          ) : (
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
          )}
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            <p>Center the QR code in the camera view to scan.</p>
          </div>
          
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;