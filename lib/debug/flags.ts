import { IS_PRODUCTION } from '@/lib/constant';

const debugFlagsEnv = process.env.NEXT_PUBLIC_DEBUG_FLAGS;

/**
 * Set of trimmed debug flag names parsed from NEXT_PUBLIC_DEBUG_FLAGS environment variable.
 * These flags take precedence over the default debug flag values.
 */
const debugFlagsSet = new Set(
  debugFlagsEnv?.split(',').map(flag => flag.trim()).filter((flag) => flag !== '') ?? []
);

// Derive boolean constants with environment override support
export const debug = debugFlagsSet.has('debug') || !IS_PRODUCTION;
export const debugWeb3 = debugFlagsSet.has('web3') || debug;
export const debugWeb3UseAuth = debugFlagsSet.has('web3UseAuth') || debugWeb3;
export const debugWeb3ContextProvider = debugFlagsSet.has('web3ContextProvider') || debugWeb3;
export const debugWeb3AdapterSilkConnector = debugFlagsSet.has('web3AdapterSilkConnector') || debugWeb3;
export const debugApi = debugFlagsSet.has('api') || debug;
export const debugLib = debugFlagsSet.has('lib') || debug;
export const debugComponentData = debugFlagsSet.has('component') || debug;
export const debugAuth = debugFlagsSet.has('auth') || debug;
export const debugHook = debugFlagsSet.has('hook') || debug;
export const debugQf = debugFlagsSet.has('qf') || (process.env.NEXT_PUBLIC_DEBUG_QF === 'true' || false);
export const debugDaimo = debugFlagsSet.has('daimo') || debug;

/**
 * Record mapping debug flag names to their boolean values.
 * Rebuilt from the derived boolean constants that respect environment overrides.
 */
const debugFlags: Record<string, boolean> = {
  debug: debug,
  web3: debugWeb3,
  web3UseAuth: debugWeb3UseAuth,
  web3ContextProvider: debugWeb3ContextProvider,
  web3AdapterSilkConnector: debugWeb3AdapterSilkConnector,
  api: debugApi,
  lib: debugLib,
  auth: debugAuth,
  hook: debugHook,
  qf: debugQf,
  component: debugComponentData,
  daimo: debugDaimo,
};

/**
 * Checks if a debug flag is enabled.
 *
 * A flag is considered enabled if:
 * 1. It's listed in NEXT_PUBLIC_DEBUG_FLAGS environment variable (comma-separated), OR
 * 2. It exists in the debugFlags record and its value is true
 *
 * @param flag - The name of the debug flag to check (e.g., 'debug', 'web3', 'api', 'daimo')
 * @returns `true` if the flag is enabled, `false` otherwise. Returns `false` if flag is undefined or empty.
 *
 * @example
 * ```ts
 * checkIsDebugFlagEnabled('debug') // true if debug is enabled
 * checkIsDebugFlagEnabled('web3') // true if web3 debug is enabled
 * checkIsDebugFlagEnabled('daimo') // true if daimo debug is enabled
 * checkIsDebugFlagEnabled('unknown') // false
 * checkIsDebugFlagEnabled() // false
 * ```
 */
export const checkIsDebugFlagEnabled = (flag?: string): boolean => {
  if (!flag) {
    return false;
  }

  return debugFlagsSet.has(flag) || (debugFlags[flag] ?? false);
};
