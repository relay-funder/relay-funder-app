/**
 * Add round results generator and CSV conversion helpers
 *
 * This module computes round result aggregates from the database and provides
 * helpers to serialize the result into a CSV file. It filters for valid
 * contributions (by humanity score threshold and confirmed payments) and
 * computes a Quadratic Funding-like suggested match distribution.
 */

import { db } from '@/server/db';

export type ResultsFormat = 'json' | 'csv';

export interface RoundResultCampaignRow {
  roundCampaignId: number;
  campaignId: number;
  campaignTitle: string | null;
  recipientAddress: string | null;
  onchainRecipientId: string | null;
  contributionsCount: number;
  uniqueContributors: number;
  totalDonations: number; // token units (e.g., USDC base units if payment is stored that way)
  qfScore: number;
  suggestedMatch: number; // proportional allocation from matchingPool
}

export interface RoundResults {
  roundId: number;
  generatedAt: string;
  minHumanityScore: number;
  matchingPool: number;
  totals: {
    totalDonations: number;
    contributionsCount: number;
    uniqueContributors: number;
    totalQfScore: number;
  };
  campaigns: RoundResultCampaignRow[];
}

/**
 * Utility to parse stored numeric-like values safely to number.
 */
function parseAmount(amount: string | number | null | undefined): number {
  if (amount == null) return 0;
  if (typeof amount === 'number') return isFinite(amount) ? amount : 0;
  const n = parseFloat(amount);
  return isNaN(n) || !isFinite(n) ? 0 : n;
}

/**
 * Generate round results for a given round:
 * - Filters RoundContribution by humanityScore >= minHumanityScore
 * - Only payments with status === 'confirmed'
 * - Aggregates per RoundCampaign
 * - Computes a QF-like score: (sum sqrt(contributorTotals))^2
 * - Allocates suggestedMatch proportionally to QF score within matchingPool
 */
export async function generateRoundResults(
  roundId: number,
  minHumanityScore = 50,
): Promise<RoundResults> {
  if (!Number.isFinite(roundId) || roundId <= 0) {
    throw new Error('Invalid round id');
  }

  const round = await db.round.findUnique({
    where: { id: roundId },
    include: {
      roundCampaigns: {
        include: {
          Campaign: true,
        },
      },
    },
  });
  if (!round) {
    throw new Error('Round not found');
  }

  // Fetch valid contributions joined to payments
  const contributions = await db.roundContribution.findMany({
    where: {
      roundCampaign: { roundId },
      humanityScore: { gte: minHumanityScore },
      payment: { status: 'confirmed' },
    },
    include: {
      payment: true,
      roundCampaign: {
        include: {
          Campaign: true,
        },
      },
    },
  });

  type PerCampaignAgg = {
    roundCampaignId: number;
    campaignId: number;
    campaignTitle: string | null;
    recipientAddress: string | null;
    onchainRecipientId: string | null;
    contributionsCount: number;
    perContributor: Map<number, number>; // userId -> sum(amount)
    totalDonations: number;
  };

  const byCampaign = new Map<number, PerCampaignAgg>();
  const uniqueContributorsGlobal = new Set<string>();
  let contributionsCountGlobal = 0;
  let totalDonationsGlobal = 0;

  for (const c of contributions) {
    contributionsCountGlobal += 1;

    const rc = c.roundCampaign;
    const key = rc.id;
    if (!byCampaign.has(key)) {
      byCampaign.set(key, {
        roundCampaignId: rc.id,
        campaignId: rc.campaignId,
        campaignTitle: rc.Campaign?.title ?? null,
        recipientAddress: rc.recipientAddress ?? null,
        onchainRecipientId: rc.onchainRecipientId ?? null,
        contributionsCount: 0,
        perContributor: new Map<number, number>(),
        totalDonations: 0,
      });
    }

    const entry = byCampaign.get(key)!;
    entry.contributionsCount += 1;

    // Payment amounts are stored as string in Prisma schema; parse safely
    const amt = parseAmount(c.payment?.amount);
    entry.totalDonations += amt;
    totalDonationsGlobal += amt;

    // Deduplicate by user id on a per-campaign basis
    const userId = c.payment?.userId ?? -1;
    const prev = entry.perContributor.get(userId) ?? 0;
    entry.perContributor.set(userId, prev + amt);

    // Track unique contributor across all campaigns for global stats
    uniqueContributorsGlobal.add(`${key}:${userId}`);
  }

  // Compute QF scores and proportional suggestedMatch
  const campaigns: RoundResultCampaignRow[] = [];
  let totalQfScore = 0;
  for (const entry of byCampaign.values()) {
    let qfSum = 0;
    for (const amt of entry.perContributor.values()) {
      qfSum += Math.sqrt(Math.max(amt, 0));
    }
    const qfScore = Math.pow(qfSum, 2);
    totalQfScore += qfScore;

    campaigns.push({
      roundCampaignId: entry.roundCampaignId,
      campaignId: entry.campaignId,
      campaignTitle: entry.campaignTitle,
      recipientAddress: entry.recipientAddress,
      onchainRecipientId: entry.onchainRecipientId,
      contributionsCount: entry.contributionsCount,
      uniqueContributors: entry.perContributor.size,
      totalDonations: Number(entry.totalDonations.toFixed(2)),
      qfScore: Number(qfScore.toFixed(6)),
      suggestedMatch: 0, // will fill in proportionally below
    });
  }

  const matchingPool = Number(round.matchingPool);
  if (totalQfScore > 0 && matchingPool > 0) {
    for (const row of campaigns) {
      row.suggestedMatch = Number(
        ((row.qfScore / totalQfScore) * matchingPool).toFixed(2),
      );
    }
  }

  return {
    roundId,
    generatedAt: new Date().toISOString(),
    minHumanityScore,
    matchingPool,
    totals: {
      totalDonations: Number(totalDonationsGlobal.toFixed(2)),
      contributionsCount: contributionsCountGlobal,
      uniqueContributors: uniqueContributorsGlobal.size,
      totalQfScore: Number(totalQfScore.toFixed(6)),
    },
    campaigns,
  };
}

/**
 * Convert RoundResults to a CSV string with a stable header.
 */
export function resultsToCsv(data: RoundResults): string {
  const safe = (v: unknown) => {
    if (v == null) return '';
    if (typeof v === 'string') {
      // wrap JSON-escaped strings
      return JSON.stringify(v);
    }
    return String(v);
  };

  const header =
    'roundCampaignId,campaignId,campaignTitle,recipientAddress,onchainRecipientId,contributionsCount,uniqueContributors,totalDonations,qfScore,suggestedMatch';

  const rows = data.campaigns.map((c) =>
    [
      c.roundCampaignId,
      c.campaignId,
      safe(c.campaignTitle),
      safe(c.recipientAddress),
      safe(c.onchainRecipientId),
      c.contributionsCount,
      c.uniqueContributors,
      c.totalDonations,
      c.qfScore,
      c.suggestedMatch,
    ].join(','),
  );

  return [header, ...rows].join('\n');
}
