import { Prisma, db } from '@/server/db';

export const roundForQFSelect = {
  id: true,
  title: true,
  matchingPool: true,
  startDate: true,
  endDate: true,
  blockchain: true,
  status: true,
  roundCampaigns: {
    select: {
      id: true,
      status: true,
      Campaign: {
        select: {
          id: true,
          title: true,
          status: true,
          payments: {
            select: {
              amount: true,
              token: true,
              status: true,
              userId: true,
            },
            where: {
              status: 'confirmed',
            },
          },
        },
      },
    },
    where: {
      status: 'APPROVED',
    },
  },
} satisfies Prisma.RoundSelect;

export async function getRoundForCalculationQuery(id: number) {
  return db.round.findUnique({
    where: { id },
    select: roundForQFSelect,
  });
}
