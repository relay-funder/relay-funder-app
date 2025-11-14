'use client';

interface PaymentTotalSummaryProps {
  amount: string | undefined;
  tipAmount: string | undefined;
}

export function PaymentTotalSummary({
  amount,
  tipAmount,
}: PaymentTotalSummaryProps) {
  const amountNum = parseFloat(amount || '0');
  const tipAmountNum = parseFloat(tipAmount || '0');
  const total = amountNum + tipAmountNum;

  // Handle NaN cases
  if (isNaN(total) || !amount || amountNum <= 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Total Amount:
        </span>
        <span className="text-lg font-bold text-foreground">
          ${total.toFixed(2)}
        </span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Campaign: ${amount} • Platform tip: ${tipAmount}
      </div>
    </div>
  );
}
