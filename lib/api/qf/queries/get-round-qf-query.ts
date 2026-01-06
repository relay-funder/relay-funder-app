import { Prisma, db } from '@/server/db';

export const roundForQfSelect = {
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
        },
      },
      roundContributions: {
        select: {
          payment: {
            select: {
              amount: true,
              token: true,
              status: true,
              user: {
                select: {
                  id: true,
                  address: true,
                },
              },
            },
          },
        },
        where: {
          payment: {
            status: 'confirmed',
          },
        },
      },
    },
    where: {
      status: 'APPROVED',
    },
  },
} satisfies Prisma.RoundSelect;

/**
 * Database query to fetch round data for QF calculation.
 *
 * @param id - Round id (database primary key).
 * @returns Round data with campaigns and confirmed payments, or null if not found.
 */
export async function getRoundForCalculationQuery(id: number) {
  return db.round.findUnique({
    where: { id },
    select: roundForQfSelect,
  });
}
