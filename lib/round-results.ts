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

export interface RoundCategoryItem {
  category: string;
  campaignCount: number;
  percentage: number;
}

export interface RoundPartnerItem {
  id: string;
  name: string;
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
  categories: RoundCategoryItem[];
  partners: RoundPartnerItem[];
  campaigns: RoundCampaignResultItem[];
  grandTotal: number;
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

function toShortAddress(address: string): string {
  if (!address || address.length < 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
    const partnerId = roundCampaign.campaign?.creatorAddress || 'unknown';

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
      name: toShortAddress(campaign.partnerId),
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

