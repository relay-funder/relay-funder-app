'use client';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { UpdateProcessStates } from '@/types/campaign';
import { CheckCircle2, Loader2, Timer } from 'lucide-react';
import { useMemo } from 'react';

interface CampaignEditProcessDisplayProps {
  currentState: keyof typeof UpdateProcessStates;
  failureMessage?: string | null;
  onFailureCancel?: () => void;
  onFailureRetry?: () => void;
}

const PROCESS_STEP_INFO: Record<
  keyof typeof UpdateProcessStates,
  { title: string; description: string }
> = {
  setup: {
    title: 'Setup Update',
    description: 'We are setting up the data that updates the campaign.',
  },
  updateDbCampaign: {
    title: 'Storing the Campaign',
    description: 'Now we are storing the state in our database.',
  },
  idle: {
    title: 'Ready to Start',
    description: 'The campaign update process is ready to begin.',
  },
  done: {
    title: 'Update Complete!',
    description:
      'Your campaign has been successfully update. Now a akashic admin will manually approve the campaign.',
  },
  failed: {
    title: 'Update Failed',
    description:
      'Unfortunately, your campaign could not be updated. Please review the error message or try again.',
  },
};

export function CampaignEditProcessDisplay({
  currentState,
  failureMessage,
  onFailureCancel,
  onFailureRetry,
}: CampaignEditProcessDisplayProps) {
  // Ensure the order of steps is maintained
  const orderedStates: (keyof typeof UpdateProcessStates)[] = useMemo(() => {
    return [
      'setup',
      'updateDbCampaign',
      // 'idle', // Idle is not a step in the process flow
      // 'done', // Done and failed are terminal states, not steps
      // 'failed',
    ];
  }, []);

  const isFailed = currentState === 'failed';
  const isDone = currentState === 'done';
  const isProcessing = !['idle', 'failed', 'done'].includes(currentState);
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
