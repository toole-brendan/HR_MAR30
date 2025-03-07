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
  /**
   * Whether to apply responsive scaling
   */
  responsiveScaling?: boolean;
}

/**
 * Hook for managing page layout properties consistently across the app
 * with improved viewport scaling
 */
export function usePageLayout({
  fullWidth = false,
  width = 'default',
  basePadding,
  containerClasses,
  responsiveScaling = true,
}: PageLayoutOptions = {}) {
  // Default padding that scales with viewport size
  const defaultPadding = 'px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6';
  
  const containerWidth = useMemo(() => {
    if (fullWidth) return 'w-full';
    
    switch (width) {
      case 'narrow':
        return 'w-full sm:w-[95%] md:w-[90%] lg:max-w-3xl mx-auto';
      case 'wide':
        return 'w-full sm:w-[95%] md:w-[90%] lg:max-w-7xl mx-auto';
      case 'full':
        return 'w-full';
      case 'default':
      default:
        return 'w-full sm:w-[95%] md:w-[90%] lg:max-w-5xl mx-auto';
    }
  }, [fullWidth, width]);

  // Apply responsive scaling classes if enabled
  const scaleClasses = useMemo(() => {
    return responsiveScaling ? 'transition-all duration-200' : '';
  }, [responsiveScaling]);

  const combinedClasses = useMemo(() => {
    return cn(
      basePadding || defaultPadding,
      containerWidth,
      scaleClasses,
      containerClasses
    );
  }, [basePadding, defaultPadding, containerWidth, scaleClasses, containerClasses]);

  return {
    layoutClasses: combinedClasses,
    containerClasses: combinedClasses,
    containerWidth,
    defaultPadding,
  };
}