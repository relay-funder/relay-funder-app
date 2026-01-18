import { z } from 'zod';
import { countries, categories } from '@/lib/constant';
import {
  FUNDING_USAGE_MAX_LENGTH,
  FUNDING_USAGE_MIN_LENGTH,
} from '@/lib/constant/form';
import { validateAndParseDateString } from '@/lib/utils/date';
import {
  MAX_FILE_SIZE_BYTES,
  FILE_SIZE_ERROR_MESSAGE,
} from '@/components/campaign/constants';

function validateTimes(value: string) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}
function transformStartTime(value: string) {
  // Validate and parse YYYY-MM-DD as local date, not UTC
  const { year, month, day } = validateAndParseDateString(value);
  const localDate = new Date(year, month - 1, day);
  const now = new Date();
  if (
    now.getFullYear() === localDate.getFullYear() &&
    now.getMonth() === localDate.getMonth() &&
    now.getDate() === localDate.getDate()
  ) {
    localDate.setHours(now.getHours() + 1);
  }
  localDate.setMinutes(0);
  localDate.setSeconds(0);
  localDate.setMilliseconds(0);

  const transformed = localDate.toISOString(); // Returns in YYYY-MM-DDTHH:MM:SSZ format
  return transformed;
}
function transformEndTime(value: string) {
  // Validate and parse YYYY-MM-DD as local date, not UTC
  const { year, month, day } = validateAndParseDateString(value);
  const endTime = new Date(year, month - 1, day);

  endTime.setHours(23);
  endTime.setMinutes(59);
  endTime.setSeconds(59);
  endTime.setMilliseconds(0);

  const transformed = endTime.toISOString(); // Returns in YYYY-MM-DDTHH:MM:SSZ format
  return transformed;
}

export const CampaignFormSchema = z
  .object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .refine((value) => value.length >= 5, {
        message: 'Title must be at least 5 characters long',
      }),
    description: z
      .string()
      .min(1, { message: 'Description is required' })
      .refine((value) => value.length >= 50, {
        message: 'Description must be at least 50 characters long',
      }),
    fundingGoal: z.string().refine(
      (value: string) => {
        const fValue = parseFloat(value);
        return !isNaN(fValue);
      },
      { message: 'Invalid funding Goal' },
    ),
    fundingUsage: z
      .string()
      .min(1, { message: 'Use of Funds is required' })
      .refine((value) => value.length >= FUNDING_USAGE_MIN_LENGTH, {
        message: `Use of Funds must be at least ${FUNDING_USAGE_MIN_LENGTH} characters long`,
      })
      .refine((value) => value.length <= FUNDING_USAGE_MAX_LENGTH, {
        message: `Use of Funds must be ${FUNDING_USAGE_MAX_LENGTH} characters or less`,
      }),
    fundingModel: z.string(),
    startTime: z.string().transform(transformStartTime).refine(validateTimes, {
      message: 'Invalid date format',
    }),
    endTime: z.string().transform(transformEndTime).refine(validateTimes, {
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
    bannerImage: z
      .instanceof(File)
      .refine(
        (file) => file.size <= MAX_FILE_SIZE_BYTES,
        FILE_SIZE_ERROR_MESSAGE,
      )
      .or(z.null())
      .optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'startTime must be less than endTime',
    path: ['endTime'],
  });
export type CampaignFormSchemaType = z.infer<typeof CampaignFormSchema>;
