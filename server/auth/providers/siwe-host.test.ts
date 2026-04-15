import { describe, expect, it } from 'vitest';

import { resolveAuthHost } from './siwe-host';

describe('resolveAuthHost', () => {
  it('prefers the forwarded host over Vercel production host', () => {
    expect(
      resolveAuthHost({
        forwardedHost: 'app.relayfunder.com',
        requestHost: 'relay-funder.vercel.app',
        vercel: '1',
        vercelEnv: 'production',
        vercelProjectProductionUrl: 'relayfunder.com',
        vercelUrl: 'relay-funder.vercel.app',
      }),
    ).toBe('app.relayfunder.com');
  });

  it('uses the first forwarded host when proxies append multiple values', () => {
    expect(
      resolveAuthHost({
        forwardedHost: 'app.relayfunder.com, relay-funder.vercel.app',
      }),
    ).toBe('app.relayfunder.com');
  });

  it('normalizes NEXTAUTH_URL when no request host is present', () => {
    expect(
      resolveAuthHost({
        nextAuthUrl: 'https://app.relayfunder.com/api/auth',
      }),
    ).toBe('app.relayfunder.com');
  });

  it('falls back to preview deployment host on Vercel', () => {
    expect(
      resolveAuthHost({
        vercel: '1',
        vercelEnv: 'preview',
        vercelUrl: 'relay-funder-git-feature.vercel.app',
      }),
    ).toBe('relay-funder-git-feature.vercel.app');
  });

  it('derives the staging app host from the production app host', () => {
    expect(
      resolveAuthHost({
        vercel: '1',
        vercelEnv: 'preview',
        vercelGitCommitRef: 'staging',
        vercelProjectProductionUrl: 'app.relayfunder.com',
      }),
    ).toBe('staging.app.relayfunder.com');
  });
});
