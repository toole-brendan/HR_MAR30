import React, { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import { usePageLayout } from '@/hooks/use-page-layout';

interface PageContainerProps {
  title?: string;
  description?: string | ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  /**
   * Container width preset: 'default' | 'narrow' | 'wide' | 'full'
   */
  width?: 'default' | 'narrow' | 'wide' | 'full';
  /**
   * Custom padding to override the default
   */
  padding?: string;
}

/**
 * PageContainer - A responsive container for page content
 * 
 * Uses the usePageLayout hook to apply consistent layout properties
 * across different pages and screen sizes
 */
const PageContainer: React.FC<PageContainerProps> = ({ 
  title, 
  description, 
  actions, 
  children, 
  className,
  fullWidth = false,
  width = 'default',
  padding
}) => {
  const { layoutClasses } = usePageLayout({
    fullWidth,
    width,
    basePadding: padding || 'p-4 md:p-6',
    containerClasses: className
  });

  return (
    <div className={cn(
      "page-container",
      layoutClasses
    )}>
      {title && (
        <PageHeader 
          title={title} 
          description={description} 
          actions={actions}
          className="mb-4" 
        />
      )}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;