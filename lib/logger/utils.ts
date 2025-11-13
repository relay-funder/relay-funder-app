import { LogType } from './types';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const logColors: Record<LogType, string> = {
  debug: colors.cyan,
  info: colors.blue,
  warn: colors.yellow,
  error: colors.red,
};

/** Formats log prefix with color and optional symbol. */
export const formatLogPrefix = (
  prefix: string,
  logType: LogType,
  prefixSymbol = '',
): string => {
  return prefix
    ? `${prefixSymbol ? `${prefixSymbol} ` : ''}[${logColors[logType]}${prefix}${colors.reset}]: `
    : '';
};

/** Appends two strings with optional separator, handling undefined/null. */
export const appendString = (
  a?: string,
  b?: string,
  separator = '',
): string => {
  if (a && b) return a.concat(separator, b);
  if (a) return a;
  return b ?? '';
};

/** Helper for combining parent and child prefixes. If appendFn is provided, it will be used to append the prefixes. */
export const appendPrefixHelper = (
  prefixA = '',
  prefixB = '',
  separator = '',
  appendFn?: (prefixA?: string, prefixB?: string) => string,
): string =>
  appendFn
    ? appendFn(prefixA, prefixB)
    : appendString(prefixA, prefixB, separator);
