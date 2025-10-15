'use client';

import { useState, useCallback } from 'react';
import { Form } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProcessStates } from '@/types/campaign';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { CampaignCreateProcessDisplay } from './process-display';
import { CampaignCreateFormStates } from './form-states';
import { CampaignCreateFormPage } from './form-page';
import { CampaignCreateFormMedia } from './form-media';
import { CampaignCreateFormDescription } from './form-description';
import { CampaignCreateFormMeta } from './form-meta';
import { CampaignCreateFormFunding } from './form-funding';
import { CampaignCreateFormTimeline } from './form-timeline';
import { CampaignCreateFormSummary } from './form-summary';
import {
  CampaignFormSchema,
  CampaignFormSchemaType,
  campaignFormDefaultValues,
} from './form';
import {
  transformStartTime,
  transformEndTime,
} from '@/lib/utils/campaign-status';
import { useCampaignFormCreate } from './use-form-create';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useDeveloperPrefill } from '@/lib/develop/use-developer-prefill';
import { Button } from '@/components/ui/button';

export function CampaignCreate({ onCreated }: { onCreated?: () => void }) {
  const [state, setState] = useState<keyof typeof CreateProcessStates>('idle');
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] =
    useState<keyof typeof CampaignCreateFormStates>('introduction');
  const processing = state !== 'idle';
  const router = useRouter();
  const { toast } = useToast();

  const onCreateSuccess = useCallback(
    (wasSubmittedForApproval: boolean) => {
      if (wasSubmittedForApproval) {
        toast({
          title: 'Campaign Submitted!',
          description:
            'Your campaign has been submitted for approval. A Relay Funder admin will review it shortly.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Draft Saved!',
          description:
            'Your campaign draft has been saved successfully. You can continue editing later.',
          variant: 'default',
        });
      }

      // Redirect to campaigns overview
      router.push('/campaigns');
    },
    [toast, router],
  );

  const { mutateAsync: createCampaign } = useCampaignFormCreate({
    onStateChanged: setState,
    onCreated: onCreated,
    onError: setError,
    onSuccess: onCreated ? undefined : onCreateSuccess,
  });

  const form = useForm<CampaignFormSchemaType>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: campaignFormDefaultValues,
  });

  const onSubmitStep = useCallback(async () => {
    const isPageValid = await form.trigger(
      CampaignCreateFormStates[formState]
        .fields as (keyof CampaignFormSchemaType)[],
    );
    if (isPageValid && CampaignCreateFormStates[formState].next?.target) {
      setFormState(CampaignCreateFormStates[formState].next?.target);
      form.clearErrors();
    }
  }, [form, formState]);

  const onSubmit = useCallback(
    async (data: CampaignFormSchemaType, event?: React.BaseSyntheticEvent) => {
      if (formState !== 'summary') {
        return onSubmitStep();
      }

      // Check if this is a draft save or approval submission
      const form = event?.target as HTMLFormElement;
      const submitType =
        (form as HTMLFormElement & { _submitType?: string })?._submitType ||
        'approval';

      setError(null);

      // Apply date transformations only during submission
      const transformedData = {
        ...data,
        startTime: transformStartTime(data.startTime),
        endTime: transformEndTime(data.endTime),
      };

      if (submitType === 'draft') {
        // Save as draft - create campaign but don't process blockchain transaction
        return await createCampaign({ ...transformedData, _saveAsDraft: true });
      } else {
        // Submit for approval - full process
        return await createCampaign(transformedData);
      }
    },
    [createCampaign, formState, onSubmitStep],
  );

  // Use demo campaign data for development prefill
  const { onDeveloperSubmit } = useDeveloperPrefill(form, setFormState);

  const onFailureRetry = useCallback(async () => {
    setState('setup');
    onSubmit(form.getValues());
  }, [onSubmit, form]);
  const onFailureCancel = useCallback(async () => {
    setState('idle');
  }, []);

  return (
    <div>
      <VisibilityToggle isVisible={!processing}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onSubmitStep)}>
            <CampaignCreateFormPage
              state={formState}
              page="introduction"
              onStateChanged={setFormState}
            >
              <div className="space-y-4">
                <div className="max-w-lg space-y-4">
                  <p className="text-lg font-medium leading-relaxed text-muted-foreground">
                    <strong>
                      You&apos;re about to launch your campaign, an exciting
                      step toward bringing your project to life and attracting
                      the support it deserves!
                    </strong>
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      <em>This guided process will help you:</em>
                    </p>
                    <ul className="max-w-sm list-inside list-disc space-y-1 text-left">
                      <li>
                        <em>Share your story in a compelling way</em>
                      </li>
                      <li>
                        <em>Set clear and realistic funding goals</em>
                      </li>
                      <li>
                        <em>
                          Prepare your campaign for maximum visibility and
                          success
                        </em>
                      </li>
                    </ul>
                    <p className="pt-2">
                      <em>
                        We&apos;ll walk you through everything you need to
                        inspire supporters and raise the funds to make your
                        vision possible.
                      </em>
                    </p>
                  </div>
                  {/* Development-only button to replicate original image shift/double-click campaign pre-fill logic */}
                  {process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true' && (
                    <div className="mt-6">
                      <Button
                        onClick={onDeveloperSubmit}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🚀 Dev: Pre-fill Form
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CampaignCreateFormPage>
            <CampaignCreateFormPage
              state={formState}
              page="description"
              onStateChanged={setFormState}
            >
              <CampaignCreateFormDescription />
            </CampaignCreateFormPage>
            <CampaignCreateFormPage
              state={formState}
              page="meta"
              onStateChanged={setFormState}
            >
              <CampaignCreateFormMeta />
            </CampaignCreateFormPage>
            <CampaignCreateFormPage
              state={formState}
              page="media"
              onStateChanged={setFormState}
            >
              <CampaignCreateFormMedia />
            </CampaignCreateFormPage>
            <CampaignCreateFormPage
              state={formState}
              page="funding"
              onStateChanged={setFormState}
            >
              <CampaignCreateFormFunding />
            </CampaignCreateFormPage>
            <CampaignCreateFormPage
              state={formState}
              page="timeline"
              onStateChanged={setFormState}
            >
              <CampaignCreateFormTimeline />
            </CampaignCreateFormPage>
            <CampaignCreateFormPage
              state={formState}
              page="summary"
              onStateChanged={setFormState}
            >
              <CampaignCreateFormSummary />
            </CampaignCreateFormPage>
          </form>
        </Form>
      </VisibilityToggle>
      <VisibilityToggle isVisible={processing}>
        <CampaignCreateProcessDisplay
          currentState={state}
          onFailureRetry={onFailureRetry}
          onFailureCancel={onFailureCancel}
          failureMessage={error}
        />
      </VisibilityToggle>
    </div>
  );
}
