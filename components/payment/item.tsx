import type { PaymentSummaryContribution } from '@/lib/api/types';
import { PaymentLink } from './link';
import { UserInlineName } from '../user/inline-name';
import { FormattedDate } from '../formatted-date';
import { DbCampaign } from '@/types/campaign';
import { useRemovePayment } from '@/lib/hooks/usePayments';
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRefetchCampaign } from '@/lib/hooks/useCampaigns';
import { cn } from '@/lib/utils';
import { Button } from '../ui';
import { Trash } from 'lucide-react';
import { useAuth } from '@/contexts';

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

  return (
    <div
      className={cn(
        hidden && 'hidden',
        'flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserInlineName user={payment.user} />
            {payment.status !== 'confirmed' && (
              <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                Unconfirmed
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            <FormattedDate date={payment.date} />
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-green-600">
            ${payment.amount}
          </p>
          <p className="text-xs text-gray-500">
            {payment.token === 'USD' ? 'Credit Card' : `via ${payment.token}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <PaymentLink payment={payment} />
          {canRemove && (
            <Button
              onClick={onRemove}
              disabled={isRemovingPayment}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
