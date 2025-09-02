'use client';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { DonationProcessStates } from '@/types/campaign';
import { CheckCircle2, Loader2, Timer } from 'lucide-react';
import { useMemo } from 'react';

interface DonationProcessDisplayProps {
  currentState: keyof typeof DonationProcessStates | null;
  failureMessage?: string | null;
  isProcessing: boolean;
  onFailureCancel?: () => void;
  onFailureRetry?: () => void;
  onDoneView?: () => void;
}

const PROCESS_STEP_INFO: Record<
  keyof typeof DonationProcessStates,
  { title: string; description: string }
> = {
  connect: {
    title: 'Connecting Wallet',
    description:
      'We are asking your digital wallet (like MetaMask) to connect with our application. This allows us to securely interact with the blockchain on your behalf.',
  },
  switch: {
    title: 'Switching Network',
    description:
      'Your wallet is connected, but it might be on the wrong network. We are asking your wallet to switch to the correct blockchain network (e.g., Celo) for this donation.',
  },
  requestTransaction: {
    title: 'Preparing Transaction',
    description:
      'We are setting up the necessary details for your donation transaction. This involves preparing the data that will be sent to the blockchain.',
  },
  approveUsdcContract: {
    title: 'Approving USDC Spending',
    description:
      'Before we can transfer your USDC, you need to grant permission for our smart contract to spend a specific amount of USDC from your wallet. This is a standard security measure.',
  },
  waitForUsdcContractConfirmation: {
    title: 'Confirming USDC Approval',
    description:
      'We are waiting for the blockchain to confirm that your USDC spending approval has been successfully processed. This might take a moment.',
  },
  pledgeContract: {
    title: 'Executing Donation',
    description:
      'Now that the approval is confirmed, we are sending your donation to the campaign’s treasury through a smart contract. Your funds are being securely transferred.',
  },
  waitForPledgeContractConfirmation: {
    title: 'Confirming Donation',
    description:
      'We are waiting for the blockchain to confirm your donation transaction. Once confirmed, your contribution will be officially recorded.',
  },
  storageComplete: {
    title: 'Recording Donation',
    description:
      'Your donation has been successfully processed on the blockchain. We are now securely recording the details in our system.',
  },
  idle: {
    title: 'Ready to Start',
    description: 'The donation process is ready to begin.',
  },
  done: {
    title: 'Donation Complete!',
    description: 'Your donation has been successfully completed. Thank you!',
  },
  failed: {
    title: 'Donation Failed',
    description:
      'Unfortunately, your donation could not be completed. Please review the error message or try again.',
  },
};

export function DonationProcessDisplay({
  currentState,
  failureMessage,
  onFailureCancel,
  onFailureRetry,
  onDoneView,
  isProcessing,
}: DonationProcessDisplayProps) {
  // Ensure the order of steps is maintained
  const orderedStates: (keyof typeof DonationProcessStates)[] = useMemo(() => {
    return [
      'connect',
      'switch',
      'requestTransaction',
      'approveUsdcContract',
      'waitForUsdcContractConfirmation',
      'pledgeContract',
      'waitForPledgeContractConfirmation',
      'storageComplete',
      // 'idle', // Idle is not a step in the process flow
      // 'done', // Done and failed are terminal states, not steps
      // 'failed',
    ];
  }, []);

  const isFailed = currentState === 'failed';
  const isDone = currentState === 'done';
  if (isFailed) {
    return (
      <div className="mt-4 space-y-2">
        <div className="mt-4 text-center">
          <p className="mb-2 text-red-600 dark:text-red-400">
            {PROCESS_STEP_INFO.failed.title}
          </p>
          <p className="mb-2 text-red-600 dark:text-red-400">
            {PROCESS_STEP_INFO.failed.description}
          </p>
          {failureMessage && (
            <details className="mb-4 text-sm text-red-600 dark:text-red-400">
              <summary className="cursor-pointer font-semibold">
                View error details
              </summary>
              <p className="mt-2 text-wrap break-all">{failureMessage}</p>
            </details>
          )}
          <div className="flex justify-center gap-2">
            {onFailureRetry && (
              <Button onClick={onFailureRetry} variant="default">
                Retry
              </Button>
            )}
            {onFailureCancel && (
              <Button onClick={onFailureCancel} variant="destructive">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  if (isDone) {
    return (
      <div className="mt-4 space-y-2 text-center text-green-600 dark:text-green-400">
        <CheckCircle2 className="mx-auto h-12 w-12" />
        <p className="text-lg font-semibold">{PROCESS_STEP_INFO.done.title}</p>
        <p className="text-sm">{PROCESS_STEP_INFO.done.description}</p>
        <div className="flex justify-center gap-2">
          {onFailureRetry && (
            <Button onClick={onDoneView} variant="default">
              View Campaign
            </Button>
          )}
        </div>
      </div>
    );
  }
  if (!isDone && currentState !== 'idle') {
    return (
      <div className="mt-4 space-y-2">
        {orderedStates.map((stateKey) => {
          const isCurrent = currentState === stateKey;
          const isCompleted =
            orderedStates.indexOf(stateKey) <
            orderedStates.indexOf(currentState || 'idle');
          const isPending =
            orderedStates.indexOf(stateKey) >
            orderedStates.indexOf(currentState || 'idle');

          const stepInfo = PROCESS_STEP_INFO[stateKey];

          return (
            <div
              key={stateKey}
              className={cn(
                'flex flex-col rounded-md p-2',
                isCurrent && 'bg-blue-100 dark:bg-blue-900',
                isCompleted && 'text-green-600 dark:text-green-400',
                isPending && 'text-gray-400 dark:text-gray-600',
              )}
            >
              <div className="flex items-center gap-2">
                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {isCurrent && isProcessing && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
                {!isCompleted && !isCurrent && (
                  <span className="flex h-5 w-5 items-center justify-center text-gray-400 dark:text-gray-600">
                    <Timer className="h-5 w-5" />
                  </span>
                )}
                <span className="font-semibold">{stepInfo.title}</span>
              </div>
              {isCurrent && (
                <p className="ml-7 text-sm text-gray-700 dark:text-gray-300">
                  {stepInfo.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-2 text-center text-gray-500 dark:text-gray-400">
      <p>{PROCESS_STEP_INFO.idle.description}</p>
    </div>
  );
}
