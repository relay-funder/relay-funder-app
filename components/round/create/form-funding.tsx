import { useFormContext } from 'react-hook-form';
import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui';

export function RoundCreateFormFunding() {
  const form = useFormContext();
  return (
    <>
      <FormField
        control={form.control}
        name="matchingPool"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Matching Pool Amount (USD)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="e.g., 10000"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Initial funds in USD provided by the round manager for quadratic
              funding distribution.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
