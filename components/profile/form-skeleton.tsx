import { Card, CardContent, CardHeader } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileFormSkeleton() {
  return (
    <Card className="rounded-lg border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" /> {/* Icon */}
          <Skeleton className="h-6 w-24" /> {/* Title */}
        </div>
        <Skeleton className="h-4 w-96" /> {/* Description */}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" /> {/* Section title */}
            {/* First and Last Name row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Icon */}
                  <Skeleton className="h-4 w-20" /> {/* Label */}
                </div>
                <Skeleton className="h-10 w-full" /> {/* Input */}
                <Skeleton className="h-4 w-64" /> {/* Description */}
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-20" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
                <Skeleton className="h-4 w-64" /> {/* Description */}
              </div>
            </div>
            {/* Email field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" /> {/* Icon */}
                <Skeleton className="h-4 w-28" /> {/* Label */}
              </div>
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="h-4 w-80" /> {/* Description */}
            </div>
            {/* Username field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" /> {/* Icon */}
                <Skeleton className="h-4 w-20" /> {/* Label */}
              </div>
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="h-4 w-72" /> {/* Description */}
            </div>
            {/* Bio field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="h-4 w-56" /> {/* Description */}
            </div>
          </div>

          {/* Wallet Settings Section */}
          <div className="space-y-4 border-t pt-6">
            <Skeleton className="h-6 w-32" /> {/* Section title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" /> {/* Icon */}
                <Skeleton className="h-4 w-48" /> {/* Label */}
              </div>
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="w-88 h-4" /> {/* Description */}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <Skeleton className="h-10 w-32" /> {/* Button */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
