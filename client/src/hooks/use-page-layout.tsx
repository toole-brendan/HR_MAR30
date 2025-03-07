import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface PageLayoutOptions {
  /**
   * Whether to use full width layout
   */
  fullWidth?: boolean;
  /**
   * Container width preset: 'default' | 'narrow' | 'wide' | 'full'
   */
  width?: 'default' | 'narrow' | 'wide' | 'full';
  /**
   * Base padding to apply
   */
  basePadding?: string;
  /**
   * Additional container classes
   */
  containerClasses?: string;
}

/**
 * Hook for managing page layout properties consistently across the app
 */
export function usePageLayout({
  fullWidth = false,
  width = 'default',
  basePadding = 'p-4 md:p-6',
  containerClasses,
}: PageLayoutOptions = {}) {
  const containerWidth = useMemo(() => {
    if (fullWidth) return 'w-full';
    
    switch (width) {
      case 'narrow':
        return 'max-w-3xl mx-auto';
      case 'wide':
        return 'max-w-7xl mx-auto';
      case 'full':
        return 'w-full';
      case 'default':
      default:
        return 'max-w-5xl mx-auto';
    }
  }, [fullWidth, width]);

  const layoutClasses = useMemo(() => {
    return cn(
      basePadding,
      containerWidth,
      containerClasses
    );
  }, [basePadding, containerWidth, containerClasses]);

  return {
    layoutClasses,
    containerWidth,
  };
}