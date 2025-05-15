/**
 * Types for /api/bridge
 */
export interface BridgeCustomerPostResponse {
  success: boolean;
  customerId: string;
}
export interface BridgeCustomerPostRequest {
  userAddress: string;

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
export interface BridgeCustomerGetRequest {
  userAddress: string;
}
export interface BridgeCustomerGetResponse {
  hasCustomer: boolean;
  customerId?: string;
  isKycCompleted?: boolean;
  message?: string;
}
// /api/bridge/kyc/complete
export interface BridgeKycCompletePostRequest {
  userAddress: string;
}
export interface BridgeKycCompletePostResponse {
  success: boolean;
  message: string;
}
// /api/bridge/kyc/initiate
export interface BridgeKycInitiatePostRequest {
  userAddress: string;
}
export interface BridgeKycInitiatePostResponse {
  success: boolean;
  redirectUrl: string;
}
// /api/bridge/kyc/status
export interface BridgeKycStatusGetRequest {
  userAddress: string;
}
export interface BridgeKycStatusGetResponse {
  status: 'pending' | 'completed' | 'failed';
  customerId: string;
  bridgeError?: string;
}
// /api/bridge/payment-methods/[paymentMethodId]
export interface BridgePaymentMethodGetRequest {
  paymentMethodId: string; // path
  userAddress: string;
}
// duplicate of types/payment/PaymentMethodBankDetails
export interface BridgePaymentMethodDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  accountName: string;
  provider: 'BRIDGE';
}
// duplicate of types/payment/PaymentMethod
export interface BridgePaymentMethodGetResponse {
  id: number;
  provider: string;
  externalId: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  details?: BridgePaymentMethodDetails;
}
// /api/bridge/payment-methods
export interface BridgePaymentMethodsGetRequest {
  userAddress: string;
}
export interface BridgePaymentMethodsGetResponse {
  paymentMethods: BridgePaymentMethodGetResponse[];
}

export interface BridgePaymentMethodsPostRequest {
  userAddress: string;
  type: string;
  provider: string;
  bankDetails: BridgePaymentMethodDetails;
}
export interface BridgePaymentMethodsPostResponse {
  success: boolean;
  paymentMethod: BridgePaymentMethodGetResponse;
}
export interface BridgePaymentMethodDeleteRequest {
  userAddress: string;
  paymentMethodId: number;
}
export interface BridgePaymentMethodDeleteResponse {
  success: boolean;
}

// /api/bridge/transactions
export interface BridgeTransactionsPostRequest {
  userAddress: string;
  campaignId: number;
  type: 'SELL' | 'BUY';
  customerId: string;
  currency: string;
  amount: number;
  paymentMethodId: string;
}
// /api/bridge/wallet-addresses
export interface BridgeWalletAddressesPostRequest {
  userAddress: string;
  walletAddress?: string;
}
export interface BridgeWalletAddressesPostResponse {
  success: boolean;
  message: string;
}

// /api/bridge/webhook/kyc
export interface BridgeWebhookKycPostRequest {
  'bridge-signature': string;
  event: string;
  data: {
    customer_id: string;
    status: string;
  };
}
export interface BridgeWebhookKycPostResponse {
  success: boolean;
}
