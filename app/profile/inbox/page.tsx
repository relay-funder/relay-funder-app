'use client';

import { useAuth } from '@/contexts';
import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { PageDefaultContent } from '@/components/page/default-content';
import { PageLoading } from '@/components/page/loading';
import { PageConnectWallet } from '@/components/page/connect-wallet';
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
      <PageDefaultContent title="Inbox">
        <Inbox />
      </PageDefaultContent>
    </PageHome>
  );
}
