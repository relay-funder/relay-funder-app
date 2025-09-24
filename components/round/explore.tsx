'use client';
import { useState } from 'react';
import { RoundCreate } from '@/components/round/create';
import { Button } from '@/components/ui';
import { RoundList } from '@/components/round/list';
import { RoundCard } from '@/components/round/round-card';
import { PageHeaderSearch } from '@/components/page/header-search';
import { PageHome } from '@/components/page/home';
import { useAuth } from '@/contexts';

export function RoundExplore() {
  const [showRoundCreate, setShowRoundCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isAdmin } = useAuth();
  return (
    <PageHome
      header={
        <PageHeaderSearch
          onCreate={isAdmin ? () => setShowRoundCreate(true) : undefined}
          createTitle="Create Round"
          placeholder="Search Rounds"
          onSearchChanged={(search: string) => setSearchTerm(search)}
          containerWidth="default"
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
          <RoundList
            searchTerm={searchTerm}
            item={(props) => <RoundCard {...props} type="enhanced" />}
          />
        </>
      )}
    </PageHome>
  );
}
