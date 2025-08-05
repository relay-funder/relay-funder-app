import { db } from '@/server/db';
import { getPaymentUser } from './user';
import { PaymentSummaryContribution } from './types';

export async function listPayments({
  campaignId,
  admin = false,
  page = 1,
  pageSize = 10,
  skip = 0,
}: {
  campaignId: number;
  admin?: boolean;
  page?: number;
  pageSize?: number;
  skip?: number;
}) {
  const where = {
    campaign: { id: campaignId },
    status: 'confirmed' as string | { in: string[] },
    type: 'BUY' as 'BUY' | 'SELL',
  };
  if (admin) {
    where.status = { in: ['confirmed', 'pending'] };
  }
  const [dbPayments, totalCount] = await Promise.all([
    db.payment.findMany({
      where,
      include: { user: true },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.payment.count({
      where,
    }),
  ]);

  const publicPayments = dbPayments.map((dbPayment) => {
    return {
      id: dbPayment.id,
      status: dbPayment.status,
      amount: parseInt(dbPayment.amount),
      token: dbPayment.token,
      user: getPaymentUser(dbPayment),
      date: dbPayment.updatedAt,
      transactionHash: dbPayment.transactionHash,
    } as PaymentSummaryContribution;
  });
  return {
    payments: publicPayments,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}
