'use client';
import { useState } from 'react';
import { CampaignCreate } from '@/components/campaign/create';
import { Button } from '@/components/ui';
import { CampaignList } from '@/components/campaign/list';
import { HomeCategorySelect } from '@/components/home/category-select';
import { HomeExplore } from '@/components/home/explore';
import { PageHeaderSearch } from '@/components/page/header-search';
import { PageHome } from '@/components/page/home';
import { Web3ContextProvider } from '@/lib/web3/context-provider';

export function ExploreStories() {
  const [showCampaignCreate, setShowCampaignCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <PageHome
      header={
        <PageHeaderSearch
          onCreate={() => setShowCampaignCreate(true)}
          createTitle="Create Story"
          placeholder="Search Stories"
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
          />
        </>
      )}
    </PageHome>
  );
}
