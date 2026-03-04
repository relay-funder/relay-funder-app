import type {
  GetRoundCampaignResponseInstance,
  GetRoundResponseInstance,
} from '@/lib/api/types';
import type {
  ApprovedResultsLike,
  CampaignDistribution,
  ResultReport,
} from '@/lib/qf/result-report';
import { computeResultReportFromCsv, computeResultReportFromJson } from '@/lib/qf/result-report';
import {
  CELO_PREZENTI_SPONSOR,
  ROUND_RESULTS_CAMPAIGN_BINDINGS,
  type RoundResultsPartner,
  type RoundResultsSponsor,
} from '@/lib/constant/round-results-partners';

export interface RoundCategoryItem {
  category: string;
  campaignCount: number;
  percentage: number;
}

export interface RoundPartnerItem {
  id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  campaignCount: number;
  donations: number;
  matchFunding: number;
  totalRaised: number;
}

export interface RoundCampaignResultItem {
  id: number;
  roundCampaignId: number;
  name: string;
  imageUrl: string | null;
  country: string;
  category: string;
  partnerId: string;
  donations: number;
  contributors: number;
  contributions: number;
  matchFunding: number;
  total: number;
  share: number;
}

export interface RoundResultsView {
  totalDonations: number;
  contributorsCount: number;
  campaignsCount: number;
  sponsor: RoundResultsSponsor;
  categories: RoundCategoryItem[];
  partners: RoundPartnerItem[];
  campaigns: RoundCampaignResultItem[];
  grandTotal: number;
}

interface CampaignPartnerBinding {
  normalizedName: string;
  partnerId: string;
  tokens: string[];
  partner?: RoundResultsPartner;
}

interface CampaignPartnerLookup {
  exactByNormalizedName: Map<string, CampaignPartnerBinding>;
  bindings: CampaignPartnerBinding[];
}

function isCeloPrezentiRound(round: GetRoundResponseInstance): boolean {
  const normalizedRoundTitle = normalizeCampaignName(round.title);
  return (
    normalizedRoundTitle.includes('prezenti') &&
    normalizedRoundTitle.includes('celo')
  );
}

function buildRoundSponsor(
  round: GetRoundResponseInstance,
  useStaticBindings: boolean,
): RoundResultsSponsor {
  if (useStaticBindings) {
    return CELO_PREZENTI_SPONSOR;
  }

  const sponsorLogo = round.media?.[0]?.url ?? '';
  const sponsorWebsite =
    typeof round.descriptionUrl === 'string'
      ? toSafeExternalUrl(round.descriptionUrl)
      : '';

  return {
    name: round.title,
    logo: sponsorLogo,
    description: round.description,
    website: sponsorWebsite,
  };
}

function toSafeExternalUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch {
    // fall through
  }

  return '';
}

