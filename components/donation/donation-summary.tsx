/**
 * DonationSummary - Displays breakdown of donation amounts
 * Responsible for: Campaign donation amount, platform donation, total calculation display
 */

interface DonationSummaryProps {
  campaignTitle: string;
  poolAmount: number;
  platformAmount: number;
  totalAmount: number;
  isDonatingToPlatform: boolean;
  percentage: number;
  formatCrypto: (value: number) => string;
}

export function DonationSummary({
  campaignTitle,
  poolAmount,
  platformAmount,
  totalAmount,
  isDonatingToPlatform,
  percentage,
  formatCrypto,
}: DonationSummaryProps) {
  if (totalAmount <= 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg bg-muted/50 p-4">
      <div className="flex justify-between text-sm">
        <span>Donating to {campaignTitle}</span>
        <span className="font-medium">{formatCrypto(poolAmount)}</span>
      </div>

      {isDonatingToPlatform && (
        <div className="flex justify-between text-sm">
          <span>Donating {percentage}% to Akashic</span>
          <span className="font-medium">{formatCrypto(platformAmount)}</span>
        </div>
      )}

      <div className="flex justify-between border-t pt-2 text-sm font-semibold">
        <span>Total donation</span>
        <span>{formatCrypto(totalAmount)}</span>
      </div>
    </div>
  );
}
