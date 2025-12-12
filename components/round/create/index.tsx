'use client';

import { useState, useCallback } from 'react';
import { Form, Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProcessStates } from '@/types/round';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { RoundCreateProcessDisplay } from './process-display';
import { RoundCreateFormStates } from './form-states';
import { RoundCreateFormPage } from './form-page';
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
  const router = useRouter();
  const onCreateSuccess = useCallback(() => {
    // Redirect to admin rounds overview after successful creation
    router.push('/admin/rounds');
  }, [router]);

  const { mutateAsync: createCampaign } = useRoundFormCreate({
    onStateChanged: setState,
    onCreated: onCreated || onCreateSuccess,
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

  const onDeveloperSubmit = useCallback(async () => {
    // Generate meaningful title and description for humanitarian quadratic funding
    const roundTitles = [
      'Humanitarian Tech Innovation Round',
      'Global Impact Open Source Fund',
      'Community-Driven Humanitarian Solutions',
      'Open Source for Social Good',
      'Tech for Humanity Matching Round',
      'Empower Communities Through Code',
      'Digital Tools for Humanitarian Aid',
      'Open Source Humanitarian Challenge',
    ];

    const roundDescriptions = [
      'This quadratic funding round supports projects that create meaningful impact in humanitarian efforts. Projects focused on education, health, disaster response, and community development will receive matching funds based on community engagement and support.',
      "Join us in funding innovative solutions that address critical humanitarian challenges. Through quadratic funding, community donations are amplified to support projects making a real difference in people's lives worldwide.",
      'Empowering communities through technology. This round funds projects that provide digital tools and platforms for humanitarian organizations, disaster response teams, and social impact initiatives.',
      'Supporting the ecosystem that drives humanitarian innovation. Projects selected through community voting will receive matching funds to accelerate development of tools that save lives and improve communities.',
      "A dedicated funding round for projects that leverage technology to address humanitarian needs. From educational platforms to disaster management systems, we're looking for solutions that create lasting positive change.",
    ];

    const randomTitle =
      roundTitles[Math.floor(Math.random() * roundTitles.length)];
    const randomDescription =
      roundDescriptions[Math.floor(Math.random() * roundDescriptions.length)];

    form.setValue('title', randomTitle);
    form.setValue('description', randomDescription);
    form.setValue('descriptionUrl', 'https://example.com');
    form.setValue('matchingPool', Math.round(Math.random() * 1000) + 100); // Ensure > 0
    form.setValue('tags', [
      'RULE_MATCHING_QF',
      'RULE_DISTRIBUTION_AFTER',
    ]);

    // Set proper timeline according to validation rules:
    // applicationEndTime <= startTime (applications close before round starts)
    const now = new Date();
    const applicationStartTime = now.toISOString().slice(0, 10);
    const applicationEndTime = new Date(
      now.getTime() + 29 * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .slice(0, 10); // 29 days
    const startTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10); // 30 days
    const endTime = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10); // 60 days

    form.setValue('applicationStartTime', applicationStartTime);
    form.setValue('applicationEndTime', applicationEndTime);
    form.setValue('startTime', startTime);
    form.setValue('endTime', endTime);

    setFormState('summary');
  }, [form]);

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
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {RoundCreateFormStates.introduction.description}
                </div>
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
