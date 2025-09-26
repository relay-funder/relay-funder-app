import { Card, CardContent, CardHeader } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileAdditionalSettingsSkeleton() {
  return (
    <Card className="rounded-lg border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" /> {/* Icon */}
          <Skeleton className="h-6 w-36" /> {/* Title */}
        </div>
        <Skeleton className="h-4 w-72" /> {/* Description */}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Wallet Settings Button */}
          <div className="h-auto w-full rounded-md border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" /> {/* Icon */}
              <div className="space-y-1 text-left">
                <Skeleton className="h-4 w-24" /> {/* Button title */}
                <Skeleton className="h-3 w-32" /> {/* Button subtitle */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
