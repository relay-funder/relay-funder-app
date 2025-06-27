// this is the default/production sentry object
// it adds about 2k modules in next dev build and hurts
// the developer experience.
import * as Sentry from '@sentry/nextjs';

export { Sentry };
