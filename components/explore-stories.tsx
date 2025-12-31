'use client';
import { useState, useEffect } from 'react';
import { CampaignCreate } from '@/components/campaign/create';
import { Button } from '@/components/ui';
import { CampaignList } from '@/components/campaign/list';
import { HomeCategorySelect } from '@/components/home/category-select';
import { HomeExplore } from '@/components/home/explore';
import { RoundSpotlight } from '@/components/home/round-spotlight';
import { PageLayout } from '@/components/page/layout';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
import { useSearchParams } from 'next/navigation';
import { useFunnelTracking } from '@/hooks/use-funnel-tracking';


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
