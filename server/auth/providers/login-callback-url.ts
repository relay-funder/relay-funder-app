const BLOCKED_CALLBACK_DOMAIN_PATTERNS =
  process.env.NEXT_PUBLIC_BLOCK_EXTERNAL_CALLBACK_DOMAINS?.split(',').map((p) =>
    p.trim(),
  ) || [];

function isBlockedDomainMatch(domain: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (!pattern) {
      return false;
    }

    if (pattern.includes('*')) {
      const escapedPattern = pattern
        .split('*')
        .map((chunk) => chunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*');
      const regex = new RegExp(`^${escapedPattern}$`);
      return regex.test(domain);
    }

    return domain === pattern || domain.endsWith(`.${pattern}`);
  });
}

export function loginCallbackUrl() {
  if (
    typeof window === 'undefined' ||
    typeof window.location?.href !== 'string'
  ) {
    console.log(
      'auth/callback-url: no window, no window.location.href',
      window?.location?.href,
    );
    return '/dashboard';
  }
  let paramCallbackUrl = '/dashboard';
  try {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (!params.get('callbackUrl') && !url.pathname.includes('/login')) {
      // connect already happened, but there is no session
      // just refresh the page with the session.
      return window.location.href;
    }
    paramCallbackUrl = params.get('callbackUrl') ?? '/dashboard';
    if (paramCallbackUrl.startsWith('/') && !paramCallbackUrl.startsWith('//')) {
      return paramCallbackUrl;
    }
  } catch {
    return '/dashboard';
  }
  // Prevent cross-domain callbacks on deployment domains
  // Check if current domain matches patterns where external callbacks should be blocked
  try {
    const callbackDomain = new URL(paramCallbackUrl).hostname;
    const currentDomain = window.location.hostname;

    if (currentDomain !== callbackDomain) {
      const shouldBlock = isBlockedDomainMatch(
        currentDomain,
        BLOCKED_CALLBACK_DOMAIN_PATTERNS,
      );

      if (shouldBlock) {
        console.warn(
          `Cross-domain callback prevented: ${currentDomain} → ${callbackDomain} (matched pattern)`,
        );
        return '/dashboard';
      }
    }
  } catch (error) {
    // Invalid URL, use dashboard
    console.error('invalid url', error);
    return '/dashboard';
  }

  return paramCallbackUrl;
}
