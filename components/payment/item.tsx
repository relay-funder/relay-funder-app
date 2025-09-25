import type { PaymentSummaryContribution } from '@/lib/api/types';
import { UserInlineName } from '../user/inline-name';
import { FormattedDate } from '../formatted-date';
import { DbCampaign } from '@/types/campaign';
import { useRemovePayment } from '@/lib/hooks/usePayments';
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRefetchCampaign } from '@/lib/hooks/useCampaigns';
import { cn } from '@/lib/utils';
import { Button, Card, CardContent, CardFooter } from '../ui';
import { Trash, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts';
import { chainConfig } from '@/lib/web3';

export function PaymentItem({
  payment,
  campaign,
}: {
  payment: PaymentSummaryContribution;
  campaign: DbCampaign;
}) {
  const { toast } = useToast();
  const [hidden, setHidden] = useState(false);
  const { isAdmin } = useAuth();
  const { mutateAsync: removePayment, isPending: isRemovingPayment } =
    useRemovePayment();
  const refetchCampaign = useRefetchCampaign(campaign.id);
  const canRemove = isAdmin;
  const onRemove = useCallback(async () => {
    try {
      await removePayment({ campaignId: campaign.id, paymentId: payment.id });
      setHidden(true);
      refetchCampaign();
    } catch (error) {
      console.error('Error removing payment:', error);
      toast({
        title: 'Error',
        description: `Failed remove payment: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        variant: 'destructive',
      });
    }
  }, [removePayment, refetchCampaign, campaign, payment, toast]);

  const hasExplorerLink = payment.transactionHash;
  const explorerUrl = hasExplorerLink
    ? `${chainConfig.blockExplorerUrl}/tx/${payment.transactionHash}`
    : undefined;

  const handleRowClick = useCallback(() => {
    if (explorerUrl) {
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  }, [explorerUrl]);

  return (
    <Card
      className={cn(
        hidden && 'hidden',
        hasExplorerLink && 'cursor-pointer transition-colors hover:bg-gray-50',
      )}
      onClick={hasExplorerLink ? handleRowClick : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserInlineName user={payment.user} />
                <span className="text-sm text-gray-500">•</span>
                <FormattedDate date={payment.date} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  ${payment.amount}
                </span>
                <span className="text-sm text-gray-500">
                  {payment.token === 'USD' ? 'Credit Card' : payment.token}
                </span>
                {hasExplorerLink && (
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {canRemove && (
        <CardFooter>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={isRemovingPayment}
            variant="ghost"
            className="text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Trash className="h-3 w-3" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
