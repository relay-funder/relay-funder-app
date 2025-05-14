'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { KycVerificationForm } from '@/components/profile/kyc-verification-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function KycVerificationPage() {
  const { user, ready, authenticated } = usePrivy();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isKycCompleted, setIsKycCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customer data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!ready || !authenticated || !user?.wallet?.address) return;

      try {
        setIsLoading(true);
        // Get all user data in a single request
        const userResponse = await fetch(
          `/api/users/me?userAddress=${user.wallet.address}`,
        );
        const userData = await userResponse.json();

        if (userData.bridgeCustomerId) {
          setCustomerId(userData.bridgeCustomerId);
          setIsKycCompleted(userData.isKycCompleted === true);

          // Only check KYC status from Bridge if it's not already completed locally
          if (!userData.isKycCompleted) {
            try {
              const kycResponse = await fetch(
                `/api/bridge/kyc/status?customerId=${userData.bridgeCustomerId}`,
              );
              const kycData = await kycResponse.json();

              setIsKycCompleted(kycData.status === 'completed');
            } catch (kycError) {
              console.error('Error checking KYC status:', kycError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [ready, authenticated, user]);

  if (!ready || isLoading) {
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
            isCompleted={isKycCompleted}
            onSuccess={() => {
              // Refresh the customer data
              // fetchCustomerData()
              setIsKycCompleted(true);
              setIsLoading(false);
            }}
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
