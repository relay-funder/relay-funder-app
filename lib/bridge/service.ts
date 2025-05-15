// Create a service to interact with Bridge API endpoints
// import { headers } from 'next/headers';
import {
  BRIDGE_API_URL,
  BRIDGE_API_KEY,
  BRIDGE_WEBHOOK_SECRET,
} from '@/lib/constant';
import { enableApiMock, mockFetch } from '@/lib/fetch';
import {
  BridgeAssociateWalletInterface,
  BridgeAssociateWalletResponse,
  BridgeCreateCustomerInterface,
  BridgeCreateCustomerRequest,
  BridgeCreateCustomerResponse,
  BridgeInitiateKycResponse,
  BridgeKycStatusResponse,
  BridgePaymentMethodCreateInterface,
  BridgePaymentMethodCreateResponse,
  BridgePaymentMethodCreateResponseInterface,
  BridgePaymentMethodGetInterface,
  BridgePaymentMethodGetResponse,
  BridgeTransactionBuyInterface,
  BridgeTransactionResponse,
  BridgeTransactionSellInterface,
} from './types';
import crypto from 'crypto';

if (!BRIDGE_API_URL) {
  throw new Error('BRIDGE_API_URL is not defined in environment variables');
}

if (!BRIDGE_API_KEY) {
  throw new Error('BRIDGE_API_KEY is not defined in environment variables');
}

// types for payment method operations

