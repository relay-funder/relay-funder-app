// ABOUTME: Alert components for displaying verification success and error states.
// ABOUTME: Shows success message with score or error messages from verification attempts.

'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui';
import { type PassportScoreData } from './types';

interface VerificationSuccessAlertProps {
  verificationData: PassportScoreData;
}

export function VerificationSuccessAlert({
  verificationData,
}: VerificationSuccessAlertProps) {
  return (
    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800 dark:text-green-200">
        Successfully verified! Your Passport score is{' '}
        <strong>
          {Number(verificationData.passportScore || 0).toFixed(2)}
        </strong>
        {verificationData.passingScore && ' (Passing)'}
      </AlertDescription>
    </Alert>
  );
}

interface VerificationErrorAlertProps {
  errorMessage: string;
}

export function VerificationErrorAlert({
  errorMessage,
}: VerificationErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}
