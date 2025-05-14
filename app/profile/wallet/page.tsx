'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { WalletAddressesForm } from '@/components/profile/wallet-addresses-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function WalletSettingsPage() {
  const { user, ready, authenticated } = usePrivy();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customer data on component mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!ready || !authenticated || !user?.wallet?.address) return;

      try {
        // Check if user has a Bridge customer account
        const response = await fetch(
          `/api/bridge/customer?userAddress=${user.wallet.address}`,
        );
        const data = await response.json();

        if (data.hasCustomer) {
          setCustomerId(data.customerId);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [ready, authenticated, user]);

  if (!ready || isLoading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch your wallet information.
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
            Please connect your wallet to access wallet settings.
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
          <h1 className="text-3xl font-bold tracking-tight">Wallet Settings</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage your wallet addresses for receiving payments.
          </p>
        </div>

        {customerId ? (
          <WalletAddressesForm customerId={customerId} onSuccess={() => {}} />
        ) : (
          <Card className="p-6">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold">
                Complete Your Profile First
              </h2>
              <p className="mb-4 text-muted-foreground">
                You need to complete your personal information and create a
                customer account before managing wallet addresses.
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
