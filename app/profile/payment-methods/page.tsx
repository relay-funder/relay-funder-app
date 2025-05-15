'use client';

import { useMemo } from 'react';
import { PaymentMethodsForm } from '@/components/profile/payment-methods-form';
import { PageProfile } from '@/components/page/profile';
import { PageLoading } from '@/components/page/loading';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { ProfileNotComplete } from '@/components/profile/not-complete';

import { useAuth } from '@/contexts';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { useBridgePaymentMethods } from '@/lib/bridge/hooks/useBridge';

export default function PaymentMethodsPage() {
  const { isReady, address, authenticated } = useAuth();
  const { data: profile, isPending: isProfilePending } =
    useUserProfile(address);
  const customerId = useMemo(
    () => profile?.bridgeCustomerId ?? null,
    [profile],
  );
  const { data: paymentMethods, isPending: isPaymentMethodsPending } =
    useBridgePaymentMethods({ userAddress: address ?? '' });

  if (!isReady || isProfilePending || isPaymentMethodsPending) {
    return (
      <PageLoading>
        Please wait while we fetch your payment methods.
      </PageLoading>
    );
  }

  if (!authenticated) {
    return (
      <PageConnectWallet>
        Please connect your wallet to access your payment methods.
      </PageConnectWallet>
    );
  }

  return (
    <PageProfile
      withBackButton={true}
      title="Payment Methods"
      message="Manage your payment methods for donations and purchases."
    >
      {customerId ? (
        <PaymentMethodsForm paymentMethods={paymentMethods ?? []} />
      ) : (
        <ProfileNotComplete>
          You need to complete your personal information and create a customer
          account before adding payment methods.
        </ProfileNotComplete>
      )}
    </PageProfile>
  );
}
