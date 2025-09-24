'use client';
import { useState, useEffect } from 'react';
import { CampaignCreate } from '@/components/campaign/create';
import { Button } from '@/components/ui';
import { CampaignList } from '@/components/campaign/list';
import { HomeCategorySelect } from '@/components/home/category-select';
import { HomeExplore } from '@/components/home/explore';
import { PageHeaderSearch } from '@/components/page/header-search';
import { PageHome } from '@/components/page/home';
import { Web3ContextProvider } from '@/lib/web3/context-provider';
import { useSearchParams } from 'next/navigation';

export function ExploreStories() {
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
    <PageHome
      header={
        <PageHeaderSearch
          placeholder="Search Campaigns"
          onSearchChanged={(search: string) => setSearchTerm(search)}
        />
      }
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
          <HomeCategorySelect onSelected={setSelectedCategory} />

          <CampaignList
            searchTerm={searchTerm}
            categoryFilter={selectedCategory}
            withRounds={false}
          />
        </>
      )}
    </PageHome>
  );
}
