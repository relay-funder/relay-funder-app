import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import {
  Input,
  Textarea,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import {
  CAMPAIGN_TITLE_MAX_LENGTH,
  CAMPAIGN_DESCRIPTION_MAX_LENGTH,
} from '@/lib/constant/form';
import { getCharCountColor } from '@/lib/get-char-count-color';

export function CampaignCreateFormDescription() {
  const form = useFormContext();
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);

  // Update character counts when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setTitleCharCount(value.title?.length || 0);
      setDescriptionCharCount(value.description?.length || 0);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Campaign Title
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Empower Local Artists: A Community Art Project"
                className="mt-1"
                maxLength={CAMPAIGN_TITLE_MAX_LENGTH}
                {...field}
              />
            </FormControl>
            <div className="flex justify-end">
              <span
                className={`text-xs ${getCharCountColor(titleCharCount, CAMPAIGN_TITLE_MAX_LENGTH)}`}
              >
                {titleCharCount}/{CAMPAIGN_TITLE_MAX_LENGTH}
              </span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Campaign Description
            </FormLabel>
            <FormControl>
              <Textarea
                className="mt-1 min-h-[120px] resize-none bg-background"
                placeholder="Imagine a world where every child has access to quality education. Our project aims to build a library in an underserved community, providing resources and a safe space for learning. With your support, we can make this dream a reality!"
                maxLength={CAMPAIGN_DESCRIPTION_MAX_LENGTH}
                {...field}
              />
            </FormControl>
            <div className="flex justify-end">
              <span
                className={`text-xs ${getCharCountColor(descriptionCharCount, CAMPAIGN_DESCRIPTION_MAX_LENGTH)}`}
              >
                {descriptionCharCount}/{CAMPAIGN_DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
