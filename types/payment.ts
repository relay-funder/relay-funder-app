export interface PaymentMethodBankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  accountName: string;
  provider: 'BRIDGE';
}
export interface PaymentMethod {
  id: number;
  type: string;
  provider: string;
  externalId: string;
  details?: PaymentMethodBankDetails;
}
