'use client';

import { useState, useCallback, useEffect } from 'react';
import { Form } from '@/components/ui';
import { countries, categories } from '@/lib/constant';
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

      if (submitType === 'draft') {
        // Save as draft - create campaign but don't process blockchain transaction
        return await createCampaign({ ...data, _saveAsDraft: true });
      } else {
        // Submit for approval - full process
        return await createCampaign(data);
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
              <div className="space-y-4 text-center">
                <div className="mx-auto max-w-lg space-y-4">
                  <p className="leading-relaxed text-gray-600">
                    You&apos;re about to create a campaign that will help bring
                    your project to life. This process will walk you through
                    everything you need to attract supporters and raise funds.
                  </p>
                  <p className="text-gray-600">
                    We&apos;ll help you craft a compelling story, set your
                    funding goals, and prepare your campaign for success.
                  </p>
                  {/* Development-only button to replicate original image shift/double-click campaign pre-fill logic */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6">
                      <Button
                        onClick={(e) => onDeveloperSubmit(e)}
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
