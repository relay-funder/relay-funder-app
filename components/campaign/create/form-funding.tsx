import { useFormContext } from 'react-hook-form';
import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import { FeeInformation } from '@/components/shared/fee-information';
import { FUNDING_USAGE_MAX_LENGTH } from '@/lib/constant/form';
import { FormFieldTextArea } from '@/components/form/form-field-text-area';

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

      <FormFieldTextArea
        name="fundingUsage"
        label="Funding Usage"
        placeholder="Please write 2-3 sentences describing your intended use of funds"
        maxLength={FUNDING_USAGE_MAX_LENGTH}
      />

      {/* Fee Information - Show users the fee structure for their campaign */}
      <FeeInformation compact={true} showAllFeesForCampaign={true} />

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
