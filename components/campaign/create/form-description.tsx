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
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="Empower Local Artists: A Community Art Project"
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                className="h-[50vh]"
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
