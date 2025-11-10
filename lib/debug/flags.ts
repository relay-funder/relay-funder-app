import { IS_PRODUCTION } from '@/lib/constant';

export const debug = !IS_PRODUCTION;
export const debugWeb3 = debug;
export const debugWeb3UseAuth = debugWeb3;
export const debugWeb3ContextProvider = debugWeb3;
export const debugWeb3AdapterSilkConnector = debugWeb3;
export const debugApi = debug;
export const debugLib = debug;
export const debugComponentData = debug;
export const debugAuth = debug;
export const debugHook = debug;
export const debugQf = process.env.NEXT_PUBLIC_DEBUG_QF === 'true' || false;
const debugFlagsEnv = process.env.NEXT_PUBLIC_DEBUG_FLAGS;

/**
 * Array of debug flag names parsed from NEXT_PUBLIC_DEBUG_FLAGS environment variable.
 * These flags take precedence over the default debug flag values.
 */
const debugFlagsArray =
  debugFlagsEnv?.split(',').filter((flag) => flag !== '') ?? [];

/**
 * Record mapping debug flag names to their boolean values.
 * Used as fallback when flag is not explicitly enabled via environment variable.
 */
const debugFlags: Record<string, boolean> = {
  debug: debug,
  web3: debugWeb3,
  api: debugApi,
  lib: debugLib,
  auth: debugAuth,
  hook: debugHook,
  qf: debugQf,
  component: debugComponentData,
};

/**
 * Checks if a debug flag is enabled.
 *
 * A flag is considered enabled if:
 * 1. It's listed in NEXT_PUBLIC_DEBUG_FLAGS environment variable (comma-separated), OR
 * 2. It exists in the debugFlags record and its value is true
 *
 * @param flag - The name of the debug flag to check (e.g., 'debug', 'web3', 'api')
 * @returns `true` if the flag is enabled, `false` otherwise. Returns `false` if flag is undefined or empty.
 *
 * @example
 * ```ts
 * checkIsDebugFlagEnabled('debug') // true if debug is enabled
 * checkIsDebugFlagEnabled('web3') // true if web3 debug is enabled
 * checkIsDebugFlagEnabled('unknown') // false
 * checkIsDebugFlagEnabled() // false
 * ```
 */
export const checkIsDebugFlagEnabled = (flag?: string): boolean => {
  if (!flag) {
    return false;
  }

  return (debugFlagsArray.includes(flag) || debugFlags[flag]) ?? false;
};
