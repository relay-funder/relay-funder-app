'use client';

import { useState, useCallback } from 'react';
import { Form, Button } from '@/components/ui';
import { enableFormDefault } from '@/lib/develop';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProcessStates } from '@/types/round';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { RoundCreateProcessDisplay } from './process-display';
import { RoundCreateFormStates } from './form-states';
import { RoundCreateFormPage } from './form-page';
import { uniqueName, uniqueDescription } from '@/lib/generate-strings';
import { RoundCreateFormMedia } from './form-media';
import { RoundCreateFormDescription } from './form-description';
import { RoundCreateFormFunding } from './form-funding';
import { RoundCreateFormTimeline } from './form-timeline';
import { RoundCreateFormSummary } from './form-summary';
import {
  RoundFormSchema,
  RoundFormSchemaType,
  roundFormDefaultValues,
} from './form';
import { useRoundFormCreate } from './use-form-create';

export function RoundCreate({ onCreated }: { onCreated?: () => void }) {
  const [state, setState] = useState<keyof typeof CreateProcessStates>('idle');
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] =
    useState<keyof typeof RoundCreateFormStates>('introduction');
  const processing = state !== 'idle';
  const { mutateAsync: createCampaign } = useRoundFormCreate({
    onStateChanged: setState,
    onCreated,
    onError: setError,
  });

  const form = useForm<RoundFormSchemaType>({
    resolver: zodResolver(RoundFormSchema),
    defaultValues: roundFormDefaultValues,
  });
  const onSubmitStep = useCallback(async () => {
    const isPageValid = await form.trigger(
      RoundCreateFormStates[formState].fields as (keyof RoundFormSchemaType)[],
    );
    if (isPageValid && RoundCreateFormStates[formState].next?.target) {
      setFormState(RoundCreateFormStates[formState].next?.target);
      form.clearErrors();
    }
  }, [form, formState]);

  const onSubmit = useCallback(
    async (data: RoundFormSchemaType) => {
      if (formState !== 'summary') {
        return onSubmitStep();
      }
      setError(null);
      setState('setup');
      return await createCampaign(data);
    },
    [createCampaign, formState, onSubmitStep],
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
      form.setValue('matchingPool', Math.round(Math.random() * 1000));
      form.setValue('startTime', new Date().toISOString().slice(0, 16));
      form.setValue(
        'endTime',
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
      );
      form.setValue(
        'applicationStartTime',
        new Date().toISOString().slice(0, 16),
      );
      form.setValue(
        'applicationEndTime',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
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
            <RoundCreateFormPage
              state={formState}
              page="introduction"
              onStateChanged={setFormState}
            >
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {RoundCreateFormStates.introduction.description}
              </div>
            </RoundCreateFormPage>
            <RoundCreateFormPage
              state={formState}
              page="description"
              onStateChanged={setFormState}
            >
              <RoundCreateFormDescription />
            </RoundCreateFormPage>
            <RoundCreateFormPage
              state={formState}
              page="funding"
              onStateChanged={setFormState}
            >
              <RoundCreateFormFunding />
            </RoundCreateFormPage>
            <RoundCreateFormPage
              state={formState}
              page="timeline"
              onStateChanged={setFormState}
            >
              <RoundCreateFormTimeline />
            </RoundCreateFormPage>
            <RoundCreateFormPage
              state={formState}
              page="media"
              onStateChanged={setFormState}
            >
              <RoundCreateFormMedia />
            </RoundCreateFormPage>
            <RoundCreateFormPage
              state={formState}
              page="summary"
              onStateChanged={setFormState}
            >
              <RoundCreateFormSummary />
            </RoundCreateFormPage>
          </form>
        </Form>

        {/* Development-only button to pre-fill form */}
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
      </VisibilityToggle>
      <VisibilityToggle isVisible={processing}>
        <RoundCreateProcessDisplay
          currentState={state}
          onFailureRetry={onFailureRetry}
          onFailureCancel={onFailureCancel}
          failureMessage={error}
        />
      </VisibilityToggle>
    </div>
  );
}
