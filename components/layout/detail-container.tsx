import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface DetailContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'standard' | 'wide' | 'narrow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Container specifically designed for detail pages (campaigns, rounds, profiles, etc.)
 * Enforces laptop-friendly max-widths to prevent content from being too wide on large displays
 *
 * Variants:
 * - standard: Default laptop-size max width (5xl) for most detail pages
 * - wide: Slightly wider (6xl) for content that needs more space
 * - narrow: Narrower (4xl) for text-heavy content that benefits from shorter line lengths
 */
export function DetailContainer({
  children,
  className,
  variant = 'standard',
  padding = 'md',
}: DetailContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-4',
    md: 'px-4 py-6 sm:px-6 lg:px-8',
    lg: 'px-6 py-8 sm:px-8 lg:px-12',
  };

  const variantClasses = {
    standard: 'w-full max-w-5xl mx-auto',
    wide: 'w-full max-w-6xl mx-auto',
    narrow: 'w-full max-w-4xl mx-auto',
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
