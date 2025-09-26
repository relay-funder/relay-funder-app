import { Card, CardContent } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileCardSkeleton() {
  return (
    <Card className="rounded-lg border bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            {/* Avatar skeleton */}
            <Skeleton className="h-16 w-16 rounded-full" />

            <div className="flex-1 space-y-3">
              {/* Name and username section */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-48" /> {/* Name */}
                  <Skeleton className="h-5 w-12 rounded-full" />{' '}
                  {/* Admin badge */}
                </div>
                <Skeleton className="h-4 w-24" /> {/* Username */}
              </div>

              {/* Contact info section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Icon */}
                  <Skeleton className="h-4 w-80" /> {/* Wallet address */}
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Icon */}
                  <Skeleton className="h-4 w-48" /> {/* Email */}
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Icon */}
                  <Skeleton className="h-4 w-40" /> {/* Last login */}
                </div>
              </div>

              {/* Bio section */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Edit button */}
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Logout button */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
