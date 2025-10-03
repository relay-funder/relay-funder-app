import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { getRandomDemoCampaignData } from './demo-campaign-data';
import type { CampaignFormSchemaType } from '@/components/campaign/create/form';

/**
 * Hook for developer prefill functionality using demo campaign data.
 * Provides realistic campaign data for faster development testing.
 *
 * @param form - The react-hook-form instance for campaign forms
 * @param setFormState - Function to advance the form to summary state
 */
export function useDeveloperPrefill(
  form: UseFormReturn<CampaignFormSchemaType>,
  setFormState: (state: string) => void,
) {
  const onDeveloperSubmit = useCallback(
    () => {
      // Get random demo campaign data
      const demoData = getRandomDemoCampaignData();

      // Apply demo data to form
      form.setValue('title', demoData.title);
      form.setValue('description', demoData.description);
      form.setValue('fundingGoal', demoData.fundingGoal.toString());
      form.setValue('fundingModel', demoData.fundingModel);
      form.setValue('startTime', demoData.startTime);
      form.setValue('endTime', demoData.endTime);
      form.setValue('location', demoData.location);
      form.setValue('category', demoData.category);
      // Keep bannerImage as null for demo data (no image)

      // Advance to summary state for immediate review
      setFormState('summary');
    },
    [form, setFormState],
  );

  return { onDeveloperSubmit };
}
