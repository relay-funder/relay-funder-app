import type {
  GetRoundCampaignResponseInstance,
  GetRoundResponseInstance,
} from '@/lib/api/types';
import type {
  ApprovedResultsLike,
  CampaignResultInput,
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
  donations: number;
  matchFunding: number;
  totalRaised: number;
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
  partnerId: string;
  partner?: RoundResultsPartner;
}

interface CampaignPartnerLookup {
  exactByNormalizedName: Map<string, CampaignPartnerBinding>;
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
      const normalizedCampaigns = normalizeApprovedCampaigns(round.approvedResult);
      return computeResultReportFromJson(
        {
          roundId: round.id,
          campaigns: normalizedCampaigns,
        },
        {
          matchingPool,
        },
      );
    }

    const approvedResultsLike = round.approvedResult as ApprovedResultsLike;
    if (Array.isArray(approvedResultsLike?.campaigns)) {
      const normalizedCampaigns = normalizeApprovedCampaigns(
        approvedResultsLike.campaigns as unknown[],
      );
      return computeResultReportFromJson(
        {
          ...approvedResultsLike,
          campaigns: normalizedCampaigns,
        },
        {
          matchingPool,
        },
      );
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeCampaignName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$, ]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toStringOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getFirstValue(
  source: Record<string, unknown>,
  keys: string[],
): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }
  return undefined;
}

function normalizeApprovedCampaignEntry(
  input: unknown,
): CampaignResultInput | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const record = input as Record<string, unknown>;
  const roundCampaignId = toNumberOrUndefined(
    getFirstValue(record, ['roundCampaignId', 'round_campaign_id']),
  );
  const campaignId = toNumberOrUndefined(
    getFirstValue(record, ['campaignId', 'campaign_id', 'id']),
  );
  const campaignTitle = toStringOrUndefined(
    getFirstValue(record, ['campaignTitle', 'campaign_title', 'title', 'name']),
  );
  const recipientAddress = toStringOrUndefined(
    getFirstValue(record, ['recipientAddress', 'recipient_address', 'recipient']),
  );
  const onchainRecipientId = toStringOrUndefined(
    getFirstValue(record, [
      'onchainRecipientId',
      'onchain_recipient_id',
      'recipientId',
      'recipient_id',
    ]),
  );
  const contributionsCount = toNumberOrUndefined(
    getFirstValue(record, [
      'contributionsCount',
      'contributions_count',
      'contributions',
    ]),
  );
  const uniqueContributors = toNumberOrUndefined(
    getFirstValue(record, [
      'uniqueContributors',
      'unique_contributors',
      'contributors',
      'uniqueDonors',
      'donors',
    ]),
  );
  const totalDonations = toNumberOrUndefined(
    getFirstValue(record, [
      'totalDonations',
      'total_donations',
      'donations',
      'totalRaised',
      'amountRaised',
    ]),
  );
  const qfScore = toNumberOrUndefined(
    getFirstValue(record, ['qfScore', 'qf_score', 'score']),
  );
  const suggestedMatch = toNumberOrUndefined(
    getFirstValue(record, [
      'suggestedMatch',
      'suggested_match',
      'match',
      'matchingAmount',
      'matching_amount',
      'matchFunding',
      'payoutScaled',
      'payout_scaled',
    ]),
  );

  return {
    roundCampaignId,
    campaignId,
    campaignTitle,
    recipientAddress,
    onchainRecipientId,
    contributionsCount,
    uniqueContributors,
    totalDonations,
    qfScore,
    suggestedMatch,
  };
}

function normalizeApprovedCampaigns(campaigns: unknown[]): CampaignResultInput[] {
  return campaigns
    .map((campaign) => normalizeApprovedCampaignEntry(campaign))
    .filter((campaign): campaign is CampaignResultInput => campaign !== null);
}

