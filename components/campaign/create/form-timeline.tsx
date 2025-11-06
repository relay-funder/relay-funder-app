import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  ChangeEvent,
} from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Skeleton,
} from '@/components/ui';
import { useUpcomingRounds, useUpcomingRound } from '@/lib/hooks/useRounds';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { AlertCircle } from 'lucide-react';
import { RoundSelectItem } from '@/components/round/select-item';
import { differenceInDays, addDays } from 'date-fns';

interface CampaignCreateFormTimelineProps {
  isOnChainDeployed?: boolean;
}
function getStartTimeWarning(startTimeValue: string | null | undefined) {
  if (typeof startTimeValue !== 'string') {
    return null;
  }

  try {
    let startDate: Date;
    if (startTimeValue.includes('T')) {
      // ISO format
      startDate = new Date(startTimeValue);
    } else {
      // Date-only format, add time for comparison
      startDate = new Date(startTimeValue + 'T00:00:00');
    }

    if (isNaN(startDate.getTime())) {
      return null; // Invalid date, no warning
    }

    const now = new Date();
    const minutesDifference =
      (startDate.getTime() - now.getTime()) / (1000 * 60);
    const isDev = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';
    const isToday = startDate.toDateString() === now.toDateString();

    // Don't show warnings for today's date since it will be transformed to a future time
    if (isToday) {
      return null;
    }

    if (minutesDifference < 0) {
      return {
        type: 'error',
        message:
          'Start time is in the past. Campaigns must start in the future.',
      };
    } else if (minutesDifference < 2) {
      return {
        type: 'warning',
        message:
          'Campaign starts very soon. You may not have enough time to complete setup.',
      };
    } else if (minutesDifference < 60) {
      return {
        type: 'info',
        message:
          'Campaign starts within the next hour. Make sure everything is ready to go.',
      };
    } else if (minutesDifference < 24 * 60 && isDev) {
      return {
        type: 'info',
        message:
          'Campaign starts soon. Double-check that all settings are correct.',
      };
    }
    return null;
  } catch (error) {
    console.warn('Error checking start time warning:', error);
    return null;
  }
}
export function CampaignCreateFormTimeline({
  isOnChainDeployed = false,
}: CampaignCreateFormTimelineProps) {
  const refLoaded = useRef<boolean>(false);
  const form = useFormContext();
  const [minDate, setMinDate] = useState<string>('2025-01-01'); // uses effect to get current date in client
  const startTimeValue: string | undefined = useWatch({
    name: 'startTime',
  });
  const selectedRoundIdValue: number | undefined = useWatch({
    name: 'selectedRoundId',
  });

  const { data: upcomingRounds, isLoading: upcomingRoundsLoading } =
    useUpcomingRounds();
  const { data: upcomingRound, isLoading: upcomingRoundLoading } =
    useUpcomingRound();

  const hasManualTimes = useMemo(() => {
    // differs from default value (null)
    return (
      typeof selectedRoundIdValue === 'number' && selectedRoundIdValue === 0
    );
  }, [selectedRoundIdValue]);
  const hasUpcomingRounds = useMemo(
    () => Array.isArray(upcomingRounds) && upcomingRounds.length > 0,
    [upcomingRounds],
  );
  // Check if start time is too close to current time
  const selectedRoundDates = useMemo(() => {
    if (!selectedRoundIdValue || !upcomingRounds) {
      return '';
    }
    const selectedRound = upcomingRounds.find(
      (round: GetRoundResponseInstance) => round.id === selectedRoundIdValue,
    );
    if (!selectedRound) {
      return '';
    }
    return `${new Date(selectedRound.startTime).toLocaleDateString()} to ${new Date(selectedRound.endTime).toLocaleDateString()}`;
  }, [selectedRoundIdValue, upcomingRounds]);

  const startTimeWarning = useMemo(
    () => getStartTimeWarning(startTimeValue),
    [startTimeValue],
  );

  const minEndDate = useMemo(() => {
    if (!startTimeValue) return '';
    const startDate = new Date(startTimeValue);
    const minEnd = addDays(startDate, 1);
    return minEnd.toISOString().slice(0, 10);
  }, [startTimeValue]);

  const handleSwitchToManual = useCallback(() => {
    form.setValue('selectedRoundId', 0);
  }, [form]);

  const handleSwitchToRound = useCallback(() => {
    if (!upcomingRound) {
      return;
    }

    form.setValue('selectedRoundId', upcomingRound.id);
    form.setValue(
      'startTime',
      new Date(upcomingRound.startTime).toISOString().slice(0, 10),
    );
    form.setValue(
      'endTime',
      new Date(upcomingRound.endTime).toISOString().slice(0, 10),
    );
  }, [form, upcomingRound]);

  const handleRoundChange = useCallback(
    (value: string) => {
      if (hasManualTimes) {
        return;
      }
      if (value === '' || value === '0') {
        return;
      }

      const round = upcomingRounds?.find(({ id }) => id === parseInt(value));
      if (round) {
        form.setValue('selectedRoundId', round.id);
        form.setValue(
          'startTime',
          new Date(round.startTime).toISOString().slice(0, 10),
        );
        form.setValue(
          'endTime',
          new Date(round.endTime).toISOString().slice(0, 10),
        );
      }
    },
    [form, hasManualTimes, upcomingRounds],
  );
  const handleStartTimeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (!hasManualTimes) {
        return;
      }
      const newStartDate = new Date(value);
      const newStartString = newStartDate.toISOString().slice(0, 10);
      const oldValues = form.getValues();
      const oldStartString = oldValues.startTime;
      const oldEndString = oldValues.endTime;
      form.setValue('startTime', newStartString);
      if (oldStartString && oldEndString) {
        const oldStartDate = new Date(oldStartString);
        const oldEndDate = new Date(oldEndString);
        const diffDays = differenceInDays(oldEndDate, oldStartDate);
        if (diffDays > 0) {
          const newEndDate = addDays(newStartDate, diffDays);
          const newEndString = newEndDate.toISOString().slice(0, 10);
          form.setValue('endTime', newEndString);
        } else {
          // ensure endTime is not before startTime
          if (new Date(oldEndString).getTime() < newStartDate.getTime()) {
            form.setValue('endTime', newStartString);
          }
        }
      } else {
        // ensure endTime is not before startTime if it exists
        const currentEndString = oldValues.endTime;
        if (
          currentEndString &&
          new Date(currentEndString).getTime() < newStartDate.getTime()
        ) {
          form.setValue('endTime', newStartString);
        }
      }
    },
    [form, hasManualTimes],
  );
  // effects - beware, the control is rendered twice, avoid setting form values
  // depending on state as the effect runs twice (one for lg:hidden, one for mobile)
  // Pre-select the upcoming round when it loads (only if user hasn't manually selected custom dates)
  useEffect(() => {
    if (refLoaded.current === true) {
      return;
    }
    if (hasManualTimes) {
      return;
    }
    if (!upcomingRound || upcomingRoundsLoading || upcomingRoundLoading) {
      return;
    }
    if (selectedRoundIdValue) {
      return;
    }
    refLoaded.current = true;

    form.setValue('selectedRoundId', upcomingRound.id);
  }, [
    upcomingRound,
    upcomingRoundsLoading,
    upcomingRoundLoading,
    selectedRoundIdValue,
    hasManualTimes,
    form,
  ]);
  useEffect(() => {
    setMinDate(new Date().toISOString().slice(0, 10));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          Campaign Timeline
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose your campaign scheduling option.
        </p>
      </div>

      {/* Timeline Selection */}
      {upcomingRoundsLoading || upcomingRoundLoading ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ) : hasUpcomingRounds && !hasManualTimes ? (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="selectedRoundId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Select a Funding Round
                </FormLabel>
                <Select
                  onValueChange={handleRoundChange}
                  value={field.value?.toString()}
                  disabled={isOnChainDeployed}
                >
                  <FormControl>
                    <SelectTrigger className="h-auto">
                      <SelectValue placeholder="Choose a funding round" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {upcomingRounds?.map((round) => (
                      <RoundSelectItem key={round.id} round={round} />
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {isOnChainDeployed && (
                  <p className="text-sm text-solar">
                    Timeline option cannot be changed after campaign deployment
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Manual dates option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSwitchToManual}
              className="text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
              disabled={isOnChainDeployed}
            >
              Or set custom dates manually
            </button>
          </div>
        </div>
      ) : (
        /* Manual Date Selection - Original Interface */
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-foreground">
                Campaign Dates
              </h4>
              {hasUpcomingRounds && (
                <button
                  type="button"
                  onClick={handleSwitchToRound}
                  className="text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                  disabled={isOnChainDeployed}
                >
                  Switch to round
                </button>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Campaign Start Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="mt-1"
                    min={minDate}
                    disabled={isOnChainDeployed}
                    {...field}
                    onChange={handleStartTimeChange}
                  />
                </FormControl>
                <FormMessage />
                {startTimeWarning && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {startTimeWarning.message}
                    </AlertDescription>
                  </Alert>
                )}
                {isOnChainDeployed && (
                  <p className="text-sm text-solar">
                    Start date cannot be changed after campaign deployment
                  </p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Campaign End Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="mt-1"
                    min={minEndDate}
                    disabled={isOnChainDeployed}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {isOnChainDeployed && (
                  <p className="text-sm text-solar">
                    End date cannot be changed after campaign deployment
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Round Dates Display - When round selected */}
      {!hasManualTimes && upcomingRounds && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Campaign runs from{' '}
            <span className="font-medium">{selectedRoundDates}</span>
          </p>
        </div>
      )}
    </div>
  );
}
