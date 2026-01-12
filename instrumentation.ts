import { Sentry } from '@/lib/sentry';
import { isFeatureEnabled } from '@/lib/flags/config';
import { initHumanPassport } from '@/lib/human-passport/config';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');

    if (isFeatureEnabled('HUMAN_PASSPORT')) {
      initHumanPassport(); // validate only when feature is on
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
