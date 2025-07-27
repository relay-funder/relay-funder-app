import React, { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Connector } from 'wagmi';
import {
  useConnect,
  useDisconnect,
  useAccount,
  ConnectorAlreadyConnectedError,
} from '@/lib/web3';
import { useRouter } from 'next/navigation';
import { useSignInToBackend } from '@/lib/web3/hooks/use-signin-to-backend';

const connectorDescriptions: Record<
  string,
  { label: string; primary?: boolean }
> = {
  injected: { label: 'Browser Wallet', primary: true },
  silk: { label: 'Human Wallet' },
};
export function LoginFallback({
  onLoading,
  onRestartAutoLogin,
  onError,
  show,
}: {
  onLoading: () => void;
  onRestartAutoLogin: () => void;
  onError: (message?: string) => void;
  show: boolean;
}) {
  const [connectSuccess, setConnectSuccess] = useState(false);
  const { connect, connectors } = useConnect();
  const { disconnectAsync: wagmiDisconnect } = useDisconnect();

  const router = useRouter();
  const account = useAccount();
  const signInToBackend = useSignInToBackend();

  const signinAfterConnect = useCallback(async () => {
    try {
      const callbackUrl = await signInToBackend();
      router.push(callbackUrl);
    } catch (error: unknown) {
      console.error('Login failed:', error);
      if (error instanceof Error) {
        onError(`Login failed. ${error?.message}`);
      } else {
        onError(`Login failed. ${error}`);
      }
      wagmiDisconnect();
    }
  }, [router, signInToBackend, wagmiDisconnect, onError]);
  useEffect(() => {
    // synchronize the connect(connector) and the actual connected state
    if (connectSuccess && account?.status === 'connected') {
      signinAfterConnect().catch(console.warn);
      setConnectSuccess(false);
    }
  }, [connectSuccess, account?.status, signinAfterConnect]);

  const handleFallbackLogin = useCallback(
    async (connector: Connector) => {
      if (connector.id === 'silk') {
        // this resets the parent component state, restarting from scratch
        return onRestartAutoLogin();
      }
      // all other connectors need to reset the parent component state
      onLoading();
      connect(
        { connector },
        {
          // --> effect -> signinAfterConnect -> signinToBackend
          onSuccess: () => setConnectSuccess(true),
          onError: (error) => {
            if (error instanceof ConnectorAlreadyConnectedError) {
              // --> effect -> signinAfterConnect -> signinToBackend
              setConnectSuccess(true);
              return;
            }
            onError(error.message);
          },
        },
      );
    },
    [connect, onLoading, onError, onRestartAutoLogin],
  );
  if (!show) {
    return;
  }
  return (
    <>
      <p className="flex justify-center">
        Choose from available Wallet Login Methods
      </p>
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => {
          const label =
            connectorDescriptions?.[connector.id]?.label ?? connector.name;
          const primary =
            connectorDescriptions?.[connector.id]?.primary ?? false;
          return (
            <Button
              key={connector.id}
              className="w-full"
              variant={primary ? 'secondary' : 'outline'}
              onClick={() => handleFallbackLogin(connector)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </>
  );
}
