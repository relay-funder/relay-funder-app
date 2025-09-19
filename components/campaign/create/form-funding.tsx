import { useFormContext } from 'react-hook-form';
import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';

export function CampaignCreateFormFunding() {
  const form = useFormContext();
  return (
    <>
      <FormField
        control={form.control}
        name="fundingGoal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Funding Goal (USDC)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
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

      {/* Information about funding model */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">🎨 Flexible Funding</h3>
        <p className="mt-1 text-sm text-blue-700">
          You'll receive all funds raised at the end of your campaign,
          regardless of whether you reach your funding goal.
        </p>
      </div>
    </>
  );
}
