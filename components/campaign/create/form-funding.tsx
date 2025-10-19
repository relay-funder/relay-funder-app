import { useFormContext } from 'react-hook-form';
import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';

interface CampaignCreateFormFundingProps {
  isOnChainDeployed?: boolean;
}

export function CampaignCreateFormFunding({
  isOnChainDeployed = false,
}: CampaignCreateFormFundingProps) {
  const form = useFormContext();
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="fundingGoal"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Funding Goal (USD)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                className="mt-1"
                placeholder="1000"
                disabled={isOnChainDeployed}
                {...field}
              />
            </FormControl>
            <FormMessage />
            {isOnChainDeployed && (
              <p className="text-sm text-solar">
                Funding goal cannot be changed after campaign deployment
              </p>
            )}
          </FormItem>
        )}
      />

      {/* Hidden field to maintain form structure */}
      <FormField
        control={form.control}
        name="fundingModel"
        render={({ field }) => (
          <input type="hidden" {...field} value="flexible" />
        )}
      />
    </div>
  );
}
