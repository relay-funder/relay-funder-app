import React, { useEffect } from 'react';
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
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Skeleton,
} from '@/components/ui';
import { useUpcomingRounds, useUpcomingRound } from '@/lib/hooks/useRounds';
import { GetRoundResponseInstance } from '@/lib/api/types';
import {
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface CampaignCreateFormTimelineProps {
  isOnChainDeployed?: boolean;
}

export function CampaignCreateFormTimeline({
  isOnChainDeployed = false,
}: CampaignCreateFormTimelineProps) {
  const form = useFormContext();
  const startTimeValue = useWatch({ control: form.control, name: 'startTime' });
  const selectedRoundId = useWatch({
    control: form.control,
    name: 'selectedRoundId',
  });

  const { data: upcomingRounds, isLoading: roundsLoading } =
    useUpcomingRounds();
  const { data: upcomingRound } = useUpcomingRound();

  // Pre-select the upcoming round when it loads (only once)
  useEffect(() => {
    if (upcomingRound && !roundsLoading && !form.getValues('selectedRoundId')) {
      form.setValue('selectedRoundId', upcomingRound.id, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [upcomingRound, roundsLoading, form]);

  // Auto-populate dates when a round is selected
  useEffect(() => {
    if (selectedRoundId && upcomingRounds) {
      const selectedRound = upcomingRounds.find(
        (round: GetRoundResponseInstance) => round.id === selectedRoundId,
      );

      if (selectedRound) {
        const startDate = new Date(selectedRound.startTime);
        const endDate = new Date(selectedRound.endTime);
        const startDateString = startDate.toISOString().slice(0, 10);
        const endDateString = endDate.toISOString().slice(0, 10);

        // Only update if values are different to prevent unnecessary re-renders
        const currentStartTime = form.getValues('startTime');
        const currentEndTime = form.getValues('endTime');

        if (currentStartTime !== startDateString) {
          form.setValue('startTime', startDateString, {
            shouldDirty: false,
            shouldTouch: false,
          });
        }
        if (currentEndTime !== endDateString) {
          form.setValue('endTime', endDateString, {
            shouldDirty: false,
            shouldTouch: false,
          });
        }
      }
    }
  }, [selectedRoundId, upcomingRounds, form]);

  // Clear dates when round selection is cleared
  useEffect(() => {
    if (!selectedRoundId && upcomingRounds) {
      // Only clear if there are rounds available (user explicitly deselected)
      // Don't clear if no rounds are available (fallback to manual)
      const currentStartTime = form.getValues('startTime');
      const currentEndTime = form.getValues('endTime');

      if (currentStartTime !== '') {
        form.setValue('startTime', '', {
          shouldDirty: false,
          shouldTouch: false,
        });
      }
      if (currentEndTime !== '') {
        form.setValue('endTime', '', {
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
  }, [selectedRoundId, upcomingRounds, form]);

  // Check if start time is too close to current time
  const getStartTimeWarning = () => {
    if (!startTimeValue) return null;

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
  };

  const startTimeWarning = getStartTimeWarning();

  const hasUpcomingRounds = upcomingRounds && upcomingRounds.length > 0;
  const useManualDates = !selectedRoundId;

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
      {roundsLoading ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ) : hasUpcomingRounds && !useManualDates ? (
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
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                  }}
                  value={field.value?.toString()}
                  disabled={isOnChainDeployed}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a funding round" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {upcomingRounds.map((round: GetRoundResponseInstance) => (
                      <SelectItem key={round.id} value={round.id.toString()}>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">{round.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(round.startTime).toLocaleDateString()} -{' '}
                              {new Date(round.endTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
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
              onClick={() => form.setValue('selectedRoundId', undefined)}
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
                  onClick={() => {
                    if (upcomingRound) {
                      form.setValue('selectedRoundId', upcomingRound.id, {
                        shouldDirty: false,
                        shouldTouch: false,
                      });
                    }
                  }}
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
                    disabled={isOnChainDeployed}
                    {...field}
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
      {selectedRoundId && upcomingRounds && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Campaign runs from{' '}
            <span className="font-medium">
              {(() => {
                const selectedRound = upcomingRounds.find(
                  (round: GetRoundResponseInstance) =>
                    round.id === selectedRoundId,
                );
                if (!selectedRound) return '';
                return `${new Date(selectedRound.startTime).toLocaleDateString()} to ${new Date(selectedRound.endTime).toLocaleDateString()}`;
              })()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
