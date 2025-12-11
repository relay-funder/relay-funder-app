import { ApiParameterError } from '@/lib/api/error';

export type RoundDateInputs = {
  applicationStartTime: string;
  applicationEndTime: string;
  startTime: string;
  endTime: string;
};

function parseDateTime(value: string, fieldName: string): Date {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiParameterError(`${fieldName} is required`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiParameterError(`Invalid ${fieldName}`);
  }
  return parsed;
}

export function parseAndValidateRoundDates(inputs: RoundDateInputs) {
  const applicationStart = parseDateTime(
    inputs.applicationStartTime,
    'applicationStartTime',
  );
  const applicationEnd = parseDateTime(
    inputs.applicationEndTime,
    'applicationEndTime',
  );
  const roundStart = parseDateTime(inputs.startTime, 'startTime');
  const roundEnd = parseDateTime(inputs.endTime, 'endTime');

  if (!(applicationStart.getTime() < applicationEnd.getTime())) {
    throw new ApiParameterError(
      'Application start date must be before application end date.',
    );
  }

  if (!(roundStart.getTime() < roundEnd.getTime())) {
    throw new ApiParameterError(
      'Round start date must be before round end date.',
    );
  }

  if (!(applicationStart.getTime() <= roundStart.getTime())) {
    throw new ApiParameterError(
      'Application start date must be before or equal to round start date.',
    );
  }

  if (!(applicationEnd.getTime() <= roundStart.getTime())) {
    throw new ApiParameterError(
      'Application end date must be before or equal to round start date.',
    );
  }

  return {
    applicationStart,
    applicationEnd,
    roundStart,
    roundEnd,
  };
}
