import { describe, expect, it } from 'vitest';
import { ApiParameterError } from '@/lib/api/error';
import { parseAndValidateRoundDates } from './validate-round-dates';

describe('parseAndValidateRoundDates', () => {
  it('parses valid dates and enforces ordering', () => {
    const result = parseAndValidateRoundDates({
      applicationStartTime: '2025-11-19T00:00:00.000Z',
      applicationEndTime: '2025-12-18T23:59:59.000Z',
      startTime: '2025-12-19T00:00:00.000Z',
      endTime: '2026-01-18T23:59:59.000Z',
    });

    expect(result.applicationStart).toBeInstanceOf(Date);
    expect(result.applicationEnd).toBeInstanceOf(Date);
    expect(result.roundStart).toBeInstanceOf(Date);
    expect(result.roundEnd).toBeInstanceOf(Date);
  });

  it('rejects missing fields', () => {
    expect(() =>
      parseAndValidateRoundDates({
        applicationStartTime: '',
        applicationEndTime: '2025-12-18T23:59:59.000Z',
        startTime: '2025-12-19T00:00:00.000Z',
        endTime: '2026-01-18T23:59:59.000Z',
      }),
    ).toThrow(ApiParameterError);
  });

  it('rejects invalid date strings', () => {
    expect(() =>
      parseAndValidateRoundDates({
        applicationStartTime: 'not-a-date',
        applicationEndTime: '2025-12-18T23:59:59.000Z',
        startTime: '2025-12-19T00:00:00.000Z',
        endTime: '2026-01-18T23:59:59.000Z',
      }),
    ).toThrow(ApiParameterError);
  });

  it('rejects application end after round start', () => {
    expect(() =>
      parseAndValidateRoundDates({
        applicationStartTime: '2025-11-19T00:00:00.000Z',
        applicationEndTime: '2025-12-20T00:00:00.000Z',
        startTime: '2025-12-19T00:00:00.000Z',
        endTime: '2026-01-18T23:59:59.000Z',
      }),
    ).toThrow(ApiParameterError);
  });
});
