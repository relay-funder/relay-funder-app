/**
 * Validates and parses a date string in YYYY-MM-DD format.
 * @throws {TypeError} if the input is invalid
 * @returns {object} Parsed year, month (1-12), and day
 */
export function validateAndParseDateString(value: string): {
  year: number;
  month: number;
  day: number;
} {
  // Check for non-empty string
  if (!value || typeof value !== 'string') {
    throw new TypeError('Date input must be a non-empty string');
  }

  // Check format matches YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(value)) {
    throw new TypeError(
      `Invalid date format: expected YYYY-MM-DD, received "${value}"`,
    );
  }

  // Parse components
  const parts = value.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Validate month range
  if (month < 1 || month > 12) {
    throw new TypeError(
      `Invalid month value: ${month} (must be between 1 and 12)`,
    );
  }

  // Validate day range for the given month/year
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    throw new TypeError(
      `Invalid day value: ${day} (must be between 1 and ${daysInMonth} for ${year}-${month.toString().padStart(2, '0')})`,
    );
  }

  // Create Date and verify it matches parsed values (catches invalid dates like Feb 30)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new TypeError(
      `Invalid date: ${value} does not represent a valid calendar date`,
    );
  }

  return { year, month, day };
}

export function toLocalDateInputValue(
  value: string | Date | null | undefined,
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
