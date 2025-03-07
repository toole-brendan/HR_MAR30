import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import PageHeader from './page-header';
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
  padding,
}) => {
  // Get layout properties from the hook
  const { containerClasses } = usePageLayout({
    fullWidth,
    width,
    basePadding: padding,
  });

  return (
    <div className={cn(containerClasses, className)}>
      {title && (
        <PageHeader
          title={title}
          description={description}
          actions={actions}
        />
      )}
      <main>{children}</main>
    </div>
  );
};

export default PageContainer;