export class QFCalculationError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, QFCalculationError.prototype);
    this.name = 'QFCalculationError';
  }
}
