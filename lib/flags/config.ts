// Feature flag configuration with environment variable support
const FLAG_CONFIG = {
  DEBUG: { envVar: 'NEXT_PUBLIC_DEBUG', default: false },
  ROUNDS_VISIBILITY: {
    envVar: 'NEXT_PUBLIC_ENABLE_ROUNDS_VISIBILITY',
    default: false,
  },
  HUMAN_PASSPORT: {
    envVar: 'NEXT_PUBLIC_ENABLE_HUMAN_PASSPORT',
    default: false,
  },
} as const;

function verifyEnvFlag(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}

// Initialize flags from environment variables or defaults
// not possible to use process.env[config.envVar], it would return undefined for all flags
export const FLAGS = {
  DEBUG: verifyEnvFlag(process.env.NEXT_PUBLIC_DEBUG, false),
  ROUNDS_VISIBILITY: verifyEnvFlag(
    process.env.NEXT_PUBLIC_ENABLE_ROUNDS_VISIBILITY,
    false,
  ),
  HUMAN_PASSPORT: verifyEnvFlag(
    process.env.NEXT_PUBLIC_ENABLE_HUMAN_PASSPORT,
    false,
  ),
} as Record<keyof typeof FLAG_CONFIG, boolean>;

export type FeatureFlag = keyof typeof FLAGS;

// Direct access to flag values (for non-component code)
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FLAGS[flag];
}
