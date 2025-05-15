export const enableApiMock = false;

// import { v4 as uuidv4 } from 'uuid';
import { BRIDGE_API_URL } from '@/lib/constant';
/**
 * Api Mock for development
 * this is used in server and client to prevent 3rd party requests
 * usage:
 *   client: `enableApiMock = true`
 *     overwrites the browser-fetch with the mockFetch handling certain requests
 *     this is for any component that calls fetch(....) in a callback
 *   server: `enableApiMock = true` AND implement a conditional for the fetch:
 *     import {enableApiMock, mockFetch} = '@/lib/fetch';
 *     ....
 *     const response = enableApiMock?mockFetch(url,options):fetch(url:options)
 */
export async function mockFetch(
  url: string | URL | Request,
  options: RequestInit,
): Promise<Response> {
  console.log('developer mock fetch', { url, options });
  if (typeof url === 'string') {
    // Handle Crowdsplit API endpoints
    if (url === '/api/crowdsplit/customers') {
      return new Response(JSON.stringify({ data: { id: 'mock-customer-id' } }));
    }
    if (url === '/api/crowdsplit/payments') {
      return new Response(
        JSON.stringify({ data: { id: 'mock-transaction-id' } }),
      );
    }
    if (url.includes('/api/crowdsplit/payments') && url.includes('/confirm')) {
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
    if (url.startsWith('/api/bridge')) {
      if (url.startsWith('/api/bridge/kyc/status')) {
        return new Response(JSON.stringify({ status: 'completed' }));
        return new Response(JSON.stringify({ status: 'pending' }));
        return new Response(JSON.stringify({ status: 'failed' }));
        return new Response(JSON.stringify({ status: '--default--' }));
      }
      if (url.startsWith('/api/bridge/kyc/initiate')) {
        return new Response(JSON.stringify({ redirectUrl: '/' }));
      }
    }
    if (BRIDGE_API_URL && url.includes(BRIDGE_API_URL)) {
      // bridge requests
      if (url.includes('/api/v1/customers')) {
        if (url.endsWith('/api/v1/customers') && options.method === 'POST') {
          return new Response(
            JSON.stringify({ data: { id: 'mock-customer-id' } }),
          );
        }
        if (url.endsWith('payment_methods') && options.method === 'POST') {
          return new Response(
            JSON.stringify({
              id: 'mock-payment-method-id', //+ uuidv4(),
            }),
          );
        }
        if (url.includes('/payment_methods/') && options.method === 'DELETE') {
          return new Response(
            JSON.stringify({
              id: 'mock-payment-method-id', // + uuidv4(),
            }),
          );
        }
        if (url.includes('/payment_methods/') && options.method === 'GET') {
          return new Response(
            JSON.stringify({
              id: url.replace(/.*\//, ''), // return the requested id
              type: 'MOCK-BRIDGE',
              bank_details: {
                bank_name: 'MOCK-BANK-NAME',
                account_number: 'MOCK-ACCOUNT-NUMBER',
                routing_number: 'MOCK-ROUTING-NUMBER',
                account_type: 'MOCK-ACCOUNT-TYPE',
                account_name: 'MOCK-ACCOUNT-NAME',
              },
            }),
          );
        }
      }
      if (url.includes('/api/v1/kyc')) {
        if (url.endsWith('schema?provider=BRIDGE')) {
          return new Response(
            JSON.stringify({ data: { error: 'unknown-response-type' } }),
          );
        }
        if (url.endsWith('initiate?provider=BRIDGE')) {
          return new Response(JSON.stringify({ redirectUrl: '/' }));
        }
        if (url.endsWith('status?provider=BRIDGE')) {
          return new Response(JSON.stringify({ status: 'completed' }));
          return new Response(JSON.stringify({ status: 'pending' }));
          return new Response(JSON.stringify({ status: 'failed' }));
          return new Response(JSON.stringify({ status: '--default--' }));
        }
      }
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
