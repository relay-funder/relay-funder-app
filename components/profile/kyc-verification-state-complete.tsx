import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';

export function ProfileKYCVerificationStateComplete() {
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-600">
        KYC Verification Complete
      </AlertTitle>
      <AlertDescription className="text-green-600">
        Your identity has been verified successfully. You can now add payment
        methods.
      </AlertDescription>
    </Alert>
  );
}
