import { useCallback, type ChangeEvent, useEffect } from 'react';
import { Input, Label } from '@/components/ui';
import { CampaignDonationSuggestions } from '../suggestions';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { Mail, Shield } from 'lucide-react';
import { useConnectedAccount } from '@/lib/web3';

export function CampaignDonationWalletAmount({
  amount,
  selectedToken,
  onAmountChanged,
  email,
  onEmailChanged,
}: {
  amount: string;
  selectedToken: string;
  onAmountChanged: (amount: string) => void;
  onTokenChanged: (token: string) => void;
  email: string;
  onEmailChanged: (email: string) => void;
}) {
  const { data: profile } = useUserProfile();

  // Pre-fill email from user profile
  useEffect(() => {
    if (profile?.email && !email) {
      onEmailChanged(profile.email);
    }
  }, [profile?.email, email, onEmailChanged]);

  const intermediateOnAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      return onAmountChanged(event.target.value);
    },
    [onAmountChanged],
  );

  const intermediateOnEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      return onEmailChanged(event.target.value);
    },
    [onEmailChanged],
  );
  const { isEmbedded, embeddedEmail } = useConnectedAccount();
  useEffect(() => {
    if (!profile || profile.email) {
      return;
    }
    if (!isEmbedded || !embeddedEmail) {
      return;
    }
    onEmailChanged(embeddedEmail);
  }, [profile, isEmbedded, embeddedEmail, onEmailChanged]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Email field */}
      {!profile?.email && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-900"
            >
              Email Address *
            </Label>
          </div>
          <div className="max-w-sm">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={intermediateOnEmailChange}
              placeholder="john@example.com"
              required
              className="h-10 text-sm"
            />
          </div>
          {/* Privacy message */}
          <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span>
              You did not configure your profile yet. We will store your email
              in your profile settings. We won&apos;t spam you and the email
              won&apos;t be publicly visible.
            </span>
          </div>
        </div>
      )}

      {/* Suggested amounts */}
      <CampaignDonationSuggestions
        amount={amount}
        onAmountChanged={onAmountChanged}
        currency={selectedToken}
      />

      {/* Custom amount input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">
          Or enter a custom amount:
        </label>
        <div className="max-w-sm">
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={intermediateOnAmountChange}
              placeholder="Enter amount"
              className="h-10 pr-20 text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              USDC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
