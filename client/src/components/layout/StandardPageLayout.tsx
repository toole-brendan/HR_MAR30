import React, { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import { usePageLayout } from '@/hooks/use-page-layout';

interface StandardPageLayoutProps {
  title?: string;
  description?: string | ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  width?: 'default' | 'narrow' | 'wide' | 'full';
  fullWidth?: boolean;
}

/**
 * StandardPageLayout - A consistent wrapper for all pages
 * Ensures consistent padding, width constraints, and responsive behavior
 * with dynamic viewport scaling
 */
export function StandardPageLayout({
  title,
  description,
  actions,
  children,
  className,
  width = 'default',
  fullWidth = false
}: StandardPageLayoutProps) {
  const { layoutClasses } = usePageLayout({
    width,
    fullWidth,
    responsiveScaling: true
  });

  return (
    <div className={cn(
      'standard-page transition-all duration-200',
      layoutClasses,
      className
    )}>
      {title && (
        <PageHeader
          title={title}
          description={description}
          actions={actions}
          className="mb-4 sm:mb-5 md:mb-6"
        />
      )}
      <div className="w-full flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

export default StandardPageLayout;