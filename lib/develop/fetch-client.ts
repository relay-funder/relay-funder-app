/**
 * Api Mock for development
 * this is used in client to prevent 3rd party requests
 * usage:
 *   client: `enableApiMock = true`
 *     overwrites the browser-fetch with the mockFetch handling certain requests
 *     this is for any component that calls fetch(....) in a callback
 */
import { enableApiMock } from './index';

export async function mockFetch(
  url: string | URL | Request,
  options: RequestInit,
): Promise<Response> {
  console.log('developer mock fetch', { url, options });
  if (typeof url === 'string') {
  }
  if (
    typeof window !== 'undefined' &&
    // @ts-expect-error: local developer hack to mock fetches
    typeof window.original_fetch === 'function'
  ) {
    // @ts-expect-error: local developer hack to mock fetches
    return window.original_fetch(url, options);
  }
  return fetch(url, options);
}
// react/client fetch overwrite
if (typeof window !== 'undefined' && enableApiMock) {
  // @ts-expect-error: local developer hack to mock fetches
  window.original_fetch = fetch;
  // @ts-expect-error: local developer hack to mock fetches
  window.fetch = mockFetch;
}
