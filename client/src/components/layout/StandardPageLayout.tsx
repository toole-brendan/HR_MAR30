import React, { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import ResponsiveContainer from '@/components/ui/responsive-container';

interface StandardPageLayoutProps {
  title?: string;
  description?: string | ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /**
   * Container size preset
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Whether to apply padding
   */
  withPadding?: boolean;
  /**
   * Display mode for content layout
   */
  display?: 'flex' | 'block' | 'grid';
}

/**
 * StandardPageLayout - A consistent wrapper for all pages
 * Uses ResponsiveContainer for dynamic viewport scaling
 */
export function StandardPageLayout({
  title,
  description,
  actions,
  children,
  className,
  size = 'lg',
  withPadding = true,
  display = 'block'
}: StandardPageLayoutProps) {
  return (
    <ResponsiveContainer
      size={size}
      withPadding={withPadding}
      display={display}
      className={cn('standard-page', className)}
    >
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
    </ResponsiveContainer>
  );
}

export default StandardPageLayout;