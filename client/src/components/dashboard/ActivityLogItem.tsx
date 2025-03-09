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
    <div className="py-3">
      <div className="flex items-start">
        <div className="h-3 w-3 rounded-full bg-purple-500 mt-1.5 mr-3 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</div>
          </div>
          {description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{description}</div>
          )}
          {verified && (
            <Badge className="uppercase bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-500 border border-green-200 dark:border-green-700/50 text-[10px] tracking-wider px-2 mt-1 rounded-none">
              Verified on blockchain
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}