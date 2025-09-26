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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Wallet Details Card Skeleton */}
      <Card className="rounded-lg border bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" /> {/* Icon */}
            <Skeleton className="h-5 w-32" /> {/* Title */}
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" /> {/* Description */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" /> {/* Icon */}
              <Skeleton className="h-4 w-16" /> {/* Address label */}
            </div>
            <Skeleton className="h-8 w-full rounded bg-gray-50" />{' '}
            {/* Address box */}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" /> {/* Icon */}
              <Skeleton className="h-4 w-24" /> {/* Balance label */}
            </div>
            <Skeleton className="h-4 w-32" /> {/* Balance value */}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" /> {/* Icon */}
              <Skeleton className="h-4 w-28" /> {/* USDC label */}
            </div>
            <Skeleton className="h-4 w-24" /> {/* USDC value */}
          </div>
        </CardContent>
      </Card>

      {/* Chain Information Card Skeleton */}
      <Card className="rounded-lg border bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" /> {/* Icon */}
            <Skeleton className="h-5 w-32" /> {/* Title */}
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" /> {/* Description */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chain details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" /> {/* Chain icon */}
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" /> {/* Chain name */}
                <Skeleton className="h-4 w-16" /> {/* Chain ID */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
