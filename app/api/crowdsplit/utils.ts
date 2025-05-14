/**
 * Utility functions for interacting with the Crowdsplit API
 * Kept within the Crowdsplit API route directory for better organization
 */

/**
 * Get an access token from Crowdsplit API
 * @returns The access token
 */
export async function getCrowdsplitToken(): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.CROWDSPLIT_API_URL}/api/v1/merchant/token/grant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.CROWDSPLIT_CLIENT_ID,
          client_secret: process.env.CROWDSPLIT_CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get Crowdsplit token');
    }

    const { access_token } = await response.json();
    return access_token;
  } catch (error) {
    console.error('Crowdsplit token error:', error);
    throw new Error(
      `Failed to get Crowdsplit token: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Make an authenticated request to Crowdsplit API
 * @param endpoint The API endpoint (without the base URL)
 * @param options Fetch options
 * @returns The fetch response
 */
export async function crowdsplitRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get a fresh token for each request
  const token = await getCrowdsplitToken();
  
  // Ensure headers object exists
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  // Construct full URL
  const url = `${process.env.CROWDSPLIT_API_URL}${endpoint}`;
  
  // Make the authenticated request
  return fetch(url, {
    ...options,
    headers,
  });
} 