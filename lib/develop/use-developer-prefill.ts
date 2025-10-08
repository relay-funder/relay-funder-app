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
  const onDeveloperSubmit = useCallback(async () => {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      console.warn(
        '🚫 Developer prefill is only available in development mode',
      );
      return;
    }

    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.error('🚨 Developer prefill timed out after 10 seconds');
    }, 10000);

    try {
      console.log('🔄 Starting developer prefill...');

      // Get demo campaign data optimized for preview (guaranteed to be valid)
      const demoData = getDemoCampaignDataForPreview();

      // Validate that we got valid demo data
      if (!demoData || !demoData.title) {
        throw new Error('Failed to generate valid demo data');
      }

      console.log('📄 Demo data generated:', {
        title: demoData.title.substring(0, 50) + '...',
        category: demoData.category,
        fundingGoal: demoData.fundingGoal,
        startTime: demoData.startTime,
        endTime: demoData.endTime,
      });

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

      console.log('🔍 Validating form data...');
      console.log('Form data to validate:', {
        title: formData.title?.substring(0, 30),
        fundingGoal: formData.fundingGoal,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        category: formData.category,
      });

      // This will throw if data is somehow invalid (defensive programming)
      const validatedData = CampaignFormSchema.parse(formData);
      console.log('✅ Form validation passed');

      console.log('📝 Applying data to form...');
      // Apply demo data to form - convert ISO strings back to date input format (YYYY-MM-DD)
      // The transformation functions will handle converting back to ISO when submitting
      form.setValue('title', validatedData.title);
      form.setValue('description', validatedData.description);
      form.setValue('fundingGoal', validatedData.fundingGoal.toString());
      form.setValue('fundingModel', validatedData.fundingModel);
      // Convert ISO strings back to date-only format for date inputs
      form.setValue('startTime', validatedData.startTime.slice(0, 10)); // YYYY-MM-DD
      form.setValue('endTime', validatedData.endTime.slice(0, 10)); // YYYY-MM-DD
      form.setValue('location', validatedData.location);
      form.setValue('category', validatedData.category);
      // Keep bannerImage as null for demo data (reliable preview generation)

      console.log('✅ Developer prefill data applied successfully', {
        category: demoData.category,
        location: demoData.location,
        fundingGoal: demoData.fundingGoal,
        startTime: demoData.startTime,
        endTime: demoData.endTime,
      });

      // Clear timeout before advancing
      clearTimeout(timeoutId);

      // Advance to summary state for immediate review
      setFormState('summary');
      console.log('🎯 Advanced to summary state');
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);

      // Defensive programming - handle unexpected validation failures
      console.error(
        '🚨 Unexpected Developer Prefill Validation Failure:',
        error,
      );
      console.error('Generated demo data:', getDemoCampaignDataForPreview());

      // Don't advance to summary - let the developer see the error
    }
  }, [form, setFormState]);

  return { onDeveloperSubmit };
}
