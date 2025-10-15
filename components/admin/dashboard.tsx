'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/page/layout';
import { CampaignList } from '@/components/campaign/list';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { AdminGlobalOverview } from './global-overview';

/**
 * AdminControlCenter Component
 *
 * The main admin interface for managing all campaigns in the system.
 * This is the "Campaign Management" that provides admin-specific campaign management
 * with approval actions and system-wide campaign oversight.
 *
 * Key features:
 * - View all campaigns in the system (not just admin's own campaigns)
 * - Admin-specific actions (approve, disable campaigns)
 * - Campaign management and oversight functionality
 * - Different from AdminUserDashboard which mirrors user workflow
 */
export function AdminControlCenter() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  return (
    <PageLayout
      title="Campaign Management"
      searchPlaceholder="Search Campaigns"
      onSearchChanged={(search: string) => setSearchTerm(search)}
    >
      <AdminGlobalOverview />

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

// Keep the old name for backward compatibility
export const AdminDashboard = AdminControlCenter;
