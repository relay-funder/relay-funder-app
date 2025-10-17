'use client';
import { useState } from 'react';
import { RoundCreate } from '@/components/round/create';
import { Button } from '@/components/ui';
import { RoundList } from '@/components/round/list';
import { RoundCard } from '@/components/round/round-card';
import { PageLayout } from '@/components/page/layout';
import { useAuth } from '@/contexts';
import { useFeatureFlag } from '@/lib/flags';
import { ResponsiveGrid } from '@/components/layout';
import { useRouter } from 'next/navigation';

export function RoundExplore({
  forceUserView = false,
}: {
  forceUserView?: boolean;
}) {
  const [showRoundCreate, setShowRoundCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isAdmin: authIsAdmin } = useAuth();
  const isRoundsVisibilityEnabled = useFeatureFlag('ROUNDS_VISIBILITY');
  const router = useRouter();
  // Use actual admin status for content visibility decisions
  // Only force user view for UI controls (create button, etc.)
  const isAdmin = authIsAdmin;
  // Hide rounds listing unless rounds visibility is enabled or user is admin
  if (!(isRoundsVisibilityEnabled || isAdmin)) {
    return (
      <PageLayout
        title="Funding Rounds"
        searchPlaceholder="Search Rounds"
        onSearchChanged={(search: string) => setSearchTerm(search)}
        onCreate={
          !forceUserView && isAdmin ? () => setShowRoundCreate(true) : undefined
        }
        createTitle="Create Round"
      >
        <div className="space-y-6">
          <ResponsiveGrid variant="wide-cards" gap="lg">
            Not Found
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="mb-4"
              >
                ← Back to Home
              </Button>
            </div>
          </ResponsiveGrid>
        </div>
      </PageLayout>
    );
  }
  return (
    <PageLayout
      title="Funding Rounds"
      searchPlaceholder="Search Rounds"
      onSearchChanged={(search: string) => setSearchTerm(search)}
      onCreate={
        !forceUserView && isAdmin ? () => setShowRoundCreate(true) : undefined
      }
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
          <RoundCreate onCreated={() => setShowRoundCreate(false)} />
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
