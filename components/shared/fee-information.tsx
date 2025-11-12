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

interface FeeInformationProps {
  /** Whether this is for Daimo Pay checkout (shows Daimo-specific fee) */
  isDaimoPay?: boolean;
  /** Custom donation amount to calculate fees (optional) */
  donationAmount?: number;
  /** Whether to show as a compact card or detailed breakdown */
  compact?: boolean;
  /** Whether to show all fees for campaign creation context */
  showAllFeesForCampaign?: boolean;
  /** Custom className for styling */
  className?: string;
}

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
  compact = false,
  showAllFeesForCampaign = false,
  className = '',
}: FeeInformationProps) {
  // Fee rates (in percentage)
  const DAIMO_FEE_RATE = 1;
  const PROTOCOL_FEE_RATE = 1;
  const PLATFORM_FEE_RATE = 0; // Currently waived

  // Calculate fees if donation amount provided
  const daimoFee = donationAmount ? (donationAmount * DAIMO_FEE_RATE) / 100 : 0;
  const protocolFee = donationAmount
    ? (donationAmount * PROTOCOL_FEE_RATE) / 100
    : 0;
  const platformFee = donationAmount
    ? (donationAmount * PLATFORM_FEE_RATE) / 100
    : 0;
  const totalFees = daimoFee + protocolFee + platformFee;

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
                  <DialogTitle>Fee Structure</DialogTitle>
                </DialogHeader>
                <FeeBreakdownContent
                  isDaimoPay={isDaimoPay || showAllFeesForCampaign}
                  donationAmount={donationAmount}
                  daimoFee={daimoFee}
                  protocolFee={protocolFee}
                  platformFee={platformFee}
                  totalFees={totalFees}
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

  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              Fee Structure
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  CCP Protocol Fee
                </p>
                <p className="text-xs text-muted-foreground">
                  Blockchain protocol costs
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {donationAmount ? `$${protocolFee.toFixed(2)}` : '1%'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border/50 py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Platform Fee
                </p>
                <p className="text-xs text-muted-foreground">
                  Relay Funder operations (currently waived)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {donationAmount ? `$${platformFee.toFixed(2)}` : '0%'}
                </p>
              </div>
            </div>

            {isDaimoPay && (
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Daimo Pay Fee
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cross-chain payment processing only
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {donationAmount ? `$${daimoFee.toFixed(2)}` : '1%'}
                  </p>
                </div>
              </div>
            )}

            {donationAmount && totalFees > 0 && (
              <div className="flex items-center justify-between border-t border-border py-2 pt-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Total Fees
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Amount deducted from your donation
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    ${totalFees.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((totalFees / donationAmount) * 100).toFixed(1)}% of
                    donation
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/50 pt-2">
            <p className="text-xs text-muted-foreground">
              <strong>Transparent Fees:</strong> Relay Funder is committed to
              fee transparency. Unlike traditional platforms, we clearly show
              all fees before you donate. Platform fees are currently waived to
              support campaign creators, but this may change in the future.
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
  daimoFee,
  protocolFee,
  platformFee,
  totalFees,
}: {
  isDaimoPay: boolean;
  donationAmount?: number;
  daimoFee: number;
  protocolFee: number;
  platformFee: number;
  totalFees: number;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">CCP Protocol Fee</span>
              <span className="text-sm font-medium">
                {donationAmount ? `$${protocolFee.toFixed(2)}` : '1%'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Platform Fee</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {donationAmount ? `$${platformFee.toFixed(2)}` : '0% (waived)'}
              </span>
            </div>

            {isDaimoPay && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Daimo Pay (Only Cross-chain)</span>
                <span className="text-sm font-medium">
                  {donationAmount ? `$${daimoFee.toFixed(2)}` : '1%'}
                </span>
              </div>
            )}

            {donationAmount && (
              <div className="flex items-center justify-between border-t py-2 pt-2">
                <span className="text-sm font-medium">Total Fees</span>
                <span className="text-sm font-bold">
                  ${totalFees.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="mb-2 font-semibold text-foreground">
            About These Fees
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>CCP Protocol Fee:</strong> Supports the underlying
              blockchain infrastructure and protocol that enables secure,
              decentralized fundraising.
            </p>
            <p>
              <strong>Platform Fee:</strong> Currently waived to maximize impact
              for campaigns. When reintroduced, it will support Relay
              Funder&apos;s operations and development.
            </p>
            {isDaimoPay && (
              <p>
                <strong>Daimo Pay Fee:</strong> Covers the cost of cross-chain
                transfers when you donate from a different blockchain network
                than the campaign&apos;s treasury.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
