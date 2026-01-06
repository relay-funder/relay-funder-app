'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import {
  CampaignFiltersContent,
  AdminCampaignFilters,
  ALL_STATUSES,
} from '../campaign-filters-modal';

interface CampaignFiltersProps {
  filters: AdminCampaignFilters;
  onFiltersChange: (filters: AdminCampaignFilters) => void;
  availableStatuses?: string[];
}

export function CampaignFilters({
  filters,
  onFiltersChange,
  availableStatuses = ALL_STATUSES.map((s) => s.value),
}: CampaignFiltersProps) {
  const [localStatuses, setLocalStatuses] = useState<string[]>(
    filters.statuses || [],
  );

  const clearAllFilters = useCallback(() => {
    setLocalStatuses([]);
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters =
    localStatuses.length > 0 ||
    filters.enabled !== null ||
    filters.excludeExpiredPending;

  return (
    <div className="mb-4 rounded-lg border bg-muted/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <CampaignFiltersContent
        filters={filters}
        onFiltersChange={onFiltersChange}
        localStatuses={localStatuses}
        setLocalStatuses={setLocalStatuses}
        mode="inline"
        availableStatuses={availableStatuses}
      />
    </div>
  );
}

// Re-export for backward compatibility
export type { AdminCampaignFilters };
