// Create a service to interact with Bridge API endpoints
import { BRIDGE_API_URL, BRIDGE_API_KEY } from '@/lib/constant';

export class BridgeService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = BRIDGE_API_URL;
    this.apiKey = BRIDGE_API_KEY;
  }

  async createCustomer(customerData: any) {
    return this.post('/api/v1/customers', customerData);
  }

  async getKycSchema() {
    return this.get('/api/v1/kyc/schema?provider=BRIDGE');
  }

  async initiateKyc(customerId: string) {
    return this.get(`/api/v1/kyc/${customerId}/initiate?provider=BRIDGE`);
  }

  async addPaymentMethod(customerId: string, paymentMethodData: any) {
    return this.post(`/api/v1/customers/${customerId}/payment_methods`, paymentMethodData);
  }

  async buyTransaction(data: any) {
    return this.post('/api/v1/wallets/trades/buy', data);
  }

  async sellTransaction(data: any) {
    return this.post('/api/v1/wallets/trades/sell', data);
  }

  private async get(endpoint: string) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Bridge API request failed');
    }

    return response.json();
  }

  private async post(endpoint: string, data: any) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Bridge API request failed');
    }

    return response.json();
  }
}

export const bridgeService = new BridgeService(); 