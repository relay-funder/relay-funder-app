import { z } from 'zod';

export const HumanPassportEnvSchema = z.object({
  PASSPORT_API_KEY: z
    .string({ required_error: 'PASSPORT_API_KEY is required' })
    .min(1),
  PASSPORT_SCORER_ID: z
    .string({ required_error: 'PASSPORT_SCORER_ID is required' })
    .min(1),
});

export function initHumanPassport() {
  // Validate directly from process.env at boot
  const parsed = HumanPassportEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => i.message).join(', ');
    throw new Error(`[Passport] Invalid environment: ${details}`);
  }
}
