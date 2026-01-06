'use client';
import { Button } from '@/components/ui';
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNetworkCheck } from '@/hooks/use-network';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useWeb3Auth, chainConfig } from '@/lib/web3';

export function PaymentSwitchWalletNetwork() {
  const { toast } = useToast();
  const { isCorrectNetwork, switchNetwork } = useNetworkCheck();
  const { ready } = useWeb3Auth();

  const handleNetworkSwitch = useCallback(async () => {
    try {
      await switchNetwork();
    } catch (error) {
      console.error('Error switching network:', error);
      toast({
        title: 'Network Switch Failed',
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-medium">
              Unable to switch network automatically. Please switch to{' '}
              {chainConfig.name} manually in your wallet.
            </p>
          </div>
        ),
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [switchNetwork, toast]);
  if (!ready) {
    return (
      <Button variant="secondary" size="sm" disabled={true} className="w-full">
        <Loader2 /> Connecting to Wallet
      </Button>
    );
  }
  if (isCorrectNetwork) {
    return null;
  }
  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleNetworkSwitch}
      className="w-full"
    >
      Switch Network
    </Button>
  );
}
