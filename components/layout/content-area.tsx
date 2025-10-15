import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface ContentAreaProps {
  children?: ReactNode;
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  spacing?: 'tight' | 'normal' | 'relaxed';
}

/**
 * Content area component that ensures consistent alignment and spacing
 *
 * Provides:
 * - Consistent title and content alignment
 * - Proper spacing between sections
 * - Action button alignment
 */
export function ContentArea({
  children,
  className,
  title,
  subtitle,
  actions,
  spacing = 'normal',
}: ContentAreaProps) {
  const spacingClasses = {
    tight: 'space-y-4',
    normal: 'space-y-6',
    relaxed: 'space-y-8',
  };

  // Add bottom padding of 12px (pb-3) for 10-20px range
  return (
    <div className={cn('w-full', spacingClasses[spacing], 'pb-5', className)}>
      {(title || subtitle || actions) && (
        <div
          className={cn(
            'flex flex-col gap-4 sm:flex-row sm:items-start',
            actions ? 'sm:justify-between' : 'sm:justify-center',
          )}
        >
          <div className="space-y-2">
            {title && (
              <div className="bg-gradient-to-br from-foreground to-quantum bg-clip-text pb-2 font-display text-3xl font-light leading-[0.95] tracking-tight text-transparent md:text-4xl lg:text-6xl">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-base text-muted-foreground sm:text-lg">
                {subtitle}
              </div>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-3">{actions}</div>
          )}
        </div>
      )}
      {children && <div className="w-full">{children}</div>}
    </div>
  );
}
