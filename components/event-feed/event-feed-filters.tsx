'use client';

import { useMemo, useCallback } from 'react';
import { Filter, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input } from '@/components/ui';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { EventFeedFilters } from '@/lib/hooks/useEventFeed';
import { EVENT_FEED_TYPE_CONFIG } from './event-feed-list-item';

type EventFeedFiltersProps = {
  value?: EventFeedFilters;
  onChange?: (nextFilters: EventFeedFilters) => void;
  className?: string;
  disabled?: boolean;
};

const NORMALIZE_DATE = (input?: string | null) =>
  input && input.length >= 10 ? input.slice(0, 10) : '';

export function EventFeedFilters({
  value,
  onChange,
  className,
  disabled,
}: EventFeedFiltersProps) {
  const filters = useMemo(() => value ?? {}, [value]);
  const typeOptions = useMemo(() => {
    return Object.entries(EVENT_FEED_TYPE_CONFIG).map(([type, meta]) => ({
      value: type,
      label: meta.label,
    }));
  }, []);

  const emitChange = useCallback(
    (partial: Partial<EventFeedFilters>) => {
      if (!onChange) return;
      const next: EventFeedFilters = {
        ...filters,
        ...partial,
      };
      Object.entries(next).forEach(([key, val]) => {
        if (!val) {
          delete next[key as keyof EventFeedFilters];
        }
      });
      onChange(next);
    },
    [filters, onChange],
  );

  const handleTypeChange = useCallback(
    (nextType: string) => {
      emitChange({ type: nextType || undefined });
    },
    [emitChange],
  );

  const handleDateChange = useCallback(
    (key: 'startDate' | 'endDate') =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = event.target.value;
        emitChange({ [key]: dateValue || undefined });
      },
    [emitChange],
  );

  const handleClear = useCallback(() => {
    if (!onChange) return;
    onChange({});
  }, [onChange]);
  console.log({ typeOptions, filters });
  return null;
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 rounded-lg border border-border/60 bg-card/80 p-4',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filters
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Event type
          </span>
          <Select
            value={filters.type ?? ''}
            onValueChange={handleTypeChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All events</SelectItem>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Start date
          </span>
          <Input
            type="date"
            value={NORMALIZE_DATE(filters.startDate)}
            onChange={handleDateChange('startDate')}
            disabled={disabled}
          />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            End date
          </span>
          <Input
            type="date"
            value={NORMALIZE_DATE(filters.endDate)}
            onChange={handleDateChange('endDate')}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={
            disabled ||
            (!filters.type && !filters.startDate && !filters.endDate)
          }
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Clear filters
        </Button>
      </div>
    </div>
  );
}

export default EventFeedFilters;
