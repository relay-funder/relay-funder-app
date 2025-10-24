import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { getQfCampaignMatching } from './get-qf-campaign-matching';
import {
  mockedQfRoundMultipleCampaigns,
  mockedQfRoundSingleCampaign,
} from './__mocks__';
import { getRoundForCalculationQuery } from './queries';

vi.mock('./queries', () => ({
  getRoundForCalculationQuery: vi.fn(),
}));

vi.mock('@/lib/debug', () => ({
  debugQf: false,
}));

describe('getQfCampaignMatching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Cases', () => {
    test('should return correct campaign from distribution with multiple campaigns', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundMultipleCampaigns.round,
      );

      const result = await getQfCampaignMatching(1, 2);

      expect(result).toEqual(
        mockedQfRoundMultipleCampaigns.distribution?.distribution[1],
      );
    });

    test('should return correct campaign from distribution with single campaign', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundSingleCampaign.round,
      );

      const result = await getQfCampaignMatching(1, 100);

      expect(result).toEqual(
        mockedQfRoundSingleCampaign.distribution?.distribution[0],
      );
    });
  });

  describe('Error Cases', () => {
    test('should throw ApiNotFoundError when round does not exist', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(null);

      await expect(getQfCampaignMatching(999, 100)).rejects.toThrow(
        ApiNotFoundError,
      );
    });
    test('should throw ApiParameterError when campaign not found', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundMultipleCampaigns.round,
      );

      await expect(getQfCampaignMatching(1, 999)).rejects.toThrow(
        ApiParameterError,
      );
      await expect(getQfCampaignMatching(1, 999)).rejects.toThrow(
        'Campaign matching amount not found',
      );
    });
  });
});
