import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useIsMobile } from './use-mobile';
import { useApp } from '@/context/AppContext';

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
  const isMobile = useIsMobile();
  const { sidebarCollapsed } = useApp();
  
  // Use CSS variables for padding from our index.css
  const defaultPadding = 'page-wrapper';
  
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

  // Apply responsive scaling classes if enabled
  const scaleClasses = useMemo(() => {
    return responsiveScaling ? 'transition-all duration-200' : '';
  }, [responsiveScaling]);

  // Main content classes based on sidebar state
  const mainContentClasses = useMemo(() => {
    return sidebarCollapsed ? 'main-content sidebar-collapsed' : 'main-content';
  }, [sidebarCollapsed]);

  const combinedClasses = useMemo(() => {
    const baseClasses = [
      basePadding || defaultPadding,
      containerWidth,
      scaleClasses,
      isMobile ? '' : mainContentClasses, // Only apply main content classes if not mobile
      containerClasses
    ];
    
    return cn(...baseClasses);
  }, [basePadding, defaultPadding, containerWidth, scaleClasses, mainContentClasses, containerClasses, isMobile]);

  return {
    layoutClasses: combinedClasses,
    containerClasses: combinedClasses,
    mainContentClasses,
    containerWidth,
    defaultPadding,
    isMobile,
  };
}