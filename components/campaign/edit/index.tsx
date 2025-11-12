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
import { CampaignEditFormMedia } from './form-media';
import { CampaignEditFormDescription } from './form-description';
import { CampaignEditFormMeta } from './form-meta';
import { CampaignEditFormSummary } from './form-summary';
// Reuse create form components
import { CampaignCreateFormFunding } from '../create/form-funding';
import { CampaignCreateFormTimeline } from '../create/form-timeline';
import { CampaignFormSchema, CampaignFormSchemaType } from './form';
import { useCampaignFormEdit } from './use-form-edit';
import { categories } from '@/lib/constant';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function CampaignEdit({ campaign }: { campaign: DbCampaign }) {
  const [state, setState] = useState<keyof typeof UpdateProcessStates>('idle');
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] =
    useState<keyof typeof CampaignEditFormStates>('description');
  const processing = state !== 'idle';
  const router = useRouter();
  const { toast } = useToast();

  // Detect if campaign has been deployed on-chain (restricts on-chain fields)
  const isOnChainDeployed =
    campaign.transactionHash !== null && campaign.campaignAddress !== null;

  // Detect if campaign has already been submitted for approval (affects button text)
  const isAlreadySubmitted =
    campaign.status === 'PENDING_APPROVAL' ||
    campaign.status === 'ACTIVE' ||
    campaign.status === 'COMPLETED' ||
    isOnChainDeployed;
  const onEditSuccess = useCallback(
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
          title: 'Campaign Saved!',
          description: 'Your campaign changes have been saved successfully.',
          variant: 'default',
        });
      }

      // Redirect to campaigns overview
      router.push('/campaigns');
    },
    [toast, router],
  );

  const { mutateAsync: updateCampaign } = useCampaignFormEdit({
    onStateChanged: setState,
    campaign,
    onError: setError,
    onSuccess: onEditSuccess,
  });

  const form = useForm<CampaignFormSchemaType>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: {
      ...campaign,
      location: campaign.location ?? '',
      category:
        categories.find((category) => category.id === campaign.category)?.id ??
        '',
      fundingGoal: campaign.fundingGoal || '',
      fundingUsage: campaign.fundingUsage || '',
      fundingModel: 'flexible', // Default funding model
      startTime: campaign.startTime
        ? new Date(campaign.startTime).toISOString().slice(0, 10)
        : '',
      endTime: campaign.endTime
        ? new Date(campaign.endTime).toISOString().slice(0, 10)
        : '',
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
    async (data: CampaignFormSchemaType, event?: React.BaseSyntheticEvent) => {
      if (formState !== 'summary') {
        return onSubmitStep();
      }
      setError(null);
      setState('setup');

      // Check the submission type
      const submitType =
        (event?.target as HTMLFormElement & { _submitType?: string })
          ?._submitType || 'approval';
      const isSubmittingForApproval = submitType === 'approval';

      return await updateCampaign({
        ...data,
        _submitForApproval: isSubmittingForApproval,
      });
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
              page="description"
              onStateChanged={setFormState}
              isAlreadySubmitted={isAlreadySubmitted}
            >
              <CampaignEditFormDescription />
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="meta"
              onStateChanged={setFormState}
              isAlreadySubmitted={isAlreadySubmitted}
            >
              <CampaignEditFormMeta />
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="funding"
              onStateChanged={setFormState}
              isAlreadySubmitted={isAlreadySubmitted}
            >
              <CampaignCreateFormFunding
                isOnChainDeployed={isOnChainDeployed}
              />
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="timeline"
              onStateChanged={setFormState}
              isAlreadySubmitted={isAlreadySubmitted}
            >
              <CampaignCreateFormTimeline
                isOnChainDeployed={isOnChainDeployed}
              />
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="media"
              onStateChanged={setFormState}
              isAlreadySubmitted={isAlreadySubmitted}
            >
              <CampaignEditFormMedia campaign={campaign} />
            </CampaignEditFormPage>
            <CampaignEditFormPage
              state={formState}
              page="summary"
              onStateChanged={setFormState}
              isAlreadySubmitted={isAlreadySubmitted}
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
