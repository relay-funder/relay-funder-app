export interface Profile {
  address: string;
  recipientWallet: string;
  bridgeCustomerId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isKycCompleted: boolean;
  username: string;
  bio: string;
}
