'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/page/layout';
import { CampaignList } from '@/components/campaign/list';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { DashboardOverview } from '../dashboard/overview';

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  return (
    <PageLayout
      title="Control Center"
      searchPlaceholder="Search Campaigns"
      onSearchChanged={(search: string) => setSearchTerm(search)}
    >
      <DashboardOverview />

      <CampaignList
        searchTerm={searchTerm}
        statusFilter="all"
        pageSize={3}
        withRounds={true}
        item={(props) => <CampaignCard {...props} type="admin" />}
      />
    </PageLayout>
  );
}
