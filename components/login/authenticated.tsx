import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/lib/web3';
import { CheckCircle, User, LogOut } from 'lucide-react';

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
    router.push('/profile');
  }, [router]);

  return (
    <div className="flex w-full flex-col bg-background">
      <main className="container mx-auto flex h-[calc(100vh-200px)] max-w-7xl items-center justify-center px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-md rounded-lg border bg-card shadow-sm">
            <CardHeader className="pb-6 pt-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                Successfully Authenticated
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full bg-black font-semibold text-white hover:bg-gray-800"
                onClick={handleProfile}
              >
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
