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
