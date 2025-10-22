import { QfCampaign } from './utils/types';

// Reusable campaigns for precision tests
export const precisionCampaigns: QfCampaign[] = [
  {
    id: 1,
    title: 'Two equal backers (10,10)',
    status: 'ACTIVE',
    aggregatedContributionsByUser: {
      1: '10',
      2: '10',
    },
    nUniqueContributors: 2,
    nContributions: 2,
  },
  {
    id: 2,
    title: 'Single larger backer (25)',
    status: 'ACTIVE',
    aggregatedContributionsByUser: {
      3: '25',
    },
    nUniqueContributors: 1,
    nContributions: 1,
  },
  {
    id: 3,
    title: 'Many tiny backers (1x4)',
    status: 'ACTIVE',
    aggregatedContributionsByUser: {
      4: '1',
      5: '1',
      6: '1',
      7: '1',
    },
    nUniqueContributors: 4,
    nContributions: 4,
  },
  {
    id: 4,
    title: 'Three medium backers (3x3)',
    status: 'ACTIVE',
    aggregatedContributionsByUser: {
      8: '3',
      9: '3',
      10: '3',
    },
    nUniqueContributors: 3,
    nContributions: 3,
  },
  {
    id: 5,
    title: 'Single odd backer (7)',
    status: 'ACTIVE',
    aggregatedContributionsByUser: {
      11: '7',
    },
    nUniqueContributors: 1,
    nContributions: 1,
  },
];

export const precision1Results: Record<string, string> = {
  '1': '348',
  '2': '217.4',
  '3': '139.1',
  '4': '234.7',
  '5': '60.8',
};

export const precision3Results: Record<string, string> = {
  '1': '347.805',
  '2': '217.415',
  '3': '139.145',
  '4': '234.794',
  '5': '60.841',
};

export const precision10Results: Record<string, string> = {
  '1': '347.803066',
  '2': '217.415093',
  '3': '139.145659',
  '4': '234.794525',
  '5': '60.841657',
};
