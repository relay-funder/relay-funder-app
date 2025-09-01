export interface DisplayUser {
  name: string | null;
  address: string | null;
}
export interface DisplayUserWithStates extends DisplayUser {
  isKycCompleted: boolean;
  isVouched?: boolean;
}
