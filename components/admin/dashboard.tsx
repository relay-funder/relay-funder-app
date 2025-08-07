'use client';

import { useState } from 'react';
import { PageHeaderSearch } from '@/components/page/header-search';
import { PageHome } from '@/components/page/home';
import { CampaignList } from '@/components/campaign/list';
import { CampaignCardAdmin } from '@/components/campaign/card-admin';
import { DashboardOverview } from '../dashboard/overview';

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  return (
    <PageHome
      header={
        <PageHeaderSearch
          placeholder="Search Stories"
          onSearchChanged={(search: string) => setSearchTerm(search)}
        />
      }
    >
      <DashboardOverview />
      <CampaignList
        searchTerm={searchTerm}
        statusFilter="all"
        pageSize={3}
        withRounds={true}
        item={CampaignCardAdmin}
      />
    </PageHome>
  );
}
