'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts';
import { KycVerificationForm } from '@/components/profile/kyc-verification-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useUserProfile } from '@/lib/hooks/useProfile';

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
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch your KYC status.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to access KYC verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-3 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <Link href="/profile">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            KYC Verification
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Complete the KYC verification process to unlock additional features.
          </p>
        </div>

        {customerId ? (
          <KycVerificationForm
            customerId={customerId}
            isCompleted={isKycCompletedDB}
          />
        ) : (
          <Card className="p-6">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold">
                Complete Your Profile First
              </h2>
              <p className="mb-4 text-muted-foreground">
                You need to complete your personal information and create a
                customer account before starting KYC verification.
              </p>
              <Link href="/profile/personal-info">
                <Button>Complete Your Profile</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
