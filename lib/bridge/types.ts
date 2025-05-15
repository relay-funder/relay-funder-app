import { BridgePaymentMethodDetails } from './api/types';

export interface BridgeCreateCustomerInterface {
  firstName: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  dob: string;
  streetNumber: string;
  streetName: string;
  neighborhood?: string;
  city: string;
  state: string;
  addressCountryId: number;
  postalCode: string;
  phoneCountryCode: string;
  phoneAreaCode: string;
  phoneNumber: string;
}
export interface BridgeCreateCustomerRequest {
  first_name: string;
  last_name: string;
  email: string;
  document_type: string;
  document_number: string;
  dob: string;
  street_number: string;
  street_name: string;
  neighborhood?: string;
  city: string;
  state: string;
  address_country_id: number;
  postal_code: string;
  phone_country_code: string;
  phone_area_code: string;
  phone_number: string;
}
export interface BridgeCreateCustomerResponse {
  id: string;
}
export interface BridgeInitiateKycResponse {
  redirect_url?: string;
  redirectUrl?: string;
}
export interface BridgeKycStatusResponse {
  status?: 'completed' | 'pending' | 'failed';
}
export interface BridgePaymentMethodGetInterface {
  customerId: string;
  id: string;
}
export interface BridgePaymentMethodGetResponse {
  id: string;
  type: string;
  bank_details: {
    bank_name: string;
    account_number: string;
    routing_number: string;
    account_type: string;
    account_name: string;
  };
}
// service api interface
export interface BridgePaymentMethodCreateInterface {
  customerId: string;
  type: string;
  bankDetails: BridgePaymentMethodDetails;
}
export interface BridgePaymentMethodCreateResponseInterface {
  id: string;
  type: string;
  bankDetails: BridgePaymentMethodDetails;
}
export interface BridgePaymentMethodCreateResponse {
  id: string;
  type: string;
  bank_details: {
    bank_name: string;
    account_number: string;
    routing_number: string;
    account_type: string;
    account_name: string;
  };
}
export interface BridgeTransactionBuyInterface {
  customerId: string;
  fiatCurrency: string;
  cryptoCurrency: string;
  fiatAmount: number;
  paymentMethodId: string;
  walletAddress: string;
}
export interface BridgeTransactionSellInterface {
  customerId: string;
  fiatCurrency: string;
  cryptoCurrency: string;
  cryptoAmount: number;
  walletAddress: string;
  [key: string]: unknown;
}
export interface BridgeTransactionResponse {
  id: string;
  status: string;
  [key: string]: unknown;
}

export interface BridgeAssociateWalletInterface {
  walletAddress: string;
  walletType: string;
  customerId: string;
}
// undocumented api
export interface BridgeAssociateWalletResponse {
  id: string;
  status: string;
  [key: string]: unknown;
}
