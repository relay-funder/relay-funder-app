import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/lib/web3';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AuthenticatedProps {
  message: string;
}

export default function Authenticated({ message }: AuthenticatedProps) {
  const { logout } = useWeb3Auth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    logout().then(() => {
      router.push('/');
    });
  }, [logout, router]);
  const handleProfile = useCallback(async () => {
    router.push('/settings');
  }, [router]);

  return (
    <div className="from-orange-light flex min-h-screen items-center justify-center bg-gradient-to-br to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-6 pt-10 text-center">
          <div className="mb-4 flex justify-center"></div>
          <CardTitle className="text-charcoal text-2xl font-semibold">
            Authenticated
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleProfile}>
            Profile
          </Button>
          <Button className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
