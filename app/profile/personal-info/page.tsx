'use client';

import { PersonalInfoForm } from '@/components/profile/personal-info-form';
import { useAuth } from '@/contexts';
import { PageLoading } from '@/components/page/loading';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { PageProfile } from '@/components/page/profile';
import { useBridgeCustomer } from '@/lib/hooks/useBridge';
export default function PersonalInfoPage() {
  const { isReady, address, authenticated } = useAuth();
  const { data: customer, isPending } = useBridgeCustomer({ address });

  if (!isReady || isPending) {
    return (
      <PageLoading>
        Please wait while we fetch your profile information.
      </PageLoading>
    );
  }

  if (!authenticated) {
    return <PageConnectWallet />;
  }

  return (
    <PageProfile
      withBackButton={true}
      title="Personal Information"
      message="Complete your personal information to enable payments and KYC verification."
    >
      <PersonalInfoForm
        hasCustomer={customer?.hasCustomer ?? false}
        customerId={customer?.customerId ?? null}
      />
    </PageProfile>
  );
}
