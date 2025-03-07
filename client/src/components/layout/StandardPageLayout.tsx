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
}

/**
 * StandardPageLayout - A consistent wrapper for all pages
 * Ensures consistent padding, width constraints, and responsive behavior
 */
export function StandardPageLayout({
  title,
  description,
  actions,
  children,
  className
}: StandardPageLayoutProps) {
  const { layoutClasses } = usePageLayout({
    width: 'default',
    basePadding: 'p-4 md:p-6 lg:p-8'
  });

  return (
    <div className={cn(
      'standard-page',
      layoutClasses,
      className
    )}>
      {title && (
        <PageHeader
          title={title}
          description={description}
          actions={actions}
          className="mb-6"
        />
      )}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

export default StandardPageLayout;