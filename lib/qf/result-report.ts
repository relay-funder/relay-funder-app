/**
 * Reusable helpers to compute a detailed results report (JSON or CSV) with per-campaign percentages.
 *
 * Goals:
 * - Compute totals across campaigns (donations, contributors, qf score, suggested match).
 * - Compute each campaign's percentage share of the total suggested matches.
 * - Compute how the payout would be distributed among campaigns given the matching pool:
 *   - If the sum of suggested matches !== matching pool, scale amounts proportionally.
 * - Provide CSV <-> JSON interoperability so this can be used for admin and user-facing reports.
 */

export type Nullable<T> = T | null | undefined;

export interface CampaignResultInput {
  roundCampaignId?: number;
  campaignId?: number;
  campaignTitle?: Nullable<string>;
  recipientAddress?: Nullable<string>;
  onchainRecipientId?: Nullable<string>;

  contributionsCount?: number;
  uniqueContributors?: number;

  totalDonations?: number;
  totalQfScore?: number;
  totalSuggested?: number;
  qfScore?: number;
  suggestedMatch?: number;
}

export interface ApprovedResultsLike {
  roundId?: number;
  generatedAt?: string;
  uploadedAt?: string;
  matchingPool?: number;
  minHumanityScore?: number;
  totals?: {
    totalDonations?: number;
    contributionsCount?: number;
    uniqueContributors?: number;
    totalQfScore?: number;
  };
  campaigns: CampaignResultInput[];
}

export interface CampaignDistribution
  extends Required<
    Pick<
      CampaignResultInput,
      'campaignId' | 'campaignTitle' | 'recipientAddress' | 'onchainRecipientId'
    >
  > {
  roundCampaignId: number | null;

  // Inputs (normalized)
  contributionsCount: number;
  uniqueContributors: number;
  totalDonations: number;
  qfScore: number;
  suggestedMatch: number;

  // Percent of the total suggested amount (0..100)
  suggestedSharePct: number;

  // Scaled distribution with respect to the matching pool (proportional scaling)
  payoutScaled: number;

  // Percent of the matching pool (0..100)
  payoutSharePct: number;
}

export interface ResultReport {
  roundId?: number;
  generatedAt?: string;
  uploadedAt?: string;

  // Matching pool used to scale payouts. If not provided, defaults to totalSuggested (no scaling).
  matchingPool: number;

  totals: {
    totalRecipients: number;
    totalDonations: number;
    contributionsCount: number;
    uniqueContributors: number;
    totalQfScore: number;
    totalSuggested: number;
  };

  // Ratio used to scale suggestedMatch to matchingPool (matchingPool / totalSuggested).
  // When totalSuggested is 0, ratio is 0 (no distribution possible).
  ratio: number;

  // Detailed per-campaign distribution
  campaigns: CampaignDistribution[];
}

export interface BuildReportOptions {
  // If the input doesn't include matchingPool, you can pass a default here.
  // When omitted, we use totalSuggested so there is no scaling by default.
  matchingPool?: number;

  // Number of decimals to round monetary values to (default 2).
  moneyDecimals?: number;

  // Number of decimals to round percentage values to (default 2).
  percentDecimals?: number;
}

const DEFAULT_MONEY_DECIMALS = 2;
const DEFAULT_PERCENT_DECIMALS = 2;

function isFiniteNumber(n: number | undefined | null | string): boolean {
  if (typeof n === 'number' && Number.isFinite(n)) {
    return true;
  }
  if (typeof n === 'string' && Number.isFinite(Number(n))) {
    return true;
  }
  return false;
}

function roundMoney(n: number, decimals = DEFAULT_MONEY_DECIMALS) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function roundPct(n: number, decimals = DEFAULT_PERCENT_DECIMALS) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

/**
 * Compute a results report from a JSON-like payload (ApprovedResultsLike).
 */
