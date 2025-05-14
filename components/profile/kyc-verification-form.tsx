'use client';
import { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  useBridgeKYCInitiate,
  useBridgeKYCStatus,
} from '@/lib/hooks/useBridge';
import { ProfileKYCVerificationStateComplete } from './kyc-verification-state-complete';
import { ProfileKYCVerificationStatePending } from './kyc-verification-state-pending';
import { ProfileKYCVerificationStateFailed } from './kyc-verification-state-failed';
import { ProfileKYCVerificationStateDefault } from './kyc-verification-state-default';

interface KycVerificationFormProps {
  customerId: string;
  isCompleted: boolean;
}

export function KycVerificationForm({
  customerId,
  isCompleted,
}: KycVerificationFormProps) {
  const [kycUrl, setKycUrl] = useState<string | null>(null);
  const { data: kycStatus, isPending: isKycStatusPending } = useBridgeKYCStatus(
    { customerId },
  );
  const { mutateAsync: kycInitiate, isPending: isKycInitiatePending } =
    useBridgeKYCInitiate({ customerId });

  const onInitiateKYC = useCallback(async () => {
    if (!customerId) {
      toast({
        title: 'Error',
        description: 'Customer ID is required to initiate KYC',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Initiating KYC for customer:', customerId);
      const { redirectUrl } = await kycInitiate();

      if (redirectUrl) {
        setKycUrl(redirectUrl);
        // Open the KYC verification URL in a new tab
        window.open(redirectUrl, '_blank');
      } else {
        // Handle case where redirectUrl is missing but response was ok
        console.error('KYC initiation response missing redirectUrl:', data);
        throw new Error(
          'KYC initiation succeeded but no redirect URL was provided.',
        );
      }
    } catch (error) {
      console.error('Error initiating KYC:', error);
      toast({
        title: 'Error Initiating KYC',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred during KYC initiation.',
        variant: 'destructive',
      });
      // Optionally reset state if needed, e.g., setKycStatus('not_started')
    }
  }, [customerId, kycInitiate]);

  const state = useMemo(() => {
    if (isCompleted) {
      return <ProfileKYCVerificationStateComplete />;
    }
    switch (kycStatus?.status) {
      case 'completed':
        return <ProfileKYCVerificationStateComplete />;
      case 'pending':
        return <ProfileKYCVerificationStatePending kycUrl={kycUrl} />;
      case 'failed':
        return (
          <ProfileKYCVerificationStateFailed
            onInitiateKYC={onInitiateKYC}
            isPending={isKycStatusPending}
          />
        );
      default:
        return (
          <ProfileKYCVerificationStateDefault
            isPending={isKycStatusPending || isKycInitiatePending}
            customerId={customerId}
            onInitiateKYC={onInitiateKYC}
          />
        );
    }
  }, [
    onInitiateKYC,
    customerId,
    isKycStatusPending,
    isKycInitiatePending,
    kycUrl,
    kycStatus,
    isCompleted,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Verify your identity to enable bank transfers and other payment
          methods.
        </CardDescription>
      </CardHeader>
      <CardContent>{state}</CardContent>
    </Card>
  );
}
