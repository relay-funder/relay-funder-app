import { useCallback } from 'react';
import { UseFormReturn, Path } from 'react-hook-form';
import { getRandomDemoCampaignData } from './demo-campaign-data';

/**
 * Reusable hook for developer prefill functionality using demo campaign data.
 * Provides realistic campaign data for faster development testing.
 *
 * @param form - The react-hook-form instance
 * @param setFormState - Function to advance the form to summary state
 */
export function useDeveloperPrefill<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  setFormState: (state: string) => void,
) {
  const onDeveloperSubmit = useCallback(
    async (event: React.MouseEvent) => {
      // Get random demo campaign data
      const demoData = getRandomDemoCampaignData();

      // Apply demo data to form
      form.setValue('title' as Path<T>, demoData.title as any);
      form.setValue('description' as Path<T>, demoData.description as any);
      form.setValue(
        'fundingGoal' as Path<T>,
        demoData.fundingGoal.toString() as any,
      );
      form.setValue('fundingModel' as Path<T>, demoData.fundingModel as any);
      form.setValue('startTime' as Path<T>, demoData.startTime as any);
      form.setValue('endTime' as Path<T>, demoData.endTime as any);
      form.setValue('location' as Path<T>, demoData.location as any);
      form.setValue('category' as Path<T>, demoData.category as any);
      // Keep bannerImage as null for demo data (no image)

      // Advance to summary state for immediate review
      setFormState('summary');
    },
    [form, setFormState],
  );

  return { onDeveloperSubmit };
}
