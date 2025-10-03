import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { getDemoCampaignDataForPreview } from './demo-campaign-data';
import { CampaignFormSchema } from '@/components/campaign/create/form';
import type { CampaignFormSchemaType } from '@/components/campaign/create/form';

/**
 * Hook for developer prefill functionality using demo campaign data.
 * Provides realistic campaign data for faster development testing.
 *
 * Dev Mode Preview Behavior:
 * - Uses dynamically generated demo data that is guaranteed to be valid
 * - All data generation happens at runtime with enum/category validation
 * - No invalid values can be generated (prevents preview failures)
 * - Advances directly to summary for immediate preview generation
 *
 * @param form - The react-hook-form instance for campaign forms
 * @param setFormState - Function to advance the form to summary state
 */
export function useDeveloperPrefill(
  form: UseFormReturn<CampaignFormSchemaType>,
  setFormState: (state: string) => void,
) {
  const onDeveloperSubmit = useCallback(() => {
    // Get demo campaign data optimized for preview (guaranteed to be valid)
    const demoData = getDemoCampaignDataForPreview();

    try {
      // Validate against schema (should always pass since data is generated to be valid)
      const formData = {
        title: demoData.title,
        description: demoData.description,
        fundingGoal: demoData.fundingGoal.toString(),
        fundingModel: demoData.fundingModel,
        startTime: demoData.startTime,
        endTime: demoData.endTime,
        location: demoData.location,
        category: demoData.category,
        bannerImage: null,
      };

      // This will throw if data is somehow invalid (defensive programming)
      CampaignFormSchema.parse(formData);

      // Apply demo data to form
      form.setValue('title', demoData.title);
      form.setValue('description', demoData.description);
      form.setValue('fundingGoal', demoData.fundingGoal.toString());
      form.setValue('fundingModel', demoData.fundingModel);
      form.setValue('startTime', demoData.startTime);
      form.setValue('endTime', demoData.endTime);
      form.setValue('location', demoData.location);
      form.setValue('category', demoData.category);
      // Keep bannerImage as null for demo data (reliable preview generation)

      console.log('✅ Developer prefill data applied successfully', {
        category: demoData.category,
        location: demoData.location,
        fundingGoal: demoData.fundingGoal,
      });

      // Advance to summary state for immediate review
      setFormState('summary');
    } catch (error) {
      // Defensive programming - handle unexpected validation failures
      console.error(
        '🚨 Unexpected Developer Prefill Validation Failure:',
        error,
      );
      console.error('Generated demo data:', demoData);

      // Don't advance to summary - let the developer see the error
    }
  }, [form, setFormState]);

  return { onDeveloperSubmit };
}
