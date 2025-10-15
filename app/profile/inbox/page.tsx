'use client';

import { useAuth } from '@/contexts';
import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { PageLoading } from '@/components/page/loading';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { DetailContainer } from '@/components/layout';
import Inbox from '@/components/event-feed/inbox';

export default function ProfileInboxPage() {
  const { authenticated, isReady } = useAuth();

  if (!isReady) {
    return <PageLoading>Loading your inbox…</PageLoading>;
  }

  if (!authenticated) {
    return (
      <PageConnectWallet>
        Please connect your wallet to access your inbox.
      </PageConnectWallet>
    );
  }

  return (
    <PageHome
      header={
        <PageHeader message="Keep track of campaign activity and important updates." />
      }
    >
      <DetailContainer variant="wide" padding="md">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Inbox
            </h1>
            <p className="text-muted-foreground">
              Keep track of campaign activity and important updates.
            </p>
          </div>

          {/* Inbox Content */}
          <Inbox />
        </div>
      </DetailContainer>
    </PageHome>
  );
}