export class BridgeService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    // Clean the API key by trimming whitespace and removing quotes
    this.apiKey = apiKey.trim().replace(/['"]/g, '');

    console.log('Initialized Bridge service with API URL:', apiUrl);
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;

    // Check if API key exists
    if (!this.apiKey) {
      console.error('Bridge API key is missing');
      throw new Error('API key is required for Bridge API calls');
    }

    // Clean the API key
    const cleanApiKey = this.apiKey.trim();

    const headers = {
      'Content-Type': 'application/json',
      // Try without Bearer prefix
      Authorization: cleanApiKey,
    };
    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = enableApiMock
        ? await mockFetch(url, options)
        : await fetch(url, options);

      // For debugging purposes
      const responseText = await response.text();

      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = { rawResponse: responseText };
      }

      // Log specific error for 401 unauthorized
      if (response.status === 401) {
        console.error('Bridge API authorization failed:', responseData);
        throw new Error(
          `Bridge API authorization failed: ${responseText || 'No error details provided'}`,
        );
      }

      if (!response.ok) {
        console.error(`Bridge API error (${response.status}):`, responseData);
        throw new Error(
          responseData.message ||
            responseData.error ||
            `Bridge API error: ${response.status} ${response.statusText}`,
        );
      }

      return responseData;
    } catch (error) {
      console.error(`Error in Bridge API call to ${url}:`, error);
      throw error;
    }
  }
  private async requestWithBearer<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;

    // Check if API key exists
    if (!this.apiKey) {
      console.error('Bridge API key is missing');
      throw new Error('API key is required for Bridge API calls');
    }

    // Clean the API key
    const cleanApiKey = this.apiKey.trim();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanApiKey}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = enableApiMock
        ? await mockFetch(url, options)
        : await fetch(url, options);

      // For debugging purposes
      const responseText = await response.text();

      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = { rawResponse: responseText };
      }

      // Log specific error for 401 unauthorized
      if (response.status === 401) {
        console.error('Bridge API authorization failed:', responseData);
        throw new Error(
          `Bridge API authorization failed: ${responseText || 'No error details provided'}`,
        );
      }

      if (!response.ok) {
        console.error(`Bridge API error (${response.status}):`, responseData);
        throw new Error(
          responseData.message ||
            responseData.error ||
            `Bridge API error: ${response.status} ${response.statusText}`,
        );
      }

      return responseData;
    } catch (error) {
      console.error(`Error in Bridge API call to ${url}:`, error);
      throw error;
    }
  }

  async createCustomer(customerData: BridgeCreateCustomerInterface) {
    const payload = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      document_type: customerData.documentType,
      document_number: customerData.documentNumber,
      dob: customerData.dob,
      street_number: customerData.streetNumber,
      street_name: customerData.streetName,
      neighborhood: customerData.neighborhood,
      city: customerData.city,
      state: customerData.state,
      address_country_id: customerData.addressCountryId,
      postal_code: customerData.postalCode,
      phone_country_code: customerData.phoneCountryCode,
      phone_area_code: customerData.phoneAreaCode,
      phone_number: customerData.phoneNumber,
    } as BridgeCreateCustomerRequest;
    return this.request<BridgeCreateCustomerResponse>(
      '/api/v1/customers',
      'POST',
      payload,
    );
  }

  async getKycSchema() {
    return this.request('/api/v1/kyc/schema?provider=BRIDGE');
  }

  async initiateKyc(customerId: string) {
    return this.request<BridgeInitiateKycResponse>(
      `/api/v1/kyc/${customerId}/initiate?provider=BRIDGE`,
    );
  }

  async getKycStatus(customerId: string) {
    return this.request<BridgeKycStatusResponse>(
      `/api/v1/kyc/${customerId}/status?provider=BRIDGE`,
    );
  }

  async createPaymentMethod(data: BridgePaymentMethodCreateInterface) {
    // The payload should match exactly the expected format
    const payload = {
      type: data.type,
      bank_details: {
        bank_name: data.bankDetails.bankName,
        account_number: data.bankDetails.accountNumber,
        routing_number: data.bankDetails.routingNumber,
        account_type: data.bankDetails.accountType,
        account_name: data.bankDetails.accountName,
      },
    };

    // The correct endpoint format according to Bridge API docs
    return this.request<BridgePaymentMethodCreateResponse>(
      `/api/v1/customers/${data.customerId}/payment_methods`,
      'POST',
      payload,
    );
  }
  async getPaymentMethod(data: BridgePaymentMethodGetInterface) {
    const result = await this.request<BridgePaymentMethodGetResponse>(
      `/api/v1/customers/${data.customerId}/payment_methods/${data.id}`,
    );
    return {
      id: result.id,
      type: result.type,
      bankDetails: {
        bankName: result.bank_details.bank_name ?? '',
        accountNumber: result.bank_details.account_number ?? '',
        routingNumber: result.bank_details.routing_number ?? '',
        accountType: result.bank_details.account_type ?? '',
        accountName: result.bank_details.account_name ?? '',
      },
    } as BridgePaymentMethodCreateResponseInterface;
  }

  async deletePaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<void> {
    return this.request<void>(
      `/api/v1/customers/${customerId}/payment_methods/${paymentMethodId}`,
      'DELETE',
    );
  }

  async buyTransaction(data: BridgeTransactionBuyInterface) {
    // Map our params to Bridge API expected format
    const payload = {
      customer_id: data.customerId,
      currency: data.fiatCurrency,
      crypto_currency: data.cryptoCurrency,
      amount: data.fiatAmount,
      payment_method_id: data.paymentMethodId,
      wallet_address: data.walletAddress,
      provider: 'BRIDGE',
    };

    return this.request<BridgeTransactionResponse>(
      '/api/v1/wallets/trades/buy',
      'POST',
      payload,
    );
  }

  async sellTransaction(
    data: BridgeTransactionSellInterface,
  ): Promise<BridgeTransactionResponse> {
    // Create a properly formatted payload for the Bridge API
    const payload = {
      customer_id: data.customerId,
      currency: data.fiatCurrency,
      crypto_currency: data.cryptoCurrency,
      amount: data.cryptoAmount,
      wallet_address: data.walletAddress,
      provider: 'BRIDGE',
    };

    return this.request<BridgeTransactionResponse>(
      '/api/v1/wallets/trades/sell',
      'POST',
      payload,
    );
  }

  async associatWallet(data: BridgeAssociateWalletInterface) {
    // Map our params to Bridge API expected format
    const payload = {
      wallet_address: data.walletAddress,
      wallet_type: data.walletType,
    };

    return this.requestWithBearer<BridgeAssociateWalletResponse>(
      `/api/v1/customers/${data.customerId}/wallets`,
      'POST',
      payload,
    );
  }
  // Verify the Bridge webhook signature
  verifySignature(signature: string | null, payload: string): boolean {
    if (process.env.NODE_ENV === 'development') {
      console.log('development: skipping signature verification');
      return true;
    }
    if (!BRIDGE_WEBHOOK_SECRET) {
      console.warn(
        'Missing BRIDGE_WEBHOOK_SECRET environment, unable to verify signatures',
      );
      return false;
    }
    if (!signature) {
      return false;
    }

    const hmac = crypto.createHmac('sha256', BRIDGE_WEBHOOK_SECRET);
    const expectedSignature = hmac.update(payload).digest('hex');

    // Convert Buffers to Uint8Array objects for timingSafeEqual
    return crypto.timingSafeEqual(
      new Uint8Array(Buffer.from(signature)),
      new Uint8Array(Buffer.from(expectedSignature)),
    );
  }
}

export const bridgeService = new BridgeService(BRIDGE_API_URL, BRIDGE_API_KEY);
