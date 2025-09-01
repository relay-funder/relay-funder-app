import { useFormContext } from 'react-hook-form';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import { fundingModels } from '@/lib/constant';

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
      <FormField
        control={form.control}
        name="fundingModel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Funding Model" />
                </SelectTrigger>
                <SelectContent>
                  {fundingModels.map((fundingModel) => (
                    <SelectItem key={fundingModel.id} value={fundingModel.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{fundingModel.icon}</span>
                        <span>{fundingModel.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