function parseApprovedResult(
  round: GetRoundResponseInstance,
): ResultReport | null {
  if (!round.approvedResult) {
    return null;
  }

  const matchingPool = Number(round.matchingPool || 0);

  try {
    if (typeof round.approvedResult === 'string') {
      return computeResultReportFromCsv(round.approvedResult, {
        matchingPool,
      });
    }

    if (Array.isArray(round.approvedResult)) {
      return computeResultReportFromJson(
        {
          roundId: round.id,
          campaigns: round.approvedResult,
        },
        {
          matchingPool,
        },
      );
    }

    const approvedResultsLike = round.approvedResult as ApprovedResultsLike;
    if (Array.isArray(approvedResultsLike?.campaigns)) {
      return computeResultReportFromJson(approvedResultsLike, {
        matchingPool,
      });
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeCampaignName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function tokenizeCampaignName(name: string): string[] {
  return Array.from(
    new Set(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((token) => token.length >= 4),
    ),
  );
}

function calculateTokenOverlap(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const rightTokens = new Set(right);
  const matches = left.filter((token) => rightTokens.has(token)).length;
  return matches / Math.max(left.length, right.length);
}

function createBigrams(value: string): string[] {
  if (value.length < 2) {
    return [value];
  }

  const bigrams: string[] = [];
  for (let index = 0; index < value.length - 1; index += 1) {
    bigrams.push(value.slice(index, index + 2));
  }

  return bigrams;
}

function calculateBigramSimilarity(left: string, right: string): number {
  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const leftBigrams = createBigrams(left);
  const rightBigrams = createBigrams(right);
  const rightCounts = new Map<string, number>();

  rightBigrams.forEach((bigram) => {
    rightCounts.set(bigram, (rightCounts.get(bigram) ?? 0) + 1);
  });

  let intersection = 0;
  leftBigrams.forEach((bigram) => {
    const current = rightCounts.get(bigram) ?? 0;
    if (current > 0) {
      intersection += 1;
      rightCounts.set(bigram, current - 1);
    }
  });

  return (2 * intersection) / (leftBigrams.length + rightBigrams.length);
}

function buildCampaignPartnerLookup(): CampaignPartnerLookup {
  const exactByNormalizedName = new Map<string, CampaignPartnerBinding>();
  const bindings: CampaignPartnerBinding[] = ROUND_RESULTS_CAMPAIGN_BINDINGS.map(
    (binding) => {
      const normalizedName = normalizeCampaignName(binding.name);
      const bindingWithMetadata: CampaignPartnerBinding = {
        normalizedName,
        partnerId: binding.partnerId,
        tokens: tokenizeCampaignName(binding.name),
        partner: binding.partner,
      };

      exactByNormalizedName.set(normalizedName, bindingWithMetadata);

      return bindingWithMetadata;
    },
  );

  return {
    exactByNormalizedName,
    bindings,
  };
}

function resolveCampaignPartnerId(
  campaignName: string,
  lookup: CampaignPartnerLookup,
): CampaignPartnerBinding | undefined {
  const normalizedName = normalizeCampaignName(campaignName);
  if (normalizedName.length === 0) {
    return undefined;
  }

  const exactMatch = lookup.exactByNormalizedName.get(normalizedName);
  if (exactMatch) {
    return exactMatch;
  }

  const campaignTokens = tokenizeCampaignName(campaignName);

  let bestCandidate: {
    binding: CampaignPartnerBinding;
    combinedScore: number;
    tokenScore: number;
  } | null = null;

  lookup.bindings.forEach((binding) => {
    const tokenScore = calculateTokenOverlap(campaignTokens, binding.tokens);
    const bigramScore = calculateBigramSimilarity(
      normalizedName,
      binding.normalizedName,
    );
    const combinedScore = bigramScore * 0.75 + tokenScore * 0.25;

    if (!bestCandidate || combinedScore > bestCandidate.combinedScore) {
      bestCandidate = {
        binding,
        combinedScore,
        tokenScore,
      };
    }
  });

  if (!bestCandidate) {
    return undefined;
  }

  const meetsSimilarityThreshold = bestCandidate.combinedScore >= 0.52;
  const meetsTokenThreshold =
    bestCandidate.tokenScore >= 0.2 || campaignTokens.length <= 2;

  if (!meetsSimilarityThreshold || !meetsTokenThreshold) {
    return undefined;
  }

  return bestCandidate.binding;
}

function shouldUseStaticPartnerBindings(
  round: GetRoundResponseInstance,
  lookup: CampaignPartnerLookup,
): boolean {
  if (isCeloPrezentiRound(round)) {
    return true;
  }

  const roundCampaigns = round.roundCampaigns ?? [];
  if (roundCampaigns.length === 0) {
    return false;
  }

  const matchedCampaigns = roundCampaigns.reduce((matchedCount, roundCampaign) => {
    const campaignName = roundCampaign.campaign?.title;
    if (!campaignName) {
      return matchedCount;
    }

    return resolveCampaignPartnerId(campaignName, lookup)
      ? matchedCount + 1
      : matchedCount;
  }, 0);

  if (matchedCampaigns < 2) {
    return false;
  }

  return matchedCampaigns / roundCampaigns.length >= 0.35;
}

function findReportCampaign(
  roundCampaign: GetRoundCampaignResponseInstance,
  campaignsByRoundCampaignId: Map<number, CampaignDistribution>,
  campaignsByCampaignId: Map<number, CampaignDistribution>,
): CampaignDistribution | undefined {
  const roundCampaignMatch = campaignsByRoundCampaignId.get(roundCampaign.id);
  if (roundCampaignMatch) {
    return roundCampaignMatch;
  }

  return campaignsByCampaignId.get(roundCampaign.campaignId);
}

function getCampaignImageUrl(
  roundCampaign: GetRoundCampaignResponseInstance,
): string | null {
  const campaign = roundCampaign.campaign;

  const mediaUrl = campaign?.media?.[0]?.url;
  if (typeof mediaUrl === 'string' && mediaUrl.length > 0) {
    return mediaUrl;
  }

  const mainImage = campaign?.images?.find((image) => image.isMainImage)?.imageUrl;
  if (typeof mainImage === 'string' && mainImage.length > 0) {
    return mainImage;
  }

  const firstImage = campaign?.images?.[0]?.imageUrl;
  if (typeof firstImage === 'string' && firstImage.length > 0) {
    return firstImage;
  }

  return null;
}

function sumConfirmedDonations(roundCampaign: GetRoundCampaignResponseInstance): number {
  const tokenTotals = roundCampaign.campaign?.paymentSummary?.token;
  if (!tokenTotals) {
    return 0;
  }

  return Object.values(tokenTotals).reduce((total, tokenTotal) => {
    return total + Number(tokenTotal?.confirmed || 0);
  }, 0);
}

function toCountry(location: string | null | undefined): string {
  if (!location) {
    return 'Unknown';
  }

  const segments = location.split(',').map((segment) => segment.trim());
  if (segments.length === 0) {
    return 'Unknown';
  }

  return segments[segments.length - 1] || 'Unknown';
}

export function buildRoundResultsView(
  round: GetRoundResponseInstance,
): RoundResultsView {
  const report = parseApprovedResult(round);
  const campaignPartnerLookup = buildCampaignPartnerLookup();
  const useStaticBindings = shouldUseStaticPartnerBindings(
    round,
    campaignPartnerLookup,
  );
  const boundPartnerLookup = new Map<string, RoundResultsPartner>();

  const campaignsByRoundCampaignId = new Map<number, CampaignDistribution>();
  const campaignsByCampaignId = new Map<number, CampaignDistribution>();

  if (report?.campaigns) {
    report.campaigns.forEach((campaign) => {
      if (typeof campaign.roundCampaignId === 'number') {
        campaignsByRoundCampaignId.set(campaign.roundCampaignId, campaign);
      }
      if (typeof campaign.campaignId === 'number') {
        campaignsByCampaignId.set(campaign.campaignId, campaign);
      }
    });
  }

  const campaigns = (round.roundCampaigns ?? []).map((roundCampaign) => {
    const reportCampaign = findReportCampaign(
      roundCampaign,
      campaignsByRoundCampaignId,
      campaignsByCampaignId,
    );

    const donations = reportCampaign
      ? Number(reportCampaign.totalDonations)
      : sumConfirmedDonations(roundCampaign);
    const matchFunding = reportCampaign
      ? Number(reportCampaign.payoutScaled)
      : 0;
    const contributors = reportCampaign
      ? Number(reportCampaign.uniqueContributors)
      : 0;
    const contributions = reportCampaign
      ? Number(reportCampaign.contributionsCount)
      : roundCampaign.campaign?.paymentSummary?.countConfirmed ?? 0;
    const total = donations + matchFunding;
    const category = roundCampaign.campaign?.category || 'Uncategorized';
    const matchedPartnerBinding = useStaticBindings
      ? resolveCampaignPartnerId(roundCampaign.campaign?.title || '', campaignPartnerLookup)
      : undefined;
    if (matchedPartnerBinding?.partner) {
      boundPartnerLookup.set(
        matchedPartnerBinding.partnerId,
        matchedPartnerBinding.partner,
      );
    }
    const partnerId =
      matchedPartnerBinding?.partnerId ?? '';

    return {
      id: roundCampaign.campaignId,
      roundCampaignId: roundCampaign.id,
      name: roundCampaign.campaign?.title || `Campaign #${roundCampaign.campaignId}`,
      imageUrl: getCampaignImageUrl(roundCampaign),
      country: toCountry(roundCampaign.campaign?.location),
      category,
      partnerId,
      donations,
      contributors,
      contributions,
      matchFunding,
      total,
      share: 0,
    } satisfies RoundCampaignResultItem;
  });

  const totalDonations = report
    ? Number(report.totals.totalDonations)
    : campaigns.reduce((total, campaign) => total + campaign.donations, 0);
  const contributorsCount = report
    ? Number(report.totals.uniqueContributors)
    : campaigns.reduce((total, campaign) => total + campaign.contributors, 0);
  const campaignsCount = campaigns.length;
  const grandTotal = campaigns.reduce(
    (total, campaign) => total + campaign.total,
    0,
  );

  const campaignsWithShare = campaigns.map((campaign) => ({
    ...campaign,
    share: grandTotal > 0 ? (campaign.total / grandTotal) * 100 : 0,
  }));

  const categoryMap = new Map<string, number>();
  campaignsWithShare.forEach((campaign) => {
    categoryMap.set(
      campaign.category,
      (categoryMap.get(campaign.category) ?? 0) + 1,
    );
  });

  const categories = Array.from(categoryMap.entries())
    .map(([category, campaignCount]) => ({
      category,
      campaignCount,
      percentage: campaignsCount > 0 ? (campaignCount / campaignsCount) * 100 : 0,
    }))
    .sort((a, b) => b.campaignCount - a.campaignCount);

  const partnerMap = new Map<string, RoundPartnerItem>();
  campaignsWithShare.forEach((campaign) => {
    if (!campaign.partnerId) {
      return;
    }

    const partnerMetadata = boundPartnerLookup.get(campaign.partnerId);
    if (!partnerMetadata) {
      return;
    }

    const existingPartner = partnerMap.get(campaign.partnerId);
    if (existingPartner) {
      existingPartner.campaignCount += 1;
      existingPartner.donations += campaign.donations;
      existingPartner.matchFunding += campaign.matchFunding;
      existingPartner.totalRaised += campaign.total;
      return;
    }

    partnerMap.set(campaign.partnerId, {
      id: campaign.partnerId,
      name: partnerMetadata.name,
      logo: partnerMetadata.logo,
      description: partnerMetadata.description,
      website: partnerMetadata.website,
      campaignCount: 1,
      donations: campaign.donations,
      matchFunding: campaign.matchFunding,
      totalRaised: campaign.total,
    });
  });

  const partners = Array.from(partnerMap.values()).sort(
    (a, b) => b.totalRaised - a.totalRaised,
  );

  return {
    totalDonations,
    contributorsCount,
    campaignsCount,
    sponsor: buildRoundSponsor(round, useStaticBindings),
    categories,
    partners,
    campaigns: campaignsWithShare.sort((a, b) => b.total - a.total),
    grandTotal,
  };
}

export function roundHasEnded(round: GetRoundResponseInstance): boolean {
  if (!round?.endTime) {
    return false;
  }

  return new Date(round.endTime).getTime() < Date.now();
}
