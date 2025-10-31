import { Decimal } from '@/server/db';
import { QfRoundDB } from '@/lib/api/types/qf';
import { QfCalculationResult, QfRound, QfRoundState } from '@/lib/qf';
import { USD_DECIMALS, USD_TOKEN } from '@/lib/constant';

interface MockedQfRound {
  round: QfRoundDB;
  parsed?: QfRound;
  state?: QfRoundState;
  distribution?: QfCalculationResult;
}

const mockedRoundBase: Pick<
  QfRoundDB,
  | 'id'
  | 'title'
  | 'matchingPool'
  | 'startDate'
  | 'endDate'
  | 'blockchain'
  | 'status'
> = {
  id: 1,
  title: 'Test Round',
  matchingPool: new Decimal('1000'),
  startDate: new Date(),
  endDate: new Date(),
  blockchain: 'ethereum',
  status: 'ACTIVE',
};

const mockedParsedRoundBase: Pick<
  QfRound,
  'id' | 'title' | 'matchingPool' | 'blockchain' | 'status'
> = {
  id: 1,
  title: 'Test Round',
  matchingPool: '1000',
  blockchain: 'ethereum',
  status: 'ACTIVE',
};

const mockedStateRoundBase: Pick<
  QfRoundState,
  'id' | 'title' | 'matchingPool' | 'token' | 'tokenDecimals'
> = {
  id: 1,
  title: 'Test Round',
  matchingPool: '1000',
  token: USD_TOKEN,
  tokenDecimals: USD_DECIMALS,
};

export const mockedQfRoundMultipleCampaigns: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 1,
          title: 'Campaign 1',
          status: 'ACTIVE',
          payments: [
            {
              amount: '10.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '5.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '20.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 2, address: '0x223' },
            },
          ],
        },
      },
      {
        id: 2,
        status: 'APPROVED',
        Campaign: {
          id: 2,
          title: 'Campaign 2',
          status: 'ACTIVE',
          payments: [
            {
              amount: '15.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 3, address: '0x323' },
            },
            {
              amount: '25.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 4, address: '0x423' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    campaigns: [
      {
        id: 1,
        title: 'Campaign 1',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '15', // 10 + 5
          2: '20',
        },
        nUniqueContributors: 2,
        nContributions: 3,
      },
      {
        id: 2,
        title: 'Campaign 2',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          3: '15',
          4: '25',
        },
        nUniqueContributors: 2,
        nContributions: 2,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    campaigns: [
      {
        id: 1,
        title: 'Campaign 1',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '15', // 10 + 5
          2: '20',
        },
        nUniqueContributors: 2,
        nContributions: 3,
      },
      {
        id: 2,
        title: 'Campaign 2',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          3: '15',
          4: '25',
        },
        nUniqueContributors: 2,
        nContributions: 2,
      },
    ],
  },
  distribution: {
    totalAllocated: '1000',
    distribution: [
      {
        id: 1,
        title: 'Campaign 1',
        matchingAmount: '469.359675',
        nUniqueContributors: 2,
        nContributions: 3,
      },
      {
        id: 2,
        title: 'Campaign 2',
        matchingAmount: '530.640325',
        nUniqueContributors: 2,
        nContributions: 2,
      },
    ],
  },
};

