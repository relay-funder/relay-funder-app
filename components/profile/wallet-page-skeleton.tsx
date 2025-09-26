import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { DetailContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { WalletInfoSkeleton } from './wallet-info-skeleton';

export function WalletPageSkeleton() {
  return (
    <PageHome header={<PageHeader />}>
      <DetailContainer variant="wide" padding="md">
        <div className="space-y-8">
          {/* Wallet Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" /> {/* Page title */}
            <Skeleton className="h-5 w-96" /> {/* Page description */}
          </div>

          {/* Wallet Info Skeleton */}
          <WalletInfoSkeleton />
        </div>
      </DetailContainer>
    </PageHome>
  );
}
