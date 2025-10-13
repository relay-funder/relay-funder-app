/**
 * Individual stamp data in the score response
 */
export interface PassportStampData {
  score: string;
  dedup: boolean;
  expiration_date: string;
}

/**
 * Response from GET /v2/stamps/{scorer_id}/score/{address}
 */
export interface PassportScoreResponse {
  address: string;
  score: string;
  passing_score: boolean;
  last_score_timestamp: string;
  expiration_timestamp: string;
  threshold: string;
  error: string | null;
  stamps: Record<string, PassportStampData>;
}

/**
 * Individual stamp metadata
 */
export interface PassportStamp {
  version: string;
  credential: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Response from GET /v2/stamps/{address}
 */
export interface PassportStampsResponse {
  next: string | null;
  prev: string | null;
  items: PassportStamp[];
}