export function computeResultReportFromJson(
  input: ApprovedResultsLike,
  opts: BuildReportOptions = {},
): ResultReport {
  const moneyDecimals = opts.moneyDecimals ?? DEFAULT_MONEY_DECIMALS;
  const percentDecimals = opts.percentDecimals ?? DEFAULT_PERCENT_DECIMALS;

  const campaigns = Array.isArray(input?.campaigns) ? input.campaigns : [];

  const totalsFromCampaigns = aggregateCampaignTotals(campaigns);

  const totalSuggested = roundMoney(
    totalsFromCampaigns.totalSuggested ?? 0,
    moneyDecimals,
  );
  const matchingPool = isFiniteNumber(input?.matchingPool)
    ? input.matchingPool!
    : isFiniteNumber(opts.matchingPool)
      ? opts.matchingPool!
      : totalSuggested;

  const ratio = totalSuggested > 0 ? matchingPool / totalSuggested : 0;

  const distributions = campaigns.map((c) =>
    toCampaignDistribution(
      c,
      totalSuggested,
      matchingPool,
      ratio,
      moneyDecimals,
      percentDecimals,
    ),
  );

  const totals = {
    totalRecipients: campaigns.length,
    totalDonations: roundMoney(
      isFiniteNumber(input?.totals?.totalDonations)
        ? input!.totals!.totalDonations!
        : (totalsFromCampaigns.totalDonations ?? 0),
      moneyDecimals,
    ),
    contributionsCount: isFiniteNumber(input?.totals?.contributionsCount)
      ? input!.totals!.contributionsCount!
      : (totalsFromCampaigns.contributionsCount ?? 0),
    uniqueContributors: isFiniteNumber(input?.totals?.uniqueContributors)
      ? input!.totals!.uniqueContributors!
      : (totalsFromCampaigns.uniqueContributors ?? 0),
    totalQfScore: roundMoney(
      isFiniteNumber(input?.totals?.totalQfScore)
        ? input!.totals!.totalQfScore!
        : (totalsFromCampaigns.totalQfScore ?? 0),
      moneyDecimals,
    ),
    totalSuggested,
  };

  return {
    roundId: input?.roundId,
    generatedAt: input?.generatedAt,
    uploadedAt: input?.uploadedAt,
    matchingPool: roundMoney(matchingPool, moneyDecimals),
    ratio: roundPct(ratio, percentDecimals),
    totals,
    campaigns: distributions,
  };
}

/**
 * Compute a results report from a CSV string.
 * - Expects a header row with columns describing campaign metrics.
 * - Unknown columns are ignored; known columns are mapped by case-insensitive and symbol-insensitive names.
 * - If matchingPool is not provided in opts, it defaults to totalSuggested.
 */
export function computeResultReportFromCsv(
  csvText: string,
  opts: BuildReportOptions = {},
): ResultReport {
  const rows = parseCsv(csvText);
  const campaignInputs = rows.map(mapCsvRowToCampaign);
  // Build the report using the same pipeline as JSON
  return computeResultReportFromJson(
    { campaigns: campaignInputs, matchingPool: opts.matchingPool },
    opts,
  );
}

/**
 * Convert a ResultReport to CSV string, with the per-campaign breakdown.
 * Includes percentages and scaled payout amounts.
 */
