import { getUserWithStates } from './user';
import { db } from '@/server/db';

// AI generated list of abusive words for basic filtering
// avoid extending this list too far
const abusiveWords: Record<string, string[]> = {
  'General Abusive Language': [
    'abuse',
    'bully',
    'bullying',
    'curse',
    'cursed',
    'damn',
    'damned',
    'dumb',
    'fool',
    'foolish',
    'idiot',
    'insult',
    'jerk',
    'loser',
    'moron',
    'stupid',
    'suck',
    'sucks',
    'trash',
    'worthless',
  ],

  'Sexist Language': [
    'bitch',
    'bimbo',
    'chick',
    'cunt',
    'doll',
    'feminazi',
    'slut',
    'whore',
  ],
  'Homophobic Language': ['fag', 'faggot', 'dyke'],
  Advertisement: [
    'buy now',
    'limited time offer',
    'free trial',
    'click here',
    'subscribe now',
    'act fast',
    'exclusive deal',
    'special promotion',
    'order now',
    'get paid',
    'earn money',
    'make money',
    'work from home',
    'guaranteed',
    'risk-free',
    'call now',
    'discount',
    'save big',
    'best price',
    'lowest price',
    'money back guarantee',
    'instant cash',
    'free gift',
    'no cost',
    'unbeatable deal',
    'join millions',
    'limited supply',
    'while supplies last',
    "this isn't a scam",
    '100% satisfied',
    'no hidden fees',
    'one-time offer',
  ],
};
export async function checkAbusiveContent(inputString: string): Promise<void> {
  // Iterate through each category in the abusiveWords record
  for (const [category, abusiveTerms] of Object.entries(abusiveWords)) {
    // Check if any abusive term is present in the input words
    for (const term of abusiveTerms) {
      if (inputString.trim().toLowerCase().includes(term.toLowerCase())) {
        throw new Error(`Abusive content detected: ${category}`);
      }
    }
  }
  // allow extension by db:
  // id,category:string,phrase:string
  // const result = await db.$queryRaw`
  //     SELECT phrase FROM abusePhrases
  //     WHERE $1 LIKE '%' || phrase || '%'
  // `([inputString]);
  // if (result) {
  //   throw new Error(`Abusive content detected'`);
  // }
}
export async function listComments({
  campaignId,
  admin = false,
  page = 1,
  pageSize = 10,
  skip = 0,
}: {
  campaignId: number;
  admin?: boolean;
  page?: number;
  pageSize: number;
  skip: number;
}) {
  const where = {
    campaign: { id: campaignId },
    // deleted: false | isAdmin
    // reportCount:{lt:5}
  };
  if (admin) {
    // admins want to see all
    // where.deleted = undefined;
    // where.reportCount = undefined;
  }
  const [dbComments, totalCount] = await Promise.all([
    db.comment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.comment.count({
      where: {
        campaign: { id: campaignId },
      },
    }),
  ]);

  const creatorList = await Promise.all(
    dbComments.map(({ userAddress }) => getUserWithStates(userAddress)),
  );

  const combinedComments = dbComments.map((dbComment) => {
    return {
      ...dbComment,
      creator: creatorList.find(
        ({ address }) => address === dbComment.userAddress,
      ),
    };
  });
  return {
    comments: combinedComments,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}
