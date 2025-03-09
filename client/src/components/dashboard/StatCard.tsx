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
    <Card className={cn(
      "rounded-md border border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900 dashboard-card shadow-sm overflow-hidden",
      className
    )}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="text-gray-400 font-medium text-sm">{title}</div>
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800">
              {icon}
            </div>
          )}
        </div>
        
        <div className="text-2xl font-semibold mb-4">{value}</div>
        
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
      </CardContent>
    </Card>
  );
}