import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ActivityLogItemProps {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  verified?: boolean;
}

export function ActivityLogItem({ 
  id, 
  title, 
  description, 
  timestamp, 
  verified = true 
}: ActivityLogItemProps) {
  return (
    <div className="py-4 border-b border-neutral-800 last:border-0">
      <div className="flex items-start">
        <div className="h-3 w-3 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <div className="font-medium text-sm">{title}</div>
            <div className="text-xs text-gray-400">{timestamp}</div>
          </div>
          {description && (
            <div className="text-xs text-gray-400 mb-2">{description}</div>
          )}
          {verified && (
            <Badge className="uppercase bg-green-900/30 text-green-500 border border-green-700/50 text-[10px] tracking-wider px-2 mt-1">
              Verified on blockchain
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}