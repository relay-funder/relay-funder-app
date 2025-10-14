/**
 * Error thrown when Passport API request fails
 */
export class PassportApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = 'PassportApiError';
  }
}
