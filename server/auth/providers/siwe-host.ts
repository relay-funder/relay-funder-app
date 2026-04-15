export interface ResolveAuthHostOptions {
  forwardedHost?: string | null;
  requestHost?: string | null;
  vercel?: string | null;
  vercelUrl?: string | null;
  vercelProjectProductionUrl?: string | null;
  vercelEnv?: string | null;
  vercelGitCommitRef?: string | null;
  nextAuthUrl?: string | null;
  nextPublicBaseUrl?: string | null;
}

function normalizeAuthHost(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value
    .split(',')
    .map((segment) => segment.trim())
    .find(Boolean);
  if (!trimmedValue) {
    return null;
  }

  try {
    const url = trimmedValue.includes('://')
      ? new URL(trimmedValue)
      : new URL(`https://${trimmedValue}`);
    return url.host.toLowerCase();
  } catch {
    return trimmedValue
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }
}

/**
 * Resolve the host that the signed SIWE message is allowed to target.
 * Prefer the current request host so production custom domains keep working
 * even when Vercel's production URL chooses a different canonical hostname.
 */
export function resolveAuthHost(
  options: ResolveAuthHostOptions = {},
): string | null {
  const requestHost =
    normalizeAuthHost(options.forwardedHost) ??
    normalizeAuthHost(options.requestHost);
  if (requestHost) {
    return requestHost;
  }

  const nextAuthHost =
    normalizeAuthHost(options.nextAuthUrl) ??
    normalizeAuthHost(options.nextPublicBaseUrl);
  if (nextAuthHost) {
    return nextAuthHost;
  }

  const vercel = options.vercel ?? process.env.VERCEL ?? '0';
  const vercelUrl = options.vercelUrl ?? process.env.VERCEL_URL ?? null;
  const vercelProjectProductionUrl =
    options.vercelProjectProductionUrl ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    null;
  const vercelEnv = options.vercelEnv ?? process.env.VERCEL_ENV ?? 'production';
  const vercelGitCommitRef =
    options.vercelGitCommitRef ?? process.env.VERCEL_GIT_COMMIT_REF ?? 'main';

  if (vercel !== '1') {
    return null;
  }

  if (vercelEnv === 'production') {
    return (
      normalizeAuthHost(vercelProjectProductionUrl) ??
      normalizeAuthHost(vercelUrl)
    );
  }

  if (vercelGitCommitRef === 'staging') {
    const stagingHost = normalizeAuthHost(vercelProjectProductionUrl);
    if (stagingHost) {
      return stagingHost.replace(/^app\./, 'staging.app.');
    }
  }

  return (
    normalizeAuthHost(vercelUrl) ??
    normalizeAuthHost(vercelProjectProductionUrl)
  );
}
