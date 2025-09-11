// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { Sentry } from '@/lib/sentry';

if (process.env.SENTRY_DSN) {
  const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    debug: environment !== 'production',
    environment: environment,
  });
}