export const mockedQfRoundSameScoreCampaigns: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'Campaign 1',
          status: 'ACTIVE',
          payments: [
            {
              amount: '400.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
          ],
        },
      },
      {
        id: 2,
        status: 'APPROVED',
        Campaign: {
          id: 101,
          title: 'Campaign 2',
          status: 'ACTIVE',
          payments: [
            {
              amount: '25.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 3, address: '0x323' },
            },
            {
              amount: '25.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 4, address: '0x423' },
            },
            {
              amount: '25.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 5, address: '0x523' },
            },
            {
              amount: '25.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 6, address: '0x623' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    campaigns: [
      {
        id: 100,
        title: 'Campaign 1',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '400',
        },
        nUniqueContributors: 1,
        nContributions: 1,
      },
      {
        id: 101,
        title: 'Campaign 2',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          3: '25',
          4: '25',
          5: '25',
          6: '25',
        },
        nUniqueContributors: 4,
        nContributions: 4,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    campaigns: [
      {
        id: 100,
        title: 'Campaign 1',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '400',
        },
        nUniqueContributors: 1,
        nContributions: 1,
      },
      {
        id: 101,
        title: 'Campaign 2',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          3: '25',
          4: '25',
          5: '25',
          6: '25',
        },
        nUniqueContributors: 4,
        nContributions: 4,
      },
    ],
  },
  distribution: {
    totalAllocated: '1000',
    distribution: [
      {
        id: 100,
        title: 'Campaign 1',
        matchingAmount: '500',
        nUniqueContributors: 1,
        nContributions: 1,
      },
      {
        id: 101,
        title: 'Campaign 2',
        matchingAmount: '500',
        nUniqueContributors: 4,
        nContributions: 4,
      },
    ],
  },
};

export const mockedQfRoundSingleCampaign: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    roundCampaigns: [
      {
        id: 100,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'Campaign 1',
          status: 'ACTIVE',
          payments: [
            {
              amount: '10.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '5.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '20.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 2, address: '0x223' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    campaigns: [
      {
        id: 100,
        title: 'Campaign 1',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '15', // 10 + 5
          2: '20',
        },
        nUniqueContributors: 2,
        nContributions: 3,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    campaigns: [
      {
        id: 100,
        title: 'Campaign 1',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '15', // 10 + 5
          2: '20',
        },
        nUniqueContributors: 2,
        nContributions: 3,
      },
    ],
  },
  distribution: {
    totalAllocated: '1000',
    distribution: [
      {
        id: 100,
        title: 'Campaign 1',
        matchingAmount: '1000',
        nUniqueContributors: 2,
        nContributions: 3,
      },
    ],
  },
};

const mockedRoundDecimalPoolTitle = 'Decimal Pool Round';
export const mockedQfRoundDecimalPool: MockedQfRound = {
  round: {
    ...mockedQfRoundSameScoreCampaigns.round,
    title: mockedRoundDecimalPoolTitle,
    matchingPool: new Decimal('1000.123456'),
  },
  parsed: {
    ...mockedQfRoundSameScoreCampaigns.parsed!,
    title: mockedRoundDecimalPoolTitle,
    matchingPool: '1000.123456',
  },
  state: {
    ...mockedQfRoundSameScoreCampaigns.state!,
    title: mockedRoundDecimalPoolTitle,
    matchingPool: '1000.123456',
  },
  distribution: {
    totalAllocated: '1000.123456',
    distribution: [
      {
        id: 100,
        title: 'Campaign 1',
        matchingAmount: '500.061728',
        nUniqueContributors: 1,
        nContributions: 1,
      },
      {
        id: 101,
        title: 'Campaign 2',
        matchingAmount: '500.061728',
        nUniqueContributors: 4,
        nContributions: 4,
      },
    ],
  },
};

const roundEmptyTitle = 'Empty Round';
export const mockedQfRoundEmpty: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: roundEmptyTitle,
    roundCampaigns: [],
  },
  // ApiParameterError is thrown before parsing
};

const roundNoPaymentsTitle = 'No Payments Round';
export const mockedQfRoundNoPayments: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: roundNoPaymentsTitle,
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'No Payments Campaign',
          status: 'ACTIVE',
          payments: [],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    title: roundNoPaymentsTitle,
    campaigns: [
      {
        id: 100,
        title: 'No Payments Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {},
        nUniqueContributors: 0,
        nContributions: 0,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    title: roundNoPaymentsTitle,
    campaigns: [
      {
        id: 100,
        title: 'No Payments Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {},
        nUniqueContributors: 0,
        nContributions: 0,
      },
    ],
  },
  distribution: {
    totalAllocated: '0',
    distribution: [
      {
        id: 100,
        title: 'No Payments Campaign',
        matchingAmount: '0',
        nUniqueContributors: 0,
        nContributions: 0,
      },
    ],
  },
};

