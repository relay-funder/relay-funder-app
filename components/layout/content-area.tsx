import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface ContentAreaProps {
  children: ReactNode;
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

  return (
    <div className={cn('w-full', spacingClasses[spacing], className)}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {title && (
              <div className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-base text-gray-600 sm:text-lg">
                {subtitle}
              </div>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-3">{actions}</div>
          )}
        </div>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}
