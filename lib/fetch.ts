export const enableApiMock = false;

async function mockFetch(
  url: string | URL | Request,
  options: RequestInit,
): Promise<Response> {
  if (typeof window === 'undefined') {
    return new Response();
  }
  console.log('developer mock fetch', { url });
  if (typeof url === 'string') {
    if (url === '/api/auth/token') {
      return new Response(JSON.stringify({ access_token: 'mock-token' }));
    }
    if (url.includes('/api/v1/customers')) {
      return new Response(JSON.stringify({ data: { id: 'mock-id' } }));
    }
    if (url.endsWith('/api/v1/payments')) {
      return new Response(
        JSON.stringify({ data: { id: 'mock-transaction-id' } }),
      );
    }
    if (url.includes('/api/v1/payments') && url.endsWith('confirm')) {
      return new Response(
        JSON.stringify({
          data: {
            metadata: {
              public_key: 'mock-public-key',
              client_secret: 'mock_secret_mocksecret',
            },
          },
        }),
      );
    }
  }
  // @ts-expect-error: local developer hack to mock fetches
  return window.original_fetch(url, options);
}
if (typeof window !== 'undefined' && enableApiMock) {
  // @ts-expect-error: local developer hack to mock fetches
  window.original_fetch = fetch;
  // @ts-expect-error: local developer hack to mock fetches
  window.fetch = mockFetch;
}
