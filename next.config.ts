import type { NextConfig } from 'next';
import { NEXT_PUBLIC_PINATA_GATEWAY_URL } from './lib/constant';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: 'staging.relayfunder.com',
      },
      {
        protocol: 'https',
        hostname: 'asset.captureapp.xyz',
      },
      { protocol: 'https', hostname: NEXT_PUBLIC_PINATA_GATEWAY_URL },
    ],
  },
  // Turbopack uses serverExternalPackages instead of webpack externals
  serverExternalPackages: ['pino-pretty', 'lokijs', 'encoding'],
  // Turbopack configuration
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  // Keep webpack config for production builds (non-turbo)
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

const sentryEnvironments = ['production', 'staging'];
const currentEnv =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;
const shouldInitSentry =
  process.env.SENTRY === 'true' ||
  sentryEnvironments.includes(currentEnv as string);

if (shouldInitSentry) {
  console.log(' ▲ sentry initialization');
  // this import decreases the developer experience in next dev
  // for that reason it is executed conditionally.
  // also be aware of the docker-compose bind-mount of
  // lib/sentry-dev.ts -> lib/sentry.ts which you need to
  // disable if you want to test/debug sentry in dev-mode
  // eslint-disable-next-line
  const { withSentryConfig } = require('@sentry/nextjs');

  const sentryConfig = withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: 'relayfunder-yj',
    project: 'relayfunder-app',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  });

  console.log(' ▲ sentry loading');
  module.exports = {
    ...sentryConfig,
    serverExternalPackages: [
      ...nextConfig.serverExternalPackages,
      '@sentry/profiling-node',
    ],
  };
} else {
  console.log(' ▲ sentry mocked');
  module.exports = nextConfig;
}
