'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useAuth } from '@/contexts';
import { DashboardOverview } from '@/components/dashboard/overview';
import { useMetaTitle } from '@/hooks/use-meta-title';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { useInfiniteUserCampaigns } from '@/lib/hooks/useCampaigns';
import { DashboardNotAuthenticated } from '@/components/dashboard/not-authenticated';
import { PageLayout } from '@/components/page/layout';
import { CampaignCreate } from '@/components/campaign/create';
import { Button } from '@/components/ui';
import { useCallback, useState } from 'react';
import { CampaignUserList } from '@/components/campaign/list-user';
import { Web3ContextProvider } from '@/lib/web3';

function CampaignsPageContent() {
  const [showCampaignCreate, setShowCampaignCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isLoading: loading, error } = useInfiniteUserCampaigns();

  // Set page title for browser history
  useMetaTitle(showCampaignCreate ? 'Create Campaign | Relay Funder' : 'Campaign Dashboard | Relay Funder');

  const onCreate = useCallback(async () => {
    setShowCampaignCreate(true);
  }, []);

  const onCreated = useCallback(async () => {
    setShowCampaignCreate(false);
  }, []);

  const onSearchChanged = useCallback(
    (search: string) => {
      setSearchTerm(search);
    },
    [setSearchTerm],
  );

  if (loading) {
    return (
      <PageLayout
        title="Campaigns"
        searchPlaceholder="Search Your Campaigns"
        onSearchChanged={onSearchChanged}
        onCreate={onCreate}
        createTitle="Create Campaign"
      >
        <DashboardOverview />
        <Tabs defaultValue="my-campaigns" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="my-campaigns" className="px-4 py-2">
              My Campaigns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-campaigns">
            <CampaignLoading />
          </TabsContent>
        </Tabs>
      </PageLayout>
    );
  }

  if (showCampaignCreate) {
    return (
      <PageLayout
        title="Create Campaign"
        searchPlaceholder="Search Your Campaigns"
        onSearchChanged={onSearchChanged}
        buttons={
          <Button
            variant="outline"
            onClick={() => setShowCampaignCreate(false)}
          >
            ← Back to Campaigns
          </Button>
        }
      >
        <CampaignCreate onCreated={onCreated} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Campaigns"
      searchPlaceholder="Search Your Campaigns"
      onSearchChanged={onSearchChanged}
      onCreate={onCreate}
      createTitle="Create Campaign"
    >
      {!error && <DashboardOverview />}

      <Tabs defaultValue="my-campaigns" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="my-campaigns" className="px-4 py-2">
            My Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-campaigns">
          {error ? (
            <CampaignError error={error.message} />
          ) : (
            <CampaignUserList
              searchTerm={searchTerm}
              statusFilter="all"
              pageSize={3}
              withRounds={true}
              item={(props) => <CampaignCard {...props} type="dashboard" />}
              onCreate={onCreate}
            />
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default function CampaignsPage() {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return (
      <PageLayout
        title="Campaigns"
        searchPlaceholder="Search Your Campaigns"
        onSearchChanged={() => {}}
      >
        <DashboardOverview />
        <DashboardNotAuthenticated />
      </PageLayout>
    );
  }

  return (
    <Web3ContextProvider>
      <CampaignsPageContent />
    </Web3ContextProvider>
  );
}
