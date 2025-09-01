'use client';

import { useState, useCallback } from 'react';
import { Form } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProcessStates, DbCampaign } from '@/types/campaign';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { CampaignEditProcessDisplay } from './process-display';
import { CampaignEditFormStates } from './form-states';
import { CampaignEditFormPage } from './form-page';
import Image from 'next/image';
import { CampaignEditFormMedia } from './form-media';
import { CampaignEditFormDescription } from './form-description';
import { CampaignEditFormMeta } from './form-meta';
import { CampaignEditFormSummary } from './form-summary';
import { CampaignFormSchema, CampaignFormSchemaType } from './form';
import { useCampaignFormEdit } from './use-form-edit';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/constant';

export function CampaignEdit({ campaign }: { campaign: DbCampaign }) {
  const [state, setState] = useState<keyof typeof UpdateProcessStates>('idle');
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] =
    useState<keyof typeof CampaignEditFormStates>('introduction');
  const processing = state !== 'idle';
  const { mutateAsync: updateCampaign } = useCampaignFormEdit({
    onStateChanged: setState,
    campaign,
    onError: setError,
  });

  const form = useForm<CampaignFormSchemaType>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: async () => {
      return {
        ...campaign,
        location: campaign.location ?? '',
        category:
          categories.find((category) => category.name === campaign.category)
            ?.id ?? '',
      };
    },
  });
  const onSubmitStep = useCallback(async () => {
    const isPageValid = await form.trigger(
      CampaignEditFormStates[formState]
        .fields as (keyof CampaignFormSchemaType)[],
    );
    if (isPageValid && CampaignEditFormStates[formState].next?.target) {
      setFormState(CampaignEditFormStates[formState].next?.target);
      form.clearErrors();
    }
  }, [form, formState]);

  const onSubmit = useCallback(
    async (data: CampaignFormSchemaType) => {
      if (formState !== 'summary') {
        return onSubmitStep();
      }
      setError(null);
      setState('setup');
      return await updateCampaign(data);
    },
    [updateCampaign, formState, onSubmitStep],
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
            <CampaignEditFormPage
              state={formState}
              page="introduction"
              onStateChanged={setFormState}
            >
              <div className="flex justify-end">
                <div className="hidden md:block md:justify-end">
                  <Image
                    src="/images/campaign-create-introduction.jpg"
                    width={512}
                    height={768}
                    className="max-w-[400px]"
                    alt="Create an engaging and vibrant illustration depicting a diverse group of people collaborating on a project. Include elements that represent creativity, funding, and community support, such as lightbulbs, coins, and hands coming together. The background should convey a sense of progress and innovation, with a timeline graphic showing the steps from submission to payout."
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
                <h2>{CampaignEditFormStates.introduction.title}</h2>
                <div
                  className={cn(
                    'overflow-y-visible',
                    'md:overflow-y-auto',
                    'h-[calc(50svh-100px-50px)]',
                    // 200: header, 40: container, 50 buttons, 40 title, 48 prose-padding
                    'md:h-[calc(100svh-202px-40px-50px-40px-48px)]',
                  )}
                >
                  {CampaignEditFormStates.introduction.description}
                </div>
              </div>
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="description"
              onStateChanged={setFormState}
            >
              <CampaignEditFormDescription />
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="meta"
              onStateChanged={setFormState}
            >
              <CampaignEditFormMeta />
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="media"
              onStateChanged={setFormState}
            >
              <CampaignEditFormMedia />
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="summary"
              onStateChanged={setFormState}
            >
              <CampaignEditFormSummary campaign={campaign} />
            </CampaignEditFormPage>
          </form>
        </Form>
      </VisibilityToggle>
      <VisibilityToggle isVisible={processing}>
        <CampaignEditProcessDisplay
          currentState={state}
          onFailureRetry={onFailureRetry}
          onFailureCancel={onFailureCancel}
          failureMessage={error}
        />
      </VisibilityToggle>
    </div>
  );
}
