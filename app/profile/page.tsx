'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ProfileHeader } from '@/components/profile/profile-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserProfileForm } from '@/components/profile/user-profile-form';
import { format } from 'date-fns';
import Link from 'next/link';
import { Wallet, CreditCard, ShieldCheck, UserRound } from 'lucide-react';
import { User } from '@prisma/client';
export default function ProfilePage() {
  const { user, ready, authenticated } = usePrivy();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('isLoading', isLoading);

  useEffect(() => {
    const fetchUserData = async () => {
      if (ready && authenticated && user?.wallet?.address) {
        try {
          const response = await fetch(
            `/api/users/me?userAddress=${user.wallet.address}`,
          );
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
            console.log('Fetched userData:', data);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (ready) {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [ready, authenticated, user]);

  if (!ready) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">
            Please wait while we initialize your profile.
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
            Please connect your wallet to access your profile.
          </p>
        </div>
      </div>
    );
  }

  console.log('userData', userData);

  const lastLoginDate = userData?.updatedAt
    ? format(new Date(userData.updatedAt), 'dd/MM/yyyy, HH:mm:ss')
    : 'Never logged in';

  return (
    <div className="container mx-auto max-w-5xl justify-center px-3 py-8 md:px-6 md:py-12">
      <ProfileHeader />

      <div className="grid gap-6">
        {/* User Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <Avatar className="h-24 w-24">
                <AvatarFallback>
                  <UserRound className="h-20 w-20 rounded-full bg-green-100 p-4" />
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold">
                  {userData?.firstName || 'Anonymous User'}
                  {userData?.lastName && `${userData?.lastName}`}
                </h2>
                <p className="break-all text-sm text-muted-foreground">
                  Wallet: {user?.wallet?.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last login: {lastLoginDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Profile Form */}
        {userData && (
          <UserProfileForm
            userData={userData}
            walletAddress={user?.wallet?.address || ''}
          />
        )}

        {/* Additional Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>
              Configure your payment methods, complete KYC verification, and
              manage wallet addresses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link href="/profile/payment-methods">
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </Button>
              </Link>
              <Link href="/profile/kyc">
                <Button variant="outline" className="w-full">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  KYC Verification
                </Button>
              </Link>
              <Link href="/profile/wallet">
                <Button variant="outline" className="w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
