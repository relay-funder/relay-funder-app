'use client';

import { useState } from 'react';
import { PageHeaderSearch } from '@/components/page/header-search';
import { PageHome } from '@/components/page/home';
import { CampaignList } from '@/components/campaign/list';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { DashboardOverview } from '../dashboard/overview';

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  return (
    <PageHome
      header={
        <PageHeaderSearch
          placeholder="Search Campaigns"
          onSearchChanged={(search: string) => setSearchTerm(search)}
          containerWidth="default"
        />
      }
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Control Center
        </h1>
      </div>

      <DashboardOverview />

      <CampaignList
        searchTerm={searchTerm}
        statusFilter="all"
        pageSize={3}
        withRounds={true}
        item={(props) => <CampaignCard {...props} type="admin" />}
      />
    </PageHome>
  );
}
