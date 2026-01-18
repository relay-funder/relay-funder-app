'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Card,
  CardContent,
} from '@/components/ui';
import { Info } from 'lucide-react';
import { PROTOCOL_FEE_RATE } from '@/lib/constant';

/**
 * FeeInformation component displays transparent fee structure for donations
 *
 * Fee Structure:
 * - Daimo Pay (cross-chain): 1% fee
 * - CCP Protocol Fee: 1% (always applied)
 * - Platform Fee: 0% (currently waived, but not forever)
 */
export function FeeInformation({
  isDaimoPay = false,
  donationAmount,
  tipAmount = 0,
  qfMatch,
  compact = false,
  showAllFeesForCampaign = false,
  className = '',
}: {
  isDaimoPay?: boolean;
  donationAmount?: number;
  tipAmount?: number;
  qfMatch?: number;
  compact?: boolean;
  showAllFeesForCampaign?: boolean;
  className?: string;
}) {
  // Fee rates (as decimals)
  const DAIMO_FEE_RATE = 0.01; // 1%
  const PLATFORM_FEE_RATE = 0; // Currently waived

  // Calculate fees
  // Fees are typically calculated on the donation amount (base)
  const daimoFee =
    donationAmount && isDaimoPay ? donationAmount * DAIMO_FEE_RATE : 0;
  const protocolFee = donationAmount ? donationAmount * PROTOCOL_FEE_RATE : 0;
  const platformFee = donationAmount ? donationAmount * PLATFORM_FEE_RATE : 0;

  const totalFees = daimoFee + protocolFee + platformFee;
  const totalUserPayment = (donationAmount || 0) + tipAmount + totalFees;

  const totalContribution = totalUserPayment + (qfMatch || 0);

  if (compact) {
    return (
      <Card className={`border-primary/20 bg-primary/5 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Fee Structure
              </span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs"
                >
                  Details →
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Details</DialogTitle>
                </DialogHeader>
                <FeeBreakdownContent
                  isDaimoPay={isDaimoPay || showAllFeesForCampaign}
                  donationAmount={donationAmount}
                  tipAmount={tipAmount}
                  qfMatch={qfMatch}
                  daimoFee={daimoFee}
                  protocolFee={protocolFee}
                  totalContribution={totalContribution}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {showAllFeesForCampaign ? (
              <>
                1% Protocol Fee • 0% Platform Fee • 1% Daimo Pay (Only
                Cross-chain)
              </>
            ) : (
              <>
                {isDaimoPay && `1% Daimo Pay + `}
                1% Protocol Fee • 0% Platform Fee
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed view (default now for inline display)
  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <FeeBreakdownContent
            isDaimoPay={isDaimoPay}
            donationAmount={donationAmount}
            tipAmount={tipAmount}
            qfMatch={qfMatch}
            daimoFee={daimoFee}
            protocolFee={protocolFee}
            totalContribution={totalContribution}
          />

          <div className="border-t border-border/50 pt-2">
            <p className="text-xs text-muted-foreground">
              <strong>Transparent Fees:</strong> Relay Funder is committed to
              fee transparency. Protocol fees support the network. Platform fees
              are waived.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Internal component for the detailed fee breakdown in dialogs
 */
function FeeBreakdownContent({
  isDaimoPay,
  donationAmount,
  tipAmount = 0,
  qfMatch,
  daimoFee,
  protocolFee,
  totalContribution,
}: {
  isDaimoPay: boolean;
  donationAmount?: number;
  tipAmount?: number;
  qfMatch?: number;
  daimoFee: number;
  protocolFee: number;
  totalContribution?: number;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="space-y-3">
            {/* Campaign Donation */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Amount going to campaign creator</span>
              <span className="text-sm font-medium">
                {donationAmount ? `$${donationAmount.toFixed(2)}` : '$0.00'}
              </span>
            </div>

            {/* Platform Tip */}
            {tipAmount > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Platform Tip</span>
                <span className="text-sm font-medium">
                  {`$${tipAmount.toFixed(2)}`}
                </span>
              </div>
            )}

            {/* Daimo Fee */}
            {isDaimoPay && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">1% Daimo Pay fee</span>
                <span className="text-sm font-medium">
                  {donationAmount ? `$${daimoFee.toFixed(2)}` : '$0.00'}
                </span>
              </div>
            )}

            {/* Protocol Fee */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">1% Protocol fee</span>
              <span className="text-sm font-medium">
                {donationAmount ? `$${protocolFee.toFixed(2)}` : '$0.00'}
              </span>
            </div>

            {/* QF Match */}
            {qfMatch !== undefined && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">QF Funding</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {`$${qfMatch.toFixed(2)}`}
                </span>
              </div>
            )}

            {/* Total Contribution */}
            <div className="flex items-center justify-between border-t py-2 pt-3">
              <span className="text-sm font-medium">Total Contribution</span>
              <span className="text-sm font-bold">
                {donationAmount
                  ? `$${(totalContribution || 0).toFixed(2)}`
                  : '$0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
