/**
 * Error thrown when Passport API configuration is invalid
 */
export class PassportConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PassportConfigError';
  }
}

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
