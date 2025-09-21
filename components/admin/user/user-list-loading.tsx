'use client';

import { Card, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

export type UserListLoadingProps = {
  minimal?: boolean;
  rows?: number;
  className?: string;
};

/**
 * Loading skeleton grid for the Admin User list.
 *
 * - minimal: renders a 1-row skeleton layout (useful for infinite loading)
 * - rows: override the number of skeleton cards to render
 * - className: extend/override container styles
 */
export function UserListLoading({
  minimal = false,
  rows,
  className,
}: UserListLoadingProps) {
  const count = rows ?? (minimal ? 1 : 6);

  return (
    <div
      className={cn(
        'grid gap-4',
        minimal
          ? 'grid-cols-1'
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>

          <div className="mb-2 grid grid-cols-2 gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default UserListLoading;
