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
        'flex items-center justify-between rounded-lg bg-white p-4 shadow',
      )}
    >
      <div className="flex items-center gap-4">
        <div>
          <UserInlineName user={payment.user} />
          <p className="text-sm text-gray-500">
            <FormattedDate date={payment.date} />
          </p>
          {payment.status !== 'confirmed' && <p>Unconfirmed</p>}
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">
          {payment.amount} {payment.token}
        </p>
        <p className="text-xs text-gray-500">
          {payment.token === 'USD' ? 'Credit Card' : `via ${payment.token}`}
        </p>
        <PaymentLink payment={payment} />
        {canRemove && (
          <Button onClick={onRemove} disabled={isRemovingPayment}>
            <Trash />
          </Button>
        )}
      </div>
    </div>
  );
}
