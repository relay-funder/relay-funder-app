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
export function CampaignCreateFormDescription() {
  const form = useFormContext();
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-900">
              Campaign Title
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Empower Local Artists: A Community Art Project"
                className="mt-1"
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
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-900">
              Campaign Description
            </FormLabel>
            <FormControl>
              <Textarea
                className="mt-1 min-h-[120px] resize-none"
                placeholder="Imagine a world where every child has access to quality education. Our project aims to build a library in an underserved community, providing resources and a safe space for learning. With your support, we can make this dream a reality!"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
