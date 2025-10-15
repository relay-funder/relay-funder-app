import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';

interface CampaignCreateFormTimelineProps {
  isOnChainDeployed?: boolean;
}

export function CampaignCreateFormTimeline({
  isOnChainDeployed = false,
}: CampaignCreateFormTimelineProps) {
  const form = useFormContext();
  const startTimeValue = form.watch('startTime');

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
      const isDev = process.env.NODE_ENV === 'development';
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

  return (
    <div className="space-y-4">
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
              <div
                className={`rounded-lg border p-3 text-sm ${
                  startTimeWarning.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300'
                    : startTimeWarning.type === 'warning'
                      ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300'
                      : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {startTimeWarning.type === 'error' && '❌'}
                    {startTimeWarning.type === 'warning' && '⚠️'}
                    {startTimeWarning.type === 'info' && 'ℹ️'}
                  </span>
                  <span className="font-medium">
                    {startTimeWarning.message}
                  </span>
                </div>
              </div>
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
  );
}
