'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts';
import { KycVerificationForm } from '@/components/profile/kyc-verification-form';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { PageProfile } from '@/components/page/profile';
import { PageLoading } from '@/components/page/loading';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { ProfileNotComplete } from '@/components/profile/not-complete';

export default function KycVerificationPage() {
  const { address, authenticated, isReady } = useAuth();
  const { data: profile, isPending: isProfilePending } =
    useUserProfile(address);
  const customerId = useMemo(
    () => profile?.bridgeCustomerId ?? null,
    [profile],
  );
  const isKycCompletedDB = useMemo(
    () => profile?.isKycCompleted ?? false,
    [profile],
  );
  if (!isReady || isProfilePending) {
    return (
      <PageLoading>Please wait while we fetch your KYC status.</PageLoading>
    );
  }

  if (!authenticated) {
    return (
      <PageConnectWallet>
        Please connect your wallet to access KYC verification
      </PageConnectWallet>
    );
  }

  return (
    <PageProfile
      withBackButton={true}
      title="KYC Verification"
      message="Complete the KYC verification process to unlock additional features."
    >
      {customerId ? (
        <KycVerificationForm isCompleted={isKycCompletedDB} />
      ) : (
        <ProfileNotComplete>
          You need to complete your personal information and create a customer
          account before starting KYC verification.
        </ProfileNotComplete>
      )}
    </PageProfile>
  );
}
