'use client';

import { useState, useCallback } from 'react';
import { Form } from '@/components/ui';
import { enableFormDefault } from '@/lib/develop';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProcessStates } from '@/types/round';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { RoundCreateProcessDisplay } from './process-display';
import { RoundCreateFormStates } from './form-states';
import { RoundCreateFormPage } from './form-page';
import { uniqueName, uniqueDescription } from '@/lib/generate-strings';
import Image from 'next/image';
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
import { cn } from '@/lib/utils';

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
              <div className="flex justify-end">
                <div className="hidden md:block md:justify-end">
                  <Image
                    src="/images/round-create-introduction.jpg"
                    width={512}
                    height={768}
                    className="max-w-[400px]"
                    alt="Create an engaging and vibrant illustration depicting a diverse group of people collaborating on a project. Include elements that represent creativity, funding, and community support, such as lightbulbs, coins, and hands coming together. The background should convey a sense of progress and innovation, with a timeline graphic showing the steps from submission to payout."
                    onDoubleClick={onDeveloperSubmit}
                  />
                </div>
              </div>
              <div
                className={cn(
                  'w-full max-w-full',
                  'prose prose-sm',
                  'overflow-y-auto p-1',

                  'h-[calc(100svh-200px)]',
                  'md:hidden',
                )}
              >
                <h2>{RoundCreateFormStates.introduction.title}</h2>
                <div
                  className={cn(
                    'overflow-y-visible',
                    'md:overflow-y-auto',
                    'h-[calc(50svh-100px-50px)]',
                    // 200: header, 40: container, 50 buttons, 40 title, 48 prose-padding
                    'md:h-[calc(100svh-202px-40px-50px-40px-48px)]',
                  )}
                >
                  {RoundCreateFormStates.introduction.description}
                </div>
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
              page="media"
              onStateChanged={setFormState}
            >
              <RoundCreateFormMedia />
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
              page="summary"
              onStateChanged={setFormState}
            >
              <RoundCreateFormSummary />
            </RoundCreateFormPage>
          </form>
        </Form>
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
