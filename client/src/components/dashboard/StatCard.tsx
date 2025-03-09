import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function StatCard({ title, value, icon, change, className }: StatCardProps) {
  return (
    <div className={cn(
      "border border-gray-200 dark:border-white/10 bg-white dark:bg-black overflow-hidden",
      className
    )}>
      <div className="p-4 relative">
        {/* Category Label */}
        <div className="uppercase text-xs tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</div>
        
        {/* Main Value */}
        <div className="text-3xl font-light text-gray-900 dark:text-white mb-2">{value}</div>
        
        {/* Change indicator */}
        {change && (
          <div className="flex items-center text-xs">
            <div className={cn(
              "flex items-center mr-2",
              change.direction === 'up' ? 'text-green-600 dark:text-green-500' : 
              change.direction === 'down' ? 'text-red-600 dark:text-red-500' : 
              'text-gray-600 dark:text-gray-400'
            )}>
              {change.direction === 'up' ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : change.direction === 'down' ? (
                <ArrowDown className="h-3 w-3 mr-1" />
              ) : (
                <Minus className="h-3 w-3 mr-1" />
              )}
              {change.value}%
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {change.label}
            </div>
          </div>
        )}
        
        {/* Icon in the right corner */}
        {icon && (
          <div className="absolute top-4 right-4 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}