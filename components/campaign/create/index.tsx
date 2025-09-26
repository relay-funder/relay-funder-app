'use client';

import { useState, useCallback } from 'react';
import { Form } from '@/components/ui';
import { countries, categories } from '@/lib/constant';
import { enableFormDefault } from '@/lib/develop';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProcessStates } from '@/types/campaign';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { CampaignCreateProcessDisplay } from './process-display';
import { CampaignCreateFormStates } from './form-states';
import { CampaignCreateFormPage } from './form-page';
import { uniqueName, uniqueDescription } from '@/lib/generate-strings';
import Image from 'next/image';
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
import { cn } from '@/lib/utils';

export function CampaignCreate({ onCreated }: { onCreated?: () => void }) {
  const [state, setState] = useState<keyof typeof CreateProcessStates>('idle');
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] =
    useState<keyof typeof CampaignCreateFormStates>('introduction');
  const processing = state !== 'idle';
  const { mutateAsync: createCampaign } = useCampaignFormCreate({
    onStateChanged: setState,
    onCreated,
    onError: setError,
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
      const submitType = (form as any)?._submitType || 'approval';

      setError(null);

      if (submitType === 'draft') {
        // Save as draft - create campaign but don't process blockchain transaction
        setState('create');
        try {
          await createCampaign({ ...data, _saveAsDraft: true });
          setState('done');
          if (onCreated) onCreated();
        } catch (error) {
          setState('failed');
          setError(
            `Failed to save draft: ${error instanceof Error ? error.message : 'Unknown Error'}`,
          );
        }
      } else {
        // Submit for approval - full process
        setState('setup');
        return await createCampaign(data);
      }
    },
    [createCampaign, formState, onSubmitStep, onCreated],
  );

  const onDeveloperSubmit = useCallback(
    async (event: React.MouseEvent) => {
      if (!event.shiftKey) {
        return;
      }
      if (!enableFormDefault) {
        return;
      }
      form.setValue('title', uniqueName());
      form.setValue('description', uniqueDescription());
      form.setValue('fundingGoal', `${(Math.random() * 1000).toFixed(2)}`);
      form.setValue('fundingModel', 'flexible');
      form.setValue('startTime', new Date().toISOString().slice(0, 16));
      form.setValue(
        'endTime',
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
      );
      form.setValue(
        'location',
        countries[Math.floor(Math.random() * countries.length)],
      );
      form.setValue(
        'category',
        categories[Math.floor(Math.random() * categories.length)].id,
      );
      setFormState('summary');
    },
    [form],
  );

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
                    You're about to create a campaign that will help bring your
                    project to life. This process will walk you through
                    everything you need to attract supporters and raise funds.
                  </p>
                  <p className="text-gray-600">
                    We'll help you craft a compelling story, set your funding
                    goals, and prepare your campaign for success.
                  </p>
                </div>
                <div
                  className="hidden"
                  onDoubleClick={onDeveloperSubmit}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '20px',
                    height: '20px',
                  }}
                />
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
