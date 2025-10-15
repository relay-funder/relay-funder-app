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
    paramCallbackUrl = params.get('callbackUrl') ?? '/dashboard';
    if (paramCallbackUrl.startsWith('/')) {
      return '/dashboard';
    }
  } catch {
    return '/dashboard';
  }
  // Prevent cross-domain callbacks on deployment domains
  // Check if current domain matches patterns where external callbacks should be blocked
  try {
    const callbackDomain = new URL(paramCallbackUrl).hostname;
    const currentDomain = window.location.hostname;

    // Get domain patterns from environment variable
    const blockPatterns =
      process.env.NEXT_PUBLIC_BLOCK_EXTERNAL_CALLBACK_DOMAINS?.split(',').map(
        (p) => p.trim(),
      ) || [];

    if (currentDomain !== callbackDomain) {
      const shouldBlock = blockPatterns.some((pattern) => {
        // Support wildcards and exact matches
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(currentDomain);
        }
        return currentDomain.includes(pattern);
      });

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
