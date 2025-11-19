'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/page/layout';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { AdminGlobalOverview } from './global-overview';
import { AdminCampaignList } from './campaign-list';
import {
  CampaignFiltersModal,
  type AdminCampaignFilters,
} from './campaign-filters-modal';
import { Button } from '@/components/ui';
import { Filter, X } from 'lucide-react';

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
  const [filters, setFilters] = useState<AdminCampaignFilters>({});

  // Check if any filters are active
  const hasActiveFilters =
    (filters.statuses && filters.statuses.length > 0) ||
    filters.enabled === true ||
    filters.enabled === false ||
    filters.excludeExpiredPending;

  const filterButton = (
    <div className="flex items-center gap-1">
      <CampaignFiltersModal filters={filters} onFiltersChange={setFilters}>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          className={hasActiveFilters ? 'bg-primary' : ''}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
              {(filters.statuses?.length || 0) +
                (filters.enabled !== null ? 1 : 0) +
                (filters.excludeExpiredPending ? 1 : 0)}
            </span>
          )}
        </Button>
      </CampaignFiltersModal>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({})}
          className="h-8 px-2 text-xs"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  return (
    <PageLayout
      title="Campaign Management"
      searchPlaceholder="Search Campaigns"
      onSearchChanged={(search: string) => setSearchTerm(search)}
      searchButtons={filterButton}
    >
      <AdminGlobalOverview />

      <AdminCampaignList
        searchTerm={searchTerm}
        filters={filters}
        pageSize={3}
        withRounds={true}
        item={(props) => <CampaignCard {...props} type="admin" />}
      />
    </PageLayout>
  );
}

// Keep the old name for backward compatibility
export const AdminDashboard = AdminControlCenter;
