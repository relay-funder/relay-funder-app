// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { Sentry } from '@/lib/sentry';

if (process.env.SENTRY_DSN) {
  const environment =
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    debug: environment !== 'production',
    environment: environment,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
