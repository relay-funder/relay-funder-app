export * from './passport-api-v2';

export interface GetPassportResponse {
  success: boolean;
  address: string;
  humanityScore: number;
  passportScore: string;
  passingScore: boolean;
  threshold: string;
  lastScoreTimestamp: string;
  expirationTimestamp: string;
  stamps?: Record<
    string,
    {
      score: string;
      dedup: boolean;
      expiration_date: string;
    }
  >;
}

export interface GetPassportErrorResponse {
  success: false;
  error: string;
  details?: string;
}
