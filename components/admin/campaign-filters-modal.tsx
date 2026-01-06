'use client';

import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';

export interface AdminCampaignFilters {
  statuses?: string[];
  enabled?: boolean | null;
  excludeExpiredPending?: boolean;
}

export const ALL_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISABLED', label: 'Disabled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

interface CampaignFiltersContentProps {
  filters: AdminCampaignFilters;
  onFiltersChange: (filters: AdminCampaignFilters) => void;
  localStatuses: string[];
  setLocalStatuses: (statuses: string[]) => void;
  mode: 'modal' | 'inline';
  availableStatuses?: string[];
}

export function CampaignFiltersContent({
  filters,
  onFiltersChange,
  localStatuses,
  setLocalStatuses,
  mode,
  availableStatuses = ALL_STATUSES.map((s) => s.value),
}: CampaignFiltersContentProps) {
  const handleStatusToggle = useCallback(
    (status: string, checked: boolean) => {
      const newStatuses = checked
        ? [...localStatuses, status]
        : localStatuses.filter((s) => s !== status);
      setLocalStatuses(newStatuses);
      // Apply immediately
      onFiltersChange({
        ...filters,
        statuses: newStatuses.length > 0 ? newStatuses : undefined,
      });
    },
    [localStatuses, filters, onFiltersChange, setLocalStatuses],
  );

  const handleEnabledChange = useCallback(
    (value: string) => {
      const enabled =
        value === 'enabled' ? true : value === 'disabled' ? false : null; // 'all' maps to null (no filter)
      onFiltersChange({
        ...filters,
        enabled,
      });
    },
    [filters, onFiltersChange],
  );

  const handleExcludeExpiredPendingChange = useCallback(
    (checked: boolean) => {
      onFiltersChange({
        ...filters,
        excludeExpiredPending: checked,
      });
    },
    [filters, onFiltersChange],
  );

  const hasActiveFilters =
    localStatuses.length > 0 ||
    filters.enabled === true ||
    filters.enabled === false ||
    filters.excludeExpiredPending;

  const renderStatusFilters = () => {
    if (mode === 'modal') {
      return (
        <div className="grid grid-cols-2 gap-2">
          {ALL_STATUSES.map((status) => {
            const isSelected = localStatuses.includes(status.value);
            return (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={status.value}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleStatusToggle(status.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={status.value}
                  className="cursor-pointer text-sm font-normal"
                >
                  {status.label}
                </Label>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {ALL_STATUSES.filter((status) =>
          availableStatuses.includes(status.value),
        ).map((status) => {
          const isSelected = localStatuses.includes(status.value);
          return (
            <Badge
              key={status.value}
              variant={isSelected ? 'default' : 'outline'}
              className="h-6 cursor-pointer px-2 py-0.5 text-xs hover:bg-primary/80"
              onClick={() => handleStatusToggle(status.value, !isSelected)}
            >
              {status.label}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div className={mode === 'modal' ? 'space-y-6' : 'space-y-3'}>
      {/* Status Filters */}
      <div className="space-y-3">
        <Label
          className={
            mode === 'modal'
              ? 'text-sm font-medium'
              : 'text-xs font-medium text-muted-foreground'
          }
        >
          Status
        </Label>
        {renderStatusFilters()}
      </div>

      {/* Enabled/Disabled Filter */}
      <div className="space-y-3">
        <Label
          className={
            mode === 'modal'
              ? 'text-sm font-medium'
              : 'text-xs font-medium text-muted-foreground'
          }
        >
          Campaign State
        </Label>
        <Select
          value={
            filters.enabled === true
              ? 'enabled'
              : filters.enabled === false
                ? 'disabled'
                : 'all'
          }
          onValueChange={handleEnabledChange}
        >
          <SelectTrigger className={mode === 'modal' ? '' : 'h-7 w-32 text-xs'}>
            <SelectValue
              placeholder={mode === 'modal' ? 'All campaigns' : 'All'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="enabled">Enabled Only</SelectItem>
            <SelectItem value="disabled">Disabled Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exclude Expired Pending Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="exclude-expired-pending"
          checked={filters.excludeExpiredPending || false}
          onCheckedChange={handleExcludeExpiredPendingChange}
          className={mode === 'modal' ? '' : 'h-3 w-3'}
        />
        <Label
          htmlFor="exclude-expired-pending"
          className={
            mode === 'modal'
              ? 'cursor-pointer text-sm font-normal'
              : 'text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          }
        >
          {mode === 'modal'
            ? 'Hide pending approval campaigns that have already started'
            : 'Hide expired pending'}
        </Label>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && mode === 'modal' && (
        <div className="border-t pt-4">
          <Label className="mb-2 block text-sm font-medium text-muted-foreground">
            Active Filters:
          </Label>
          <div className="flex flex-wrap gap-1">
            {localStatuses.map((status) => (
              <Badge key={status} variant="secondary" className="text-xs">
                {ALL_STATUSES.find((s) => s.value === status)?.label || status}
              </Badge>
            ))}
            {filters.enabled !== null && (
              <Badge variant="secondary" className="text-xs">
                {filters.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            )}
            {filters.excludeExpiredPending && (
              <Badge variant="secondary" className="text-xs">
                Hide Expired Pending
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CampaignFiltersModalProps {
  filters: AdminCampaignFilters;
  onFiltersChange: (filters: AdminCampaignFilters) => void;
  children: React.ReactNode;
}

export function CampaignFiltersModal({
  filters,
  onFiltersChange,
  children,
}: CampaignFiltersModalProps) {
  const [localStatuses, setLocalStatuses] = useState<string[]>(
    filters.statuses || [],
  );

  const clearAllFilters = useCallback(() => {
    setLocalStatuses([]);
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters =
    localStatuses.length > 0 ||
    filters.enabled === true ||
    filters.enabled === false ||
    filters.excludeExpiredPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Campaign Filters
            </h4>
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
            mode="modal"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
