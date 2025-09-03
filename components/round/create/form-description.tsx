import { cn } from '@/lib/utils';
import { useFormContext } from 'react-hook-form';
import {
  Input,
  Textarea,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
export function RoundCreateFormDescription() {
  const form = useFormContext();
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="Empowering Change: Round [Number] - Fund Projects with Social Impact"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className={cn('flex-grow')}>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                className={cn('block h-[90%]')}
                placeholder="This round focuses on supporting innovative campaigns that create a positive social impact. Projects will be funded based on their community engagement and the quadratic funding model. Please provide a brief overview of the goals, target audience, and expected outcomes of the campaigns eligible for this round."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