const roundAggregationSameUserTitle = 'Aggregation Test';
export const mockedQfRoundAggregationSameUser: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: roundAggregationSameUserTitle,
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'Aggregation Campaign',
          status: 'ACTIVE',
          payments: [
            {
              amount: '10.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '5.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '2.5',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '1.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    title: roundAggregationSameUserTitle,
    campaigns: [
      {
        id: 100,
        title: 'Aggregation Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '18.5',
        },
        nUniqueContributors: 1,
        nContributions: 4,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    title: roundAggregationSameUserTitle,
    campaigns: [
      {
        id: 100,
        title: 'Aggregation Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: { 1: '18.5' },
        nUniqueContributors: 1,
        nContributions: 4,
      },
    ],
  },
};

const roundDecimalContributionsTitle = 'Decimal Contributions Test';
export const mockedQfRoundDecimalContributions: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: roundDecimalContributionsTitle,
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'Decimal Campaign',
          status: 'ACTIVE',
          payments: [
            {
              amount: '10.75',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '15.10',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 2, address: '0x223' },
            },
            {
              amount: '100.25',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 3, address: '0x323' },
            },
            {
              amount: '0.01',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 4, address: '0x423' },
            },
            {
              amount: '999.999',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 5, address: '0x523' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    title: roundDecimalContributionsTitle,
    campaigns: [
      {
        id: 100,
        title: 'Decimal Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '10.75',
          2: '15.1',
          3: '100.25',
          4: '0.01',
          5: '999.999',
        },
        nUniqueContributors: 5,
        nContributions: 5,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    title: roundDecimalContributionsTitle,
    campaigns: [
      {
        id: 100,
        title: 'Decimal Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {
          1: '10.75',
          2: '15.1',
          3: '100.25',
          4: '0.01',
          5: '999.999',
        },

        nUniqueContributors: 5,
        nContributions: 5,
      },
    ],
  },
};

