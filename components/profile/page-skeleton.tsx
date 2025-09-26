import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { DetailContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileCardSkeleton } from './card-skeleton';
import { ProfileFormSkeleton } from './form-skeleton';
import { ProfileAdditionalSettingsSkeleton } from './additional-settings-skeleton';

export function ProfilePageSkeleton() {
  return (
    <PageHome header={<PageHeader />}>
      <DetailContainer variant="wide" padding="md">
        <div className="space-y-8">
          {/* Profile Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" /> {/* Page title */}
            <Skeleton className="h-5 w-96" /> {/* Page description */}
          </div>

          {/* User Profile Card Skeleton */}
          <ProfileCardSkeleton />

          {/* User Profile Form Skeleton - Always shown during loading */}
          <ProfileFormSkeleton />

          {/* Additional Settings Card Skeleton */}
          <ProfileAdditionalSettingsSkeleton />
        </div>
      </DetailContainer>
    </PageHome>
  );
}
