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
      "border border-white/10 bg-black overflow-hidden",
      className
    )}>
      <div className="p-6">
        <div className="uppercase text-xs tracking-wider font-medium text-gray-400 mb-2">{title}</div>
        
        <div className="text-4xl font-light text-white mb-4">{value}</div>
        
        {change && (
          <div className="flex items-center text-xs">
            <div className={cn(
              "flex items-center mr-2",
              change.direction === 'up' ? 'text-green-500' : 
              change.direction === 'down' ? 'text-red-500' : 
              'text-gray-500'
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
            <div className="text-gray-500">{change.label}</div>
          </div>
        )}
        
        {icon && (
          <div className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 bg-neutral-800/50 border border-white/10">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}