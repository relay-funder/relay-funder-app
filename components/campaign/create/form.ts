import { z } from 'zod';
import { countries, categories } from '@/lib/constant';

function validateTimes(value: string) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}
function transformStartTime(value: string) {
  const localDate = new Date(value);
  // Allow campaigns to start immediately without artificial delay
  localDate.setMinutes(0);
  localDate.setSeconds(0);
  localDate.setMilliseconds(0);

  const transformed = localDate.toISOString(); // Returns in YYYY-MM-DDTHH:MM:SSZ format
  return transformed;
}
function transformEndTime(value: string) {
  const endTime = new Date(value);

  endTime.setHours(23);
  endTime.setMinutes(59);
  endTime.setSeconds(59);
  endTime.setMilliseconds(0);

  const transformed = endTime.toISOString(); // Returns in YYYY-MM-DDTHH:MM:SSZ format
  return transformed;
}

export const CampaignFormSchema = z
  .object({
    title: z.string().min(5, { message: 'Title must not be empty' }),
    description: z
      .string()
      .min(50, { message: 'Description must not be empty' }),
    fundingGoal: z.string().refine(
      (value: string) => {
        const fValue = parseFloat(value);
        return !isNaN(fValue);
      },
      { message: 'Invalid funding Goal' },
    ),
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
    bannerImage: z.instanceof(File).or(z.null()).optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'startTime must be less than endTime',
    path: ['endTime'],
  });
export type CampaignFormSchemaType = z.infer<typeof CampaignFormSchema>;
export const campaignFormDefaultValues: CampaignFormSchemaType = {
  title: '',
  description: '',
  fundingGoal: '',
  fundingModel: 'flexible',
  startTime: new Date().toISOString().slice(0, 10),
  endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  location: '',
  category: '',
  bannerImage: null,
};