export function resultReportToCsv(report: ResultReport): string {
  const headers = [
    'roundCampaignId',
    'campaignId',
    'campaignTitle',
    'recipientAddress',
    'onchainRecipientId',
    'contributionsCount',
    'uniqueContributors',
    'totalDonations',
    'qfScore',
    'suggestedMatch',
    'suggestedSharePct',
    'payoutScaled',
    'payoutSharePct',
  ];

  const lines: string[] = [];
  lines.push(headers.join(','));

  for (const c of report.campaigns) {
    const row: Record<string, string | number> = {
      roundCampaignId: asCsvCell(c.roundCampaignId),
      campaignId: asCsvCell(c.campaignId),
      campaignTitle: asCsvCell(c.campaignTitle || ''),
      recipientAddress: asCsvCell(c.recipientAddress || ''),
      onchainRecipientId: asCsvCell(c.onchainRecipientId || ''),
      contributionsCount: asCsvCell(c.contributionsCount),
      uniqueContributors: asCsvCell(c.uniqueContributors),
      totalDonations: asCsvCell(c.totalDonations),
      qfScore: asCsvCell(c.qfScore),
      suggestedMatch: asCsvCell(c.suggestedMatch),
      suggestedSharePct: asCsvCell(c.suggestedSharePct),
      payoutScaled: asCsvCell(c.payoutScaled),
      payoutSharePct: asCsvCell(c.payoutSharePct),
    };
    lines.push(headers.map((h) => stringifyCsvCell(row[h])).join(','));
  }

  // Add a footer with totals and meta as comments (prefixed by #) for human readability
  lines.push(
    [
      '# matchingPool=',
      report.matchingPool,
      ', totalRecipients=',
      report.totals.totalRecipients,
      ', totalSuggested=',
      report.totals.totalSuggested,
      ', ratio=',
      report.ratio,
    ].join(''),
  );

  return lines.join('\n');
}

/**
 * Aggregate totals across campaigns.
 */
function aggregateCampaignTotals(campaigns: CampaignResultInput[]) {
  const totals = campaigns.reduce(
    (acc, c) => {
      const donations = numberOrZero(c.totalDonations);
      const count = numberOrZero(c.contributionsCount);
      const uniq = numberOrZero(c.uniqueContributors);
      const qf = numberOrZero(c.qfScore);
      const suggested = numberOrZero(c.suggestedMatch);
      if (typeof acc.totalDonations === 'number') {
        acc.totalDonations += donations;
      } else {
        acc.totalDonations = donations;
      }
      if (typeof acc.contributionsCount === 'number') {
        acc.contributionsCount += count;
      } else {
        acc.contributionsCount = count;
      }
      if (typeof acc.uniqueContributors === 'number') {
        acc.uniqueContributors += uniq;
      } else {
        acc.uniqueContributors = uniq;
      }
      if (typeof acc.totalQfScore === 'number') {
        acc.totalQfScore += qf;
      } else {
        acc.totalQfScore = qf;
      }
      if (typeof acc.totalSuggested === 'number') {
        acc.totalSuggested += suggested;
      } else {
        acc.totalSuggested = suggested;
      }
      return acc;
    },
    {
      totalDonations: 0,
      contributionsCount: 0,
      uniqueContributors: 0,
      totalQfScore: 0,
      totalSuggested: 0,
    },
  );
  return totals;
}

function numberOrZero(v: number | string | null | undefined): number {
  return isFiniteNumber(v) ? Number(v) : 0;
}

function toCampaignDistribution(
  c: CampaignResultInput,
  totalSuggested: number,
  matchingPool: number,
  ratio: number,
  moneyDecimals: number,
  percentDecimals: number,
): CampaignDistribution {
  const suggestedMatch = roundMoney(
    numberOrZero(c.suggestedMatch),
    moneyDecimals,
  );
  const suggestedSharePct =
    totalSuggested > 0
      ? roundPct((suggestedMatch / totalSuggested) * 100, percentDecimals)
      : 0;

  // Scale payout according to ratio, ensuring totals line up with matchingPool
  const payoutScaled = roundMoney(
    suggestedMatch * (totalSuggested > 0 ? matchingPool / totalSuggested : 0),
    moneyDecimals,
  );
  const payoutSharePct =
    matchingPool > 0
      ? roundPct((payoutScaled / matchingPool) * 100, percentDecimals)
      : 0;

  return {
    roundCampaignId: isFiniteNumber(c.roundCampaignId)
      ? c.roundCampaignId!
      : null,
    campaignId: isFiniteNumber(c.campaignId) ? c.campaignId! : 0,
    campaignTitle: c.campaignTitle ?? null,
    recipientAddress: c.recipientAddress ?? null,
    onchainRecipientId: c.onchainRecipientId ?? null,

    contributionsCount: numberOrZero(c.contributionsCount),
    uniqueContributors: numberOrZero(c.uniqueContributors),
    totalDonations: roundMoney(numberOrZero(c.totalDonations), moneyDecimals),
    qfScore: roundMoney(numberOrZero(c.qfScore), moneyDecimals),

    suggestedMatch,
    suggestedSharePct,
    payoutScaled,
    payoutSharePct,
  };
}

