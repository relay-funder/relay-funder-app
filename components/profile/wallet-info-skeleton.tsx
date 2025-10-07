import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';

export function WalletInfoSkeleton() {
  return (
    <Card className="rounded-lg border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" /> {/* Icon */}
          <Skeleton className="h-5 w-32" /> {/* Title */}
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64" /> {/* Description */}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connected Wallet Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" /> {/* Section title */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" /> {/* Icon */}
                <Skeleton className="h-4 w-16" /> {/* Address label */}
              </div>
              <Skeleton className="mt-1 h-12 w-full rounded-md" />{' '}
              {/* Address box */}
              <Skeleton className="mt-1 h-3 w-64" /> {/* Description */}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Icon */}
                  <Skeleton className="h-4 w-24" /> {/* Balance label */}
                </div>
                <Skeleton className="mt-1 h-12 w-full rounded-md" />{' '}
                {/* Balance box */}
                <Skeleton className="mt-1 h-3 w-48" /> {/* Description */}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Icon */}
                  <Skeleton className="h-4 w-28" /> {/* USDC label */}
                </div>
                <Skeleton className="mt-1 h-12 w-full rounded-md" />{' '}
                {/* USDC box */}
                <Skeleton className="mt-1 h-3 w-44" /> {/* Description */}
              </div>
            </div>
          </div>
        </div>

        {/* Network Information Section Skeleton */}
        <div className="space-y-4 border-t pt-6">
          <Skeleton className="h-6 w-44" /> {/* Section title */}
          <div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" /> {/* Icon */}
              <Skeleton className="h-4 w-32" /> {/* Network label */}
            </div>
            <Skeleton className="mt-1 h-16 w-full rounded-md" />{' '}
            {/* Network box */}
            <Skeleton className="mt-1 h-3 w-56" /> {/* Description */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
