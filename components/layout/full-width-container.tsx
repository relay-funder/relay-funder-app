import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface FullWidthContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'constrained' | 'detail' | 'edge-to-edge';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Full-width container component that handles proper spacing and alignment
 *
 * Variants:
 * - default: Full width with responsive padding and max-width constraint for wide displays
 * - constrained: Max width (7xl) with center alignment (for content-heavy pages)
 * - detail: Laptop-size max width (5xl) for detail pages like campaigns and rounds
 * - edge-to-edge: True full width with minimal padding (for hero sections, etc.)
 */
export function FullWidthContainer({
  children,
  className,
  variant = 'default',
  padding = 'md',
}: FullWidthContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-4',
    md: 'px-4 py-6 sm:px-6 lg:px-8',
    lg: 'px-6 py-8 sm:px-8 lg:px-12',
  };

  const variantClasses = {
    default: 'w-full max-w-[1600px] mx-auto',
    constrained: 'w-full max-w-7xl mx-auto',
    detail: 'w-full max-w-5xl mx-auto',
    'edge-to-edge': 'w-full',
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
