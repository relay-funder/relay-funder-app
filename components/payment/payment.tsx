import { PaymentLink } from '@/components/payment/link';
import { type PaymentSummaryContribution } from '@/lib/api/types';
import { UserInlineName } from '@/components/user/inline-name';
import { FormattedDate } from '@/components/formatted-date';
export function Payment({ payment }: { payment: PaymentSummaryContribution }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
      <div className="flex items-center gap-4">
        <div>
          <UserInlineName user={payment.user} />
          <p className="text-sm text-gray-500">
            <FormattedDate date={payment.date} />
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">
          {payment.amount} {payment.token}
        </p>
        <PaymentLink payment={payment} />
      </div>
    </div>
  );
}
