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
      'pt-8 sm:pt-10 md:pt-12 pb-2 sm:pb-3', /* Top padding to move title down */
      'transition-all duration-200',
      className
    )}>
      {/* Theme-aware background container for page title */}
      <div className="bg-white dark:bg-black text-black dark:text-white rounded-md shadow-md w-full mb-4 px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">{title}</h1>
            {description && (
              <div className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
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
      </div>
    </div>
  );
};

export default PageHeader;