'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui';
import { CampaignList } from '@/components/campaign/list';
import { HomeCategorySelect } from '@/components/home/category-select';
import { HomeExplore } from '@/components/home/explore';
import { RoundSpotlight } from '@/components/home/round-spotlight';
import { PageLayout } from '@/components/page/layout';
import { useSearchParams } from 'next/navigation';
import { useFunnelTracking } from '@/hooks/use-funnel-tracking';

const CampaignCreate = dynamic(
  () =>
    import('@/components/campaign/create').then((mod) => mod.CampaignCreate),
  { ssr: false },
);

const Web3ContextProvider = dynamic(
  () =>
    import('@/lib/web3/context-provider').then(
      (mod) => mod.Web3ContextProvider,
    ),
  { ssr: false },
);

export function ExploreStories() {
  useFunnelTracking();

  const [showCampaignCreate, setShowCampaignCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('create')) {
      setShowCampaignCreate(true);
    }
  }, [searchParams]);
  return (
    <PageLayout
      searchPlaceholder="Search Campaigns"
      onSearchChanged={(search: string) => setSearchTerm(search)}
    >
      {showCampaignCreate ? (
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setShowCampaignCreate(false)}
            className="mb-4"
          >
            ← Back to Stories
          </Button>
          <Web3ContextProvider>
            <CampaignCreate />
          </Web3ContextProvider>
        </div>
      ) : (
        <>
          <HomeExplore />
          <div className="space-y-8">
            <HomeCategorySelect onSelected={setSelectedCategory} />
            <CampaignList
              searchTerm={searchTerm}
              categoryFilter={selectedCategory}
              withRounds={false}
            />
            <RoundSpotlight />
          </div>
        </>
      )}
    </PageLayout>
  );
}
