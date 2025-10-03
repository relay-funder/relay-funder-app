'use client';

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWeb3Auth, useAccount, UserRejectedRequestError } from '@/lib/web3';

import { LoginFallback } from './fallback';
import { LoginMessage, LoginState } from './login-message';
import { useSession } from 'next-auth/react';

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const loginEffectRef = useRef(false);
  const session = useSession();
  const {
    login,
    authenticating,
    connecting,
    ready,
    error: web3error,
  } = useWeb3Auth();

  const account = useAccount();

  const loginState = useMemo(() => {
    // Ensure consistent server/client rendering by defaulting to Loading state
    // until client is mounted and Web3 context is initialized
    if (!isClientMounted) {
      return LoginState.Loading;
    }

    if (error && error !== '') {
      return LoginState.Error;
    }
    if (isFallback) {
      if (
        account?.status === 'connected' &&
        session?.status === 'unauthenticated'
      ) {
        return LoginState.Authenticating;
      }
      return LoginState.Fallback;
    }
    if (!ready) {
      return LoginState.Initializing;
    }
    if (connecting) {
      return LoginState.Connecting;
    }
    if (authenticating || session.status === 'unauthenticated') {
      return LoginState.Authenticating;
    }
    if (account?.status === 'connected' && session.status === 'authenticated') {
      return LoginState.Connected;
    }
    if (isLoading) {
      // effect-triggered login, only when not already authenticated
      return LoginState.Loading;
    }
    return LoginState.Loading; // Default or catch-all
  }, [
    isClientMounted,
    ready,
    authenticating,
    connecting,
    isLoading,
    error,
    isFallback,
    account?.status,
    session?.status,
  ]);

  const onFallbackLoading = useCallback(() => {
    setError('');
    setIsLoading(true);
    setShowFallback(false);
    setIsFallback(true);
  }, []);

  const onError = useCallback((message?: string) => {
    setError(
      message ? `Login failed: ${message}` : 'Login failed. Please try again.',
    );
    setIsLoading(false);
    setShowFallback(true);
  }, []);

  const autoLogin = useCallback(() => {
    if (loginEffectRef.current) {
      return;
    }
    // ensure the login is only triggered once
    loginEffectRef.current = true;
    // ensure wagmi magic connect does not interfere with what
    // we want: the configured auth-login, not whatever was selected
    // some time ago
    const removeKeys = [];
    for (let i = 0; i < localStorage.length; ++i) {
      const key = localStorage.key(i);
      if (key === null) {
        continue;
      }
      if (localStorage.getItem(key) === 'injected') {
        removeKeys.push(key);
      }
    }
    for (const removeKey of removeKeys) {
      localStorage.removeItem(removeKey);
    }
    localStorage.removeItem('wagmi.recentConnectorId');

    setError('');
    setIsFallback(false);
    setShowFallback(false);
    setIsLoading(true);
    // auto-load the silk-wallet-dialog
    login().catch((error: Error) => {
      if (
        error instanceof UserRejectedRequestError ||
        error.toString().startsWith('UserRejectedRequestError')
      ) {
        onError('Human wallet Closed');
      } else {
        console.error(
          'app/login/page: automatic login failed, displaying fallback',
          error,
        );
        onError(error.message);
      }
    });
  }, [login, onError]);
  const onRestartAutoLogin = useCallback(() => {
    loginEffectRef.current = false;
    autoLogin();
  }, [autoLogin]);

  useEffect(() => {
    // Set client mounted state to prevent hydration mismatch
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    autoLogin();
  }, [autoLogin]);
  useEffect(() => {
    if (web3error && isLoading && !isFallback) {
      // handle when user cancels signature in metamask
      console.error('signature canceled', { web3error, isLoading });
      onError(web3error?.message);
    }
  }, [web3error, isLoading, isFallback, onError]);
  return (
    <div className="flex w-full flex-col bg-background">
      <main className="container mx-auto flex h-[calc(100vh-200px)] max-w-7xl items-center justify-center px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-md rounded-lg border bg-card shadow-sm">
            <CardHeader className="pb-6 pt-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <svg
                    className="h-8 w-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                <LoginMessage state={loginState} error={error} />
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <LoginFallback
                show={showFallback}
                onRestartAutoLogin={onRestartAutoLogin}
                onLoading={onFallbackLoading}
                onError={onError}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
