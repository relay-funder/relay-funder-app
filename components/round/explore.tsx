'use client';
import { useState } from 'react';
import { RoundCreate } from '@/components/round/create';
import { Button } from '@/components/ui';
import { RoundList } from '@/components/round/list';
import { RoundCard } from '@/components/round/round-card';
import { PageLayout } from '@/components/page/layout';
import { useAuth } from '@/contexts';

export function RoundExplore({
  forceUserView = false,
}: {
  forceUserView?: boolean;
}) {
  const [showRoundCreate, setShowRoundCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isAdmin: authIsAdmin } = useAuth();

  // Force user view if specified, otherwise use actual admin status
  const isAdmin = forceUserView ? false : authIsAdmin;
  return (
    <PageLayout
      title="Funding Rounds"
      searchPlaceholder="Search Rounds"
      onSearchChanged={(search: string) => setSearchTerm(search)}
      onCreate={isAdmin ? () => setShowRoundCreate(true) : undefined}
      createTitle="Create Round"
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
            item={(props) => (
              <RoundCard
                {...props}
                type="enhanced"
                forceUserView={forceUserView}
              />
            )}
            forceUserView={forceUserView}
          />
        </>
      )}
    </PageLayout>
  );
}
