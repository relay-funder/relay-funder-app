import { Prisma } from '@/server/db';
import { roundForQfSelect } from '@/lib/api/qf/queries';

export type QfRoundDB = Prisma.RoundGetPayload<{
  select: typeof roundForQfSelect;
}>;

export type QfCampaignDB = QfRoundDB['roundCampaigns'][number];

export type QfPaymentDB = QfCampaignDB['Campaign']['payments'][number];
