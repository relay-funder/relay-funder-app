import { useCallback, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Input, Label } from '@/components/ui';
import { CampaignDonationSuggestions } from '../suggestions';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { Mail, Shield } from 'lucide-react';
import { useConnectedAccount } from '@/lib/web3';
import { useDonationContext } from '@/contexts';

export function CampaignDonationWalletAmount() {
  const { data: profile } = useUserProfile();

  const {
    amount,
    token,
    email,
    setAmount,
    setEmail,
    paymentType,
  } = useDonationContext();

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [setAmount],
  );

  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [setEmail],
  );

  // Pre-fill email from user profile
  useEffect(() => {
    if (profile?.email && !email) {
      setEmail(profile.email);
    }
  }, [profile?.email, email, setEmail]);

  const { isEmbedded, embeddedEmail } = useConnectedAccount();
  useEffect(() => {
    if (!profile || profile.email) {
      return;
    }
    if (!isEmbedded || !embeddedEmail) {
      return;
    }
    setEmail(embeddedEmail);
  }, [profile, isEmbedded, embeddedEmail, setEmail]);


  return (
    <div className="flex flex-col space-y-6">
      {/* Email field */}
      {!profile?.email && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <Label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email Address (optional)
            </Label>
          </div>
          <div className="max-w-sm">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="john@example.com"
              className="h-10 text-sm"
            />
          </div>
          {/* Privacy message */}
          <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span>
              Your email stays private and secure. We&apos;ll use it to send
              donation receipts, tax documents, and updates on how your
              contribution is creating real impact.
            </span>
          </div>
        </div>
      )}

      {/* Suggested amounts */}
      <CampaignDonationSuggestions
        currency={paymentType === 'daimo' ? 'USD' : token}
      />

      {/* Custom amount input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Or enter a custom amount:
        </label>
        <div className="max-w-sm">
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="h-10 pr-20 text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {token}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
