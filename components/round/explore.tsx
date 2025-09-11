'use client';
import { useState } from 'react';
import { RoundCreate } from '@/components/round/create';
import { Button } from '@/components/ui';
import { RoundList } from '@/components/round/list';
import { PageHeaderSearch } from '@/components/page/header-search';
import { PageHome } from '@/components/page/home';

export function RoundExplore() {
  const [showRoundCreate, setShowRoundCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <PageHome
      header={
        <PageHeaderSearch
          onCreate={() => setShowRoundCreate(true)}
          createTitle="Create Round"
          placeholder="Search Rounds"
          onSearchChanged={(search: string) => setSearchTerm(search)}
        />
      }
    >
      {showRoundCreate ? (
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setShowRoundCreate(false)}
            className="mb-4"
          >
            ← Back to Rounds
          </Button>
          <RoundCreate />
        </div>
      ) : (
        <>
          <RoundList searchTerm={searchTerm} />
        </>
      )}
    </PageHome>
  );
}
