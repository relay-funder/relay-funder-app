'use client';

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useWeb3Auth,
  useWeb3Context,
  useConnect,
  useAccount,
} from '@/lib/web3';
import { useSignInToBackend } from '@/lib/web3/hooks/use-signin-to-backend';

import { ConnectorAlreadyConnectedError, type Connector } from 'wagmi';
import { useAuth } from '@/contexts';

export default function Login() {
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const loginEffectRef = useRef(false);

  const signInToBackend = useSignInToBackend();

  const {
    login,
    logout,
    authenticating,
    ready,
    error: web3error,
  } = useWeb3Auth();
  const { authenticated } = useAuth();
  const { initialized } = useWeb3Context();

  const { connect, connectors } = useConnect();
  const account = useAccount();

  const router = useRouter();
  const handleLogout = useCallback(async () => {
    logout()
      .catch((error: Error) => {
        console.error(error);
        setError(error.message);
      })
      .then(() => {
        router.push('/');
      });
  }, [logout, router]);
  const handleProfile = useCallback(async () => {
    router.push('/settings');
  }, [router]);
  const signinAfterConnect = useCallback(async () => {
    try {
      const callbackUrl = await signInToBackend();
      router.push(callbackUrl);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setShowFallback(true);
      setIsLoading(false);
    }
  }, [router, signInToBackend]);
  useEffect(() => {
    // synchronize the connect(connector) and the actual connected state
    if (connectSuccess && account?.status === 'connected') {
      signinAfterConnect().catch(console.warn);
      setConnectSuccess(false);
    }
  }, [connectSuccess, account?.status, signinAfterConnect]);

  const handleFallbackLogin = useCallback(
    async (connector: Connector) => {
      setError('');
      setIsLoading(true);

      setShowFallback(false);
      connect(
        { connector },
        {
          onSuccess: () => setConnectSuccess(true), // --> effect -> signinAfterConnect -> signinToBackend
          onError: (error) => {
            if (error instanceof ConnectorAlreadyConnectedError) {
              setConnectSuccess(true); // --> effect -> signinAfterConnect -> signinToBackend
              return;
            }
            console.error('Login failed:', error);
            setError('Login failed. Please try again.');
            setIsLoading(false);
            setShowFallback(true);
          },
        },
      );
    },
    [connect],
  );
  const message = useMemo(() => {
    if (!ready) {
      return 'Connecting Wallet';
    }
    if (authenticating) {
      return 'Login in Progress (authenticating)';
    }
    if (authenticated) {
      return 'Authenticated';
    }
    if (isLoading) {
      // effect-triggered login, only when not already authenticated
      return 'Login in Progress (isLoading)';
    }
    if (error) {
      return 'Error';
    }
  }, [ready, authenticating, authenticated, isLoading, error]);
  useEffect(() => {
    if (loginEffectRef.current || authenticated || !initialized) {
      return;
    }
    // ensure the login is only triggered once
    loginEffectRef.current = true;
    // auto-load the silk-wallet-dialog
    login().catch((error: Error) => {
      setError(error.message);
      console.error(
        'app/login/page: automatic login failed, displaying fallback',
        error,
      );
      setShowFallback(true);
      setIsLoading(false);
    });
  }, [login, authenticated, ready, initialized]);
  useEffect(() => {
    if (web3error && isLoading) {
      setIsLoading(false);
      setShowFallback(true);
      setError(web3error.message);
    }
  }, [web3error, isLoading]);
  if (authenticated) {
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
  return (
    <div className="from-orange-light flex min-h-screen items-center justify-center bg-gradient-to-br to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-6 pt-10 text-center">
          <div className="mb-4 flex justify-center"></div>
          <CardTitle className="text-charcoal text-2xl font-semibold">
            Login
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {showFallback && (
            <>
              <p>Choose from available Wallet Login Methods</p>
              {connectors.map((connector, index) => {
                return (
                  <Button
                    key={index}
                    className="w-full"
                    onClick={() => handleFallbackLogin(connector)}
                  >
                    {connector.name === 'Injected'
                      ? 'Browser Wallet'
                      : connector.name}
                  </Button>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