/* =========================
   CSV parsing / serialization
   ========================= */

type CsvRow = Record<string, string>;

/**
 * Parse CSV to a list of rows (simple RFC-4180 compatible parser for common cases).
 * - Supports comma-separated values
 * - Supports quoted cells using "..."
 * - Supports escaping quotes by doubling ("")
 */
function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#')); // ignore empty/comment lines

  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    // Pad/truncate values to header length
    const row: CsvRow = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = values[j] ?? '';
    }
    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line into cells.
 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // End quote
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === ',') {
        cells.push(current);
        current = '';
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        current += ch;
      }
    }
  }
  cells.push(current);
  return cells;
}

function normalizeHeader(h: string): string {
  return (h || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '_');
}

function asCsvCell(v: string | number | null): string | number {
  if (v === null || typeof v === 'undefined') return '';
  return v;
}

function stringifyCsvCell(v: string | number): string {
  if (typeof v === 'number') {
    return String(v);
  }
  // quote only when needed
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

const CSV_FIELD_ALIASES: Partial<Record<string, keyof CampaignResultInput>> = {
  // canonical field -> CSV header variants (normalized)
  round_campaign_id: 'roundCampaignId',
  round_campaignid: 'roundCampaignId',

  campaign_id: 'campaignId',
  campaignid: 'campaignId',
  id: 'campaignId',

  campaign_title: 'campaignTitle',
  title: 'campaignTitle',
  name: 'campaignTitle',

  recipient_address: 'recipientAddress',
  recipient: 'recipientAddress',
  payout_address: 'recipientAddress',

  onchain_recipient_id: 'onchainRecipientId',
  onchain_recipientid: 'onchainRecipientId',
  recipient_id: 'onchainRecipientId',

  contributions_count: 'contributionsCount',
  contributions: 'contributionsCount',

  unique_contributors: 'uniqueContributors',
  unique_donors: 'uniqueContributors',
  donors: 'uniqueContributors',

  total_donations: 'totalDonations',
  donations: 'totalDonations',

  qf_score: 'qfScore',
  qf: 'qfScore',
  score: 'qfScore',

  suggested_match: 'suggestedMatch',
  match: 'suggestedMatch',
  suggested: 'suggestedMatch',
};

const NUMERIC_FIELDS = [
  'roundCampaignId',
  'campaignId',
  'contributionsCount',
  'uniqueContributors',
  'totalDonations',
  'qfScore',
  'totalQfScore',
  'totalSuggested',
  'suggestedMatch',
] as const;
type NumericField = (typeof NUMERIC_FIELDS)[number];
function isNumericField(k: keyof CampaignResultInput): k is NumericField {
  return (NUMERIC_FIELDS as readonly string[]).includes(k as string);
}

function mapCsvRowToCampaign(row: CsvRow): CampaignResultInput {
  const entry: CampaignResultInput = {};
  for (const [rawKey, rawValue] of Object.entries(row)) {
    const keyNorm = normalizeHeader(rawKey);
    const mapped = CSV_FIELD_ALIASES[keyNorm];
    if (!mapped) {
      continue;
    }

    if (isNumericField(mapped)) {
      const n = parseFloat(String(rawValue).replace(/[$, ]/g, ''));
      entry[mapped] = Number.isFinite(n) ? n : 0;
    } else {
      entry[mapped] = String(rawValue);
    }
  }
  return entry;
}
