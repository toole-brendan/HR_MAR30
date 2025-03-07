import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader - Responsive header component for page containers
 * Scales with viewport size
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4', 
      'py-2 sm:py-3 md:py-4', 
      'transition-all duration-200',
      className
    )}>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">{title}</h1>
        {description && (
          <div className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex-shrink-0 flex items-center mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;