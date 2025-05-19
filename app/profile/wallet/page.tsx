'use client';

import { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { WalletAddressesForm } from '@/components/profile/wallet-addresses-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { PageDefaultContent } from '@/components/page/default-content';
import { PageLoading } from '@/components/page/loading';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { ProfileNotComplete } from '@/components/profile/not-complete';

export default function WalletSettingsPage() {
  const { address, authenticated, isReady } = useAuth();
  const { data: profile, isPending: isProfilePending } =
    useUserProfile(address);
  const customerId = useMemo(
    () => profile?.bridgeCustomerId ?? null,
    [profile],
  );
  if (!isReady || isProfilePending) {
    return (
      <PageLoading>
        Please wait while we fetch your wallet information.
      </PageLoading>
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
    <PageHome
      header={
        <PageHeader message="Manage your wallet addresses for receiving payments."></PageHeader>
      }
    >
      <PageDefaultContent title="Wallet Settings">
        {customerId ? (
          <WalletAddressesForm customerId={customerId} />
        ) : (
          <ProfileNotComplete>
            You need to complete your personal information and create a customer
            account before managing wallet addresses.
          </ProfileNotComplete>
        )}
      </PageDefaultContent>
    </PageHome>
  );
}
