import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
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
   * Display mode: 'flex' or 'block'
   */
  display?: 'flex' | 'block' | 'grid';
  /**
   * Flex direction if display is 'flex'
   */
  flexDirection?: 'row' | 'column';
}

/**
 * ResponsiveContainer - A container that automatically adjusts to different viewport sizes
 * Handles padding, width, and layout adaptively
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  size = 'lg',
  withPadding = true,
  display = 'block',
  flexDirection = 'column',
}) => {
  // Define size classes that scale with the viewport
  const sizeClasses = {
    sm: 'w-full sm:w-[95%] md:w-[90%] lg:max-w-2xl',
    md: 'w-full sm:w-[95%] md:w-[90%] lg:max-w-3xl',
    lg: 'w-full sm:w-[95%] md:w-[90%] lg:max-w-5xl',
    xl: 'w-full sm:w-[95%] md:w-[90%] lg:max-w-7xl',
    full: 'w-full',
  };

  // Define padding classes that adapt to the viewport
  const paddingClasses = withPadding
    ? 'px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6'
    : '';

  // Define display classes
  const displayClasses = {
    flex: `flex ${flexDirection === 'row' ? 'flex-row' : 'flex-col'}`,
    block: 'block',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  };

  return (
    <div
      className={cn(
        'transition-all duration-200',
        sizeClasses[size],
        paddingClasses,
        displayClasses[display],
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;