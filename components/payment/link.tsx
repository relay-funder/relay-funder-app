import { LinkIcon } from 'lucide-react';
import { type PaymentSummaryContribution } from '@/lib/api/types';
import { chainConfig } from '@/lib/web3';

export function PaymentLink({
  payment,
}: {
  payment: PaymentSummaryContribution;
}) {
  // Only show blockchain links for crypto payments that have transaction hashes
  if (!payment.transactionHash) {
    return null;
  }

  return (
    <a
      href={`${chainConfig.blockExplorerUrl}/tx/${payment.transactionHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
    >
      <LinkIcon className="h-3 w-3" />
      View on Explorer
    </a>
  );
}
