import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  variant?: 'cards' | 'wide-cards' | 'compact';
}

/**
 * Unified responsive grid component for consistent layouts across the site
 *
 * Breakpoints:
 * - Mobile (default): 1 column
 * - Small (sm): 2 columns
 * - Medium (md): 4 columns (small screens, matches stats layout)
 * - Large (lg): 3 columns (default maximum for normal laptop displays)
 * - Extra Large (xl): 3 columns (maintained for consistency)
 * - 2XL (2xl): 4 columns (only on very wide displays)
 */
export function ResponsiveGrid({
  children,
  className,
  gap = 'md',
  variant = 'cards',
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 lg:gap-6',
    lg: 'gap-6 lg:gap-8',
  };

  const gridClasses = {
    // Standard cards (campaigns, collections, etc.) - 4 columns on small screens to match stats layout
    cards:
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4',
    // Wide cards (rounds, featured content, etc.) - fewer columns for better readability
    'wide-cards': 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    // Compact items (tags, filters, etc.) - more columns allowed for small items
    compact:
      'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
  };

  return (
    <div
      className={cn('grid', gridClasses[variant], gapClasses[gap], className)}
    >
      {children}
    </div>
  );
}
