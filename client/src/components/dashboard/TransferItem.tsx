import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TransferItemProps {
  id: string;
  name: string;
  source: string;
  destination?: string; // Optional for outbound transfers
  status: 'pending' | 'completed';
  direction: 'inbound' | 'outbound';
  onAccept?: () => void;
  onDecline?: () => void;
}

export function TransferItem({ 
  id, 
  name, 
  source, 
  destination, 
  status, 
  direction,
  onAccept,
  onDecline
}: TransferItemProps) {
  return (
    <div className="py-3 flex items-start">
      <div className="flex-1">
        <div className="flex items-center mb-1">
          {direction === 'inbound' ? (
            <ArrowRight className="h-4 w-4 text-purple-500 mr-2" />
          ) : (
            <ArrowLeft className="h-4 w-4 text-purple-500 mr-2" />
          )}
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{name}</div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
          {direction === 'inbound' 
            ? `From: ${source}` 
            : `To: ${destination}`}
        </div>
      </div>
      
      {status === 'pending' && onAccept && onDecline ? (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-transparent border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 uppercase text-xs tracking-wider"
            onClick={onAccept}
          >
            Accept
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 uppercase text-xs tracking-wider"
            onClick={onDecline}
          >
            Decline
          </Button>
        </div>
      ) : status === 'pending' ? (
        <Badge className="uppercase bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-200 dark:border-amber-700/50 text-[10px] tracking-wider px-2">
          Pending
        </Badge>
      ) : (
        <Badge className="uppercase bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-500 border border-green-200 dark:border-green-700/50 text-[10px] tracking-wider px-2">
          Completed
        </Badge>
      )}
    </div>
  );
}