function buildCampaignPartnerLookup(): CampaignPartnerLookup {
  const exactByNormalizedName = new Map<string, CampaignPartnerBinding>();
  ROUND_RESULTS_CAMPAIGN_BINDINGS.forEach((binding) => {
    const normalizedName = normalizeCampaignName(binding.name);
    exactByNormalizedName.set(normalizedName, {
      partnerId: binding.partnerId,
      partner: binding.partner,
    });
  });

  return {
    exactByNormalizedName,
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

  return lookup.exactByNormalizedName.get(normalizedName);
}

function shouldUseStaticPartnerBindings(round: GetRoundResponseInstance): boolean {
  return isCeloPrezentiRound(round);
}

function findReportCampaign(
  roundCampaign: GetRoundCampaignResponseInstance,
  campaignsByRoundCampaignId: Map<number, CampaignDistribution>,
  campaignsByCampaignId: Map<number, CampaignDistribution>,
  campaignsByNormalizedTitle: Map<string, CampaignDistribution>,
): CampaignDistribution | undefined {
  const roundCampaignMatch = campaignsByRoundCampaignId.get(roundCampaign.id);
  if (roundCampaignMatch) {
    return roundCampaignMatch;
  }

  const campaignIdMatch = campaignsByCampaignId.get(roundCampaign.campaignId);
  if (campaignIdMatch) {
    return campaignIdMatch;
  }

  const campaignTitle = roundCampaign.campaign?.title;
  if (!campaignTitle) {
    return undefined;
  }

  return campaignsByNormalizedTitle.get(normalizeCampaignName(campaignTitle));
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

function sumUniqueConfirmedContributors(
  roundCampaign: GetRoundCampaignResponseInstance,
): number {
  const payments = roundCampaign.campaign?.payments;
  if (!Array.isArray(payments) || payments.length === 0) {
    return 0;
  }

  const uniqueContributors = new Set<string>();
  payments.forEach((payment) => {
    const paymentStatus =
      typeof payment.status === 'string' ? payment.status.toUpperCase() : '';
    if (paymentStatus !== 'CONFIRMED') {
      return;
    }

    if (typeof payment.userId === 'number') {
      uniqueContributors.add(`id:${payment.userId}`);
      return;
    }

    const userAddress = payment.user?.address;
    if (typeof userAddress === 'string' && userAddress.length > 0) {
      uniqueContributors.add(`address:${userAddress.toLowerCase()}`);
    }
  });

  return uniqueContributors.size;
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
  const useStaticBindings = shouldUseStaticPartnerBindings(round);
  const boundPartnerLookup = new Map<string, RoundResultsPartner>();

  const campaignsByRoundCampaignId = new Map<number, CampaignDistribution>();
  const campaignsByCampaignId = new Map<number, CampaignDistribution>();
  const campaignsByNormalizedTitle = new Map<string, CampaignDistribution>();

  if (report?.campaigns) {
    report.campaigns.forEach((campaign) => {
      if (typeof campaign.roundCampaignId === 'number') {
        campaignsByRoundCampaignId.set(campaign.roundCampaignId, campaign);
      }
      if (typeof campaign.campaignId === 'number') {
        campaignsByCampaignId.set(campaign.campaignId, campaign);
      }
      if (
        typeof campaign.campaignTitle === 'string' &&
        campaign.campaignTitle.length > 0
      ) {
        const normalizedTitle = normalizeCampaignName(campaign.campaignTitle);
        if (normalizedTitle.length > 0) {
          campaignsByNormalizedTitle.set(normalizedTitle, campaign);
        }
      }
    });
  }

  const campaigns = (round.roundCampaigns ?? []).map((roundCampaign) => {
    const reportCampaign = findReportCampaign(
      roundCampaign,
      campaignsByRoundCampaignId,
      campaignsByCampaignId,
      campaignsByNormalizedTitle,
    );

    const fallbackDonations = sumConfirmedDonations(roundCampaign);
    const donationsFromReport = reportCampaign
      ? Number(reportCampaign.totalDonations)
      : NaN;
    const donations =
      Number.isFinite(donationsFromReport) && donationsFromReport > 0
        ? donationsFromReport
        : fallbackDonations;
    const matchFunding = reportCampaign
      ? Number(reportCampaign.payoutScaled)
      : 0;
    const fallbackContributors = sumUniqueConfirmedContributors(roundCampaign);
    const contributions = reportCampaign
      ? Number(reportCampaign.contributionsCount)
      : roundCampaign.campaign?.paymentSummary?.countConfirmed ?? 0;
    const contributors = reportCampaign
      ? Number(reportCampaign.uniqueContributors)
      : fallbackContributors > 0
        ? fallbackContributors
        : contributions;
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
  const contributorsFromReport = report
    ? Number(report.totals.uniqueContributors)
    : 0;
  const contributorsCount =
    contributorsFromReport > 0
      ? contributorsFromReport
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

  const categoryMap = new Map<
    string,
    {
      campaignCount: number;
      donations: number;
      matchFunding: number;
      totalRaised: number;
    }
  >();
  campaignsWithShare.forEach((campaign) => {
    const existingCategory = categoryMap.get(campaign.category) ?? {
      campaignCount: 0,
      donations: 0,
      matchFunding: 0,
      totalRaised: 0,
    };

    existingCategory.campaignCount += 1;
    existingCategory.donations += campaign.donations;
    existingCategory.matchFunding += campaign.matchFunding;
    existingCategory.totalRaised += campaign.total;

    categoryMap.set(campaign.category, existingCategory);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([category, aggregate]) => ({
      category,
      campaignCount: aggregate.campaignCount,
      percentage:
        campaignsCount > 0
          ? (aggregate.campaignCount / campaignsCount) * 100
          : 0,
      donations: aggregate.donations,
      matchFunding: aggregate.matchFunding,
      totalRaised: aggregate.totalRaised,
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
