import { z } from 'zod';
import { validateAndParseDateString } from '@/lib/utils/date';

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

function transformApplicationStartTime(value: string) {
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
function transformApplicationEndTime(value: string) {
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

export const RoundFormSchema = z
  .object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(100, { message: 'Title must be 100 characters or less' }),
    description: z
      .string()
      .min(1, { message: 'Description is required' })
      .refine((value) => value.length >= 10, {
        message: 'Description must be at least 10 characters long',
      })
      .refine((value) => value.length <= 2000, {
        message: 'Description must be 2000 characters or less',
      }),
    descriptionUrl: z
      .string()
      .optional()
      .refine((val) => !val || /^https?:\/\/.+/.test(val), {
        message: 'Must be a valid URL starting with http:// or https://',
      }),
    matchingPool: z.coerce
      .number()
      .min(0.01, { message: 'Matching pool must be greater than 0.' })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Matching pool must be greater than 0.',
      }),
    startTime: z.string().transform(transformStartTime).refine(validateTimes, {
      message: 'Invalid date format',
    }),
    endTime: z.string().transform(transformEndTime).refine(validateTimes, {
      message: 'Invalid date format',
    }),
    applicationStartTime: z
      .string()
      .transform(transformApplicationStartTime)
      .refine(validateTimes, {
        message: 'Invalid date format',
      }),
    applicationEndTime: z
      .string()
      .transform(transformApplicationEndTime)
      .refine(validateTimes, {
        message: 'Invalid date format',
      }),
    logo: z.instanceof(File).or(z.null()).optional(),
    tags: z.array(z.string()),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'startTime must be less than endTime',
    path: ['endTime'],
  })
  .refine((data) => data.applicationStartTime < data.applicationEndTime, {
    message: 'applicationStartTime must be less than applicationEndTime',
    path: ['applicationEndTime'],
  })
  .refine((data) => data.applicationStartTime <= data.startTime, {
    message: 'applicationStartTime must be before or equal to startTime',
    path: ['applicationStartTime'],
  })
  .refine((data) => data.applicationEndTime <= data.startTime, {
    message: 'applicationEndTime must be before or equal to startTime',
    path: ['applicationEndTime'],
  });
export type RoundFormSchemaType = z.infer<typeof RoundFormSchema>;
export const roundFormDefaultValues: RoundFormSchemaType = {
  title: '',
  description: '',
  descriptionUrl: '',
  matchingPool: 0,
  // Application period: now to 29 days from now (closes 1 day before round starts)
  applicationStartTime: new Date().toISOString().slice(0, 10),
  applicationEndTime: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  // Round period: starts 30 days from now, ends 60 days from now (30 days duration)
  startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  logo: null,
  tags: [
    'REQUIRE_OPEN_SOURCE',
    'REQUIRE_TEAM_CAPABILITY',
    'RULE_MATCHING_QF',
    'RULE_DISTRIBUTION_AFTER',
  ],
};