const roundSmallContributionsTitle = 'Small Contributions Test';
export const mockedQfRoundSmallContributions: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: roundSmallContributionsTitle,
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'Small Contributions Campaign',
          status: 'ACTIVE',
          payments: [
            {
              amount: '0.000001',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '0.000001',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    title: roundSmallContributionsTitle,
    campaigns: [
      {
        id: 100,
        title: 'Small Contributions Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: { 1: '0.000002' },
        nUniqueContributors: 1,
        nContributions: 2,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    title: roundSmallContributionsTitle,
    campaigns: [
      {
        id: 100,
        title: 'Small Contributions Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: { 1: '0.000002' },
        nUniqueContributors: 1,
        nContributions: 2,
      },
    ],
  },
  distribution: {
    totalAllocated: '1000',
    distribution: [
      {
        id: 100,
        title: 'Small Contributions Campaign',
        matchingAmount: '1000',
        nUniqueContributors: 1,
        nContributions: 2,
      },
    ],
  },
};

const roundLargeContributionsTitle = 'Large Contributions Test';
export const mockedQfRoundLargeContributions: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: roundLargeContributionsTitle,
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'Large Contributions Campaign',
          status: 'ACTIVE',
          payments: [
            {
              amount: '1000000.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '500000.5',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 2, address: '0x223' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    title: roundLargeContributionsTitle,
    campaigns: [
      {
        id: 100,
        title: 'Large Contributions Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: { 1: '1000000', 2: '500000.5' },
        nUniqueContributors: 2,
        nContributions: 2,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    title: roundLargeContributionsTitle,
    campaigns: [
      {
        id: 100,
        title: 'Large Contributions Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: { 1: '1000000', 2: '500000.5' },
        nUniqueContributors: 2,
        nContributions: 2,
      },
    ],
  },
  distribution: {
    totalAllocated: '1000',
    distribution: [
      {
        id: 100,
        title: 'Large Contributions Campaign',
        matchingAmount: '1000',
        nUniqueContributors: 2,
        nContributions: 2,
      },
    ],
  },
};

export const mockedQfRoundZeroMatchingPool: MockedQfRound = {
  round: {
    ...mockedQfRoundMultipleCampaigns.round,
    title: 'Zero Matching Pool',
    matchingPool: new Decimal('0'),
    roundCampaigns: [],
  },
  // ApiParameterError is thrown before parsing
};

export const mockedQfRoundZeroMatchingPoolNoCampaigns: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: 'Zero Matching Pool No Campaigns',
    matchingPool: new Decimal('0'),
    roundCampaigns: [],
  },
  // ApiParameterError is thrown before parsing
};

export const mockedQfRoundPendingPayments: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: 'Pending Payments Test',
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'Pending Campaign',
          status: 'ACTIVE',
          payments: [
            {
              amount: '10.0',
              token: USD_TOKEN,
              status: 'pending',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '20.0',
              token: USD_TOKEN,
              status: 'failed',
              user: { id: 2, address: '0x223' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    title: 'Pending Payments Test',
    campaigns: [
      {
        id: 100,
        title: 'Pending Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {},
        nUniqueContributors: 0,
        nContributions: 0,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    title: 'Pending Payments Test',
    campaigns: [
      {
        id: 100,
        title: 'Pending Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: {},
        nUniqueContributors: 0,
        nContributions: 0,
      },
    ],
  },
  distribution: {
    totalAllocated: '0',
    distribution: [
      {
        id: 100,
        title: 'Pending Campaign',
        matchingAmount: '0',
        nUniqueContributors: 0,
        nContributions: 0,
      },
    ],
  },
};

export const mockedQfRoundMixedStatusTitle = 'Mixed Status Test';
export const mockedQfRoundMixedStatus: MockedQfRound = {
  round: {
    ...mockedRoundBase,
    title: mockedQfRoundMixedStatusTitle,
    roundCampaigns: [
      {
        id: 1,
        status: 'APPROVED',
        Campaign: {
          id: 100,
          title: 'Mixed Status Campaign',
          status: 'ACTIVE',
          payments: [
            {
              amount: '10.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 1, address: '0x123' },
            },
            {
              amount: '20.0',
              token: USD_TOKEN,
              status: 'pending',
              user: { id: 2, address: '0x223' },
            },
            {
              amount: '30.0',
              token: USD_TOKEN,
              status: 'confirmed',
              user: { id: 3, address: '0x323' },
            },
            {
              amount: '40.0',
              token: USD_TOKEN,
              status: 'failed',
              user: { id: 4, address: '0x423' },
            },
          ],
        },
      },
    ],
  },
  parsed: {
    ...mockedParsedRoundBase,
    title: mockedQfRoundMixedStatusTitle,
    campaigns: [
      {
        id: 100,
        title: 'Mixed Status Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: { 1: '10', 3: '30' },
        nUniqueContributors: 2,
        nContributions: 2,
      },
    ],
  },
  state: {
    ...mockedStateRoundBase,
    title: mockedQfRoundMixedStatusTitle,
    campaigns: [
      {
        id: 100,
        title: 'Mixed Status Campaign',
        status: 'ACTIVE',
        aggregatedContributionsByUser: { 1: '10', 3: '30' },
        nUniqueContributors: 2,
        nContributions: 2,
      },
    ],
  },
  distribution: {
    distribution: [
      {
        id: 100,
        matchingAmount: '1000',
        nContributions: 2,
        nUniqueContributors: 2,
        title: 'Mixed Status Campaign',
      },
    ],
    totalAllocated: '1000',
  },
};
