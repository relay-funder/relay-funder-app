import { z } from 'zod';

function validateTimes(value: string) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}
function transformStartTime(value: string) {
  const localDate = new Date(value);
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
  const endTime = new Date(value);

  endTime.setHours(23);
  endTime.setMinutes(59);
  endTime.setSeconds(59);
  endTime.setMilliseconds(0);

  const transformed = endTime.toISOString(); // Returns in YYYY-MM-DDTHH:MM:SSZ format
  return transformed;
}

function transformApplicationStartTime(value: string) {
  const localDate = new Date(value);
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
  const endTime = new Date(value);

  endTime.setHours(23);
  endTime.setMinutes(59);
  endTime.setSeconds(59);
  endTime.setMilliseconds(0);

  const transformed = endTime.toISOString(); // Returns in YYYY-MM-DDTHH:MM:SSZ format
  return transformed;
}

export const RoundFormSchema = z
  .object({
    title: z.string().min(5, { message: 'Title must not be empty' }),
    description: z
      .string()
      .min(50, { message: 'Description must not be empty' }),
    matchingPool: z.coerce
      .number()
      .min(0)
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Matching pool must be a non-negative number.',
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
  .refine((data) => data.applicationStartTime >= data.startTime, {
    message: 'applicationStartTime must be at least startTime',
    path: ['applicationStartTime'],
  })
  .refine((data) => data.applicationEndTime <= data.endTime, {
    message: 'applicationEndTime must be less than endTime',
    path: ['applicationEndTime'],
  });
export type RoundFormSchemaType = z.infer<typeof RoundFormSchema>;
export const roundFormDefaultValues: RoundFormSchemaType = {
  title: '',
  description: '',
  matchingPool: 0,
  startTime: new Date().toISOString().slice(0, 10),
  endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  applicationStartTime: new Date().toISOString().slice(0, 10),
  applicationEndTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
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
