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
            <FormLabel>Matching Pool Amount</FormLabel>
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
              Initial funds provided by the round manager.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
