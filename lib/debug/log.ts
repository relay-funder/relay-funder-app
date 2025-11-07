import { IS_PRODUCTION } from '../constant';
import { checkIsDebugFlagEnabled } from './flags';

/**
 * Environment variable containing comma-separated list of user addresses
 * that should receive verbose logging in production.
 * Example: "0x123...,0x456..."
 * @see NEXT_PUBLIC_DEBUG_USERS
 */
const debugUsersEnv = process.env.NEXT_PUBLIC_DEBUG_USERS;

/**
 * Array of user addresses (lowercased) that should receive verbose logging in production.
 * Parsed from NEXT_PUBLIC_DEBUG_USERS environment variable.
 */
const debugUsers =
  debugUsersEnv?.split(',').map((addr) => addr.trim().toLowerCase()) ?? [];

/**
 * Checks if a user address is in the list of verbose users.
 * Verbose users receive detailed logging even in production when using 'verbose' log type.
 *
 * @param address - The user address to check (case-insensitive)
 * @returns `true` if the address is in the verbose users list, `false` otherwise
 *
 * @example
 * ```ts
 * checkIsVerboseUser('0x123...') // true if address is in NEXT_PUBLIC_DEBUG_USERS
 * checkIsVerboseUser(null) // false
 * ```
 */
export function checkIsVerboseUser(address?: string | null): boolean {
  if (!address) {
    return false;
  }
  return debugUsers.includes(address.toLowerCase());
}

/**
 * Log level types for the logging system.
 * - 'info': Informational messages (blue)
 * - 'warn': Warning messages (yellow)
 * - 'error': Error messages (red)
 * - 'debug': Debug messages (cyan)
 * - 'verbose': Verbose messages (only shown to verbose users in production, cyan in dev)
 */
export type LogType = 'info' | 'warn' | 'error' | 'debug' | 'verbose';

/**
 * ANSI color codes for terminal output.
 */
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

/**
 * Color mapping for different log types.
 */
const typeColors: Record<string, string> = {
  debug: colors.cyan,
  info: colors.blue,
  warn: colors.yellow,
  error: colors.red,
};

/**
 * Determines whether a log message should be output based on debug flags and user permissions.
 *
 * A log will be output if:
 * 1. The debug flag is enabled (via checkIsDebugFlagEnabled), OR
 * 2. In production, the log type is 'verbose' AND the user is a verbose user
 *
 * @param type - The log type/level
 * @param flag - The debug flag name to check (defaults to 'debug' if not provided)
 * @param user - The user address to check for verbose permissions
 * @returns `true` if the log should be output, `false` otherwise
 */
function checkShouldLog({
  type,
  flag,
  user,
}: {
  type: LogType;
  flag?: string;
  user?: string;
}): boolean {
  if (checkIsDebugFlagEnabled(flag)) {
    return true;
  }

  const isVerboseUser = checkIsVerboseUser(user);
  if (IS_PRODUCTION && type === 'verbose' && isVerboseUser) {
    return true;
  }

  return false;
}

/**
 * Logs a message to the console with color coding and optional data.
 *
 * The log will only be output if:
 * - The debug flag is enabled, OR
 * - In production, the log type is 'verbose' AND the user is a verbose user
 *
 * Log messages are color-coded by type:
 * - 'debug' / 'verbose': Cyan
 * - 'info': Blue
 * - 'warn': Yellow
 * - 'error': Red
 *
 * @param message - The log message to output
 * @param options - Logging options
 * @param options.type - The log level type (default: 'debug')
 * @param options.prefix - Custom prefix for the log (defaults to the log type)
 * @param options.user - User address for verbose logging permission checks
 * @param options.data - Additional data to log (objects, arrays, etc.)
 * @param options.flag - Debug flag name to check (default: 'debug')
 *
 * @example
 * ```ts
 * log('User logged in', { type: 'info', flag: 'auth' });
 * log('API error', { type: 'error', data: errorObject });
 * log('Debug info', { type: 'verbose', user: '0x123...' });
 * ```
 */
export function log(
  message: string,
  {
    type = 'debug',
    prefix,
    user,
    data,
    flag = 'debug',
  }: {
    type?: LogType;
    prefix?: string;
    user?: string;
    data?: unknown;
    flag?: string;
  },
): void {
  if (!checkShouldLog({ type, flag, user })) {
    return;
  }

  const logType = type === 'verbose' ? 'debug' : type;

  const color = typeColors[logType] || colors.white;
  const prefixText = prefix ?? type;
  const coloredPrefix = `${color}${colors.bright}${prefixText}${colors.reset}`;
  const coloredMessage = `${color}${message}${colors.reset}`;

  {
    console[logType](`[${coloredPrefix}]: ${coloredMessage}`, data);
  }
}
