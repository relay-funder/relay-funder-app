import { z } from 'zod';
import { countries, categories } from '@/lib/constant';
import type { DbCampaign } from '@/types/campaign';
import {
  ValidationStage,
  getValidationSummary,
} from '@/lib/ccp-validation/campaign-validation';

function validateTimes(value: string) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function validateStartTimeNotInPast(value: string) {
  const startDate = new Date(value);
  const now = new Date();

  // Check if the selected date is today
  const isToday = startDate.toDateString() === now.toDateString();

  if (isToday) {
    // Allow selecting today - the transformation will set to 1 hour from now during submission
    return true;
  }

  // For future dates, require minimum time buffer
  const bufferTime = 60 * 60 * 1000; // 1 hour for all envs
  const earliestAllowed = new Date(now.getTime() + bufferTime);

  return startDate >= earliestAllowed;
}

export const CampaignFormSchema = z
  .object({
    title: z
      .string()
      .min(5, { message: 'Title must not be empty' })
      .max(100, { message: 'Title must be 100 characters or less' }),
    description: z
      .string()
      .min(50, { message: 'Description must not be empty' })
      .max(2000, { message: 'Description must be 2000 characters or less' }),
    fundingGoal: z.string().refine(
      (value: string) => {
        const fValue = parseFloat(value);
        return !isNaN(fValue) && fValue > 0;
      },
      { message: 'Funding goal must be greater than zero' },
    ),
    fundingModel: z.string(),
    selectedRoundId: z.number().optional(),
    startTime: z
      .string()
      .refine(validateTimes, {
        message: 'Invalid date format',
      })
      .refine(validateStartTimeNotInPast, {
        message: 'Start time must be at least 1 hour in the future',
      }),
    endTime: z.string().refine(validateTimes, {
      message: 'Invalid date format',
    }),
    location: z.enum(countries, {
      errorMap: () => ({
        message: 'Invalid Country selected.',
      }),
    }),
    category: z.enum(
      categories.map(({ id }) => id) as unknown as [string, ...string[]],
      {
        errorMap: () => ({
          message: 'Invalid Category selected.',
        }),
      },
    ),
    bannerImage: z.instanceof(File).or(z.null()).optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'startTime must be less than endTime',
    path: ['endTime'],
  });
export type CampaignFormSchemaType = z.infer<typeof CampaignFormSchema>;

/**
 * Validate campaign data against the comprehensive validation matrix
 */
export function validateCampaignForSubmission(
  campaignData: Partial<CampaignFormSchemaType>,
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  // Transform form data to campaign object for validation
  const campaign: DbCampaign = {
    id: 0, // Temporary ID for validation
    title: campaignData.title || '',
    description: campaignData.description || '',
    fundingGoal: campaignData.fundingGoal || '0',
    startTime: campaignData.startTime
      ? new Date(campaignData.startTime)
      : new Date(),
    endTime: campaignData.endTime ? new Date(campaignData.endTime) : new Date(),
    creatorAddress: '', // Will be set by session
    status: 'DRAFT',
    transactionHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    campaignAddress: null,
    treasuryAddress: null,
    slug: '', // Will be generated
    location: campaignData.location || null,
    category: campaignData.category || null,
    featuredStart: null,
    featuredEnd: null,
    mediaOrder: [],
  };

  const summary = getValidationSummary(
    campaign,
    ValidationStage.PENDING_APPROVAL,
  );

  // Separate errors and warnings from messages
  const errors = summary.messages
    .filter((msg) => msg.startsWith('❌'))
    .map((msg) => msg.slice(2));
  const warnings = summary.messages
    .filter((msg) => msg.startsWith('⚠️'))
    .map((msg) => msg.slice(2));

  return {
    isValid: summary.canProceed,
    errors,
    warnings,
  };
}

export const campaignFormDefaultValues: CampaignFormSchemaType = {
  title: '',
  description: '',
  fundingGoal: '',
  fundingModel: 'flexible',
  selectedRoundId: undefined, // Will be set to upcoming round if available
  startTime: (() => {
    const now = new Date();
    return now.toISOString().slice(0, 10); // Today in YYYY-MM-DD format for date input
  })(),
  endTime: (() => {
    const now = new Date();
    const targetDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    return targetDate.toISOString().slice(0, 10); // YYYY-MM-DD format for date input
  })(),
  location: '',
  category: '',
  bannerImage: null,
};
