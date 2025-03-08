import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  itemName: string;
  serialNumber: string;
  onGenerate?: (qrValue: string) => void;
}

/**
 * Component for generating QR codes for equipment items
 */
const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  itemName, 
  serialNumber,
  onGenerate 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const { toast } = useToast();

  // This would normally use a real QR code generation library
  const generateQRCode = () => {
    // Mock QR code generation - in a real app, we would use a library like qrcode.react
    const qrValue = JSON.stringify({
      type: "military_equipment",
      name: itemName,
      serialNumber: serialNumber,
      additionalInfo: additionalInfo || undefined,
      timestamp: new Date().toISOString()
    });
    
    // Mock SVG for QR code visualization
    const mockQrSvg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white" />
        <g fill="#1C2541">
          ${Array.from({ length: 8 }).map((_, i) => 
            Array.from({ length: 8 }).map((_, j) => 
              Math.random() > 0.5 ? 
              `<rect x="${i*20}" y="${j*20}" width="20" height="20" />` : ''
            ).join('')
          ).join('')}
        </g>
        <rect x="60" y="60" width="80" height="80" fill="white" />
        <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#4B5320">${serialNumber}</text>
      </svg>
    `;

    setQrImage(`data:image/svg+xml;base64,${btoa(mockQrSvg)}`);
    
    if (onGenerate) {
      onGenerate(qrValue);
    }
    
    toast({
      title: "QR Code Generated",
      description: `QR code for ${itemName} has been generated successfully.`
    });
  };

  const handlePrint = () => {
    toast({
      title: "Printing QR Code",
      description: "The QR code has been sent to the printer."
    });
    // In a real app, we would handle printing logic here
  };

  const handleReport = () => {
    toast({
      title: "QR Code Issue Reported",
      description: "Your report has been submitted. A new QR code will be issued."
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center space-x-2 bg-[#4B5320] hover:bg-[#3a4019] text-white"
      >
        <i className="fas fa-qrcode"></i>
        <span>Generate QR Code</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate QR Code</DialogTitle>
            <DialogDescription>
              Create a QR code for tracking and transferring this equipment item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Item</Label>
              <Input id="name" value={itemName} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serial" className="text-right">Serial #</Label>
              <Input id="serial" value={serialNumber} readOnly className="col-span-3 font-mono" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Input 
                id="notes" 
                placeholder="Additional information" 
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="col-span-3" 
              />
            </div>
          </div>
          
          {!qrImage ? (
            <div className="flex justify-center py-4">
              <Button onClick={generateQRCode} className="bg-[#4B5320] hover:bg-[#3a4019]">
                Generate QR Code
              </Button>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-4 flex flex-col items-center">
                <img src={qrImage} alt="QR Code for equipment" className="mb-4 max-w-[200px]" />
                <div className="text-xs text-center mb-4">
                  <p className="font-bold">{itemName}</p>
                  <p className="font-mono">{serialNumber}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <i className="fas fa-print mr-2"></i> Print
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={handleReport}>
                    <i className="fas fa-exclamation-triangle mr-2"></i> Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <DialogFooter className="sm:justify-start">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRCodeGenerator;