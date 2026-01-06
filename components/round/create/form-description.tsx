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
  ROUND_TITLE_MAX_LENGTH,
  ROUND_DESCRIPTION_MAX_LENGTH,
} from '@/lib/constant/form';

export function RoundCreateFormDescription() {
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

  const getCharCountColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 90) return 'text-solar';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Round Title
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Empowering Change: Round 1 - Fund Social Impact Campaigns"
                className="mt-1"
                maxLength={ROUND_TITLE_MAX_LENGTH}
                {...field}
              />
            </FormControl>
            <div className="flex justify-end">
              <span
                className={`text-xs ${getCharCountColor(titleCharCount, ROUND_TITLE_MAX_LENGTH)}`}
              >
                {titleCharCount}/{ROUND_TITLE_MAX_LENGTH}
              </span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="descriptionUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Round URL (Optional)
            </FormLabel>
            <FormControl>
              <Input
                placeholder="https://example.com"
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
            <FormLabel className="text-sm font-medium text-foreground">
              Round Description
            </FormLabel>
            <FormControl>
              <Textarea
                className="mt-1 min-h-[120px] resize-none bg-background"
                placeholder="This round focuses on supporting innovative campaigns that create positive social impact. Campaigns will be funded through quadratic funding based on community engagement. Include details about your goals, target audience, and eligibility criteria."
                maxLength={ROUND_DESCRIPTION_MAX_LENGTH}
                {...field}
              />
            </FormControl>
            <div className="flex justify-end">
              <span
                className={`text-xs ${getCharCountColor(descriptionCharCount, ROUND_DESCRIPTION_MAX_LENGTH)}`}
              >
                {descriptionCharCount}/{ROUND_DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
