'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { AdminUserOverviewResponse } from '@/lib/api/types';

type PaymentMethodLite =
  AdminUserOverviewResponse['latestPaymentMethods'][number];

export interface PaymentMethodsCardProps {
  paymentMethods: PaymentMethodLite[];
  className?: string;
  title?: string;
}

export function PaymentMethodsCard({
  paymentMethods,
  className,
  title = 'Payment Methods',
}: PaymentMethodsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No payment methods
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="rounded-md border p-3 text-sm"
                title={pm.externalId ?? undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {pm.provider}{' '}
                    <span className="text-muted-foreground">• {pm.type}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(
                      pm.createdAt as unknown as string,
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {pm.externalId}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentMethodsCard;
