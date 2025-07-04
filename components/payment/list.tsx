import { type DbPayment } from '@/types/campaign';
import { PaymentItem } from './item';
export function PaymentList({ payments }: { payments: DbPayment[] }) {
  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <PaymentItem key={payment.id} payment={payment} />
      ))}
    </div>
  );
}
