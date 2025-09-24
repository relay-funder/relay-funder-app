import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { InputJsonValue } from '@/.generated/prisma/client/runtime/library';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { handleError, response } from '@/lib/api/response';

type ParamType = { params: Promise<{ id: string }> };

// Minimal CSV parser that supports quoted fields with commas and double-quotes within quotes ("")
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
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
          // End of quoted field
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === ',') {
        out.push(current);
        current = '';
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        current += ch;
      }
    }
  }
  out.push(current);
  return out;
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]);
  const idx = (k: string) => header.indexOf(k);

  const required = [
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
  ];
  for (const key of required) {
    if (idx(key) === -1) {
      throw new Error(`CSV header missing required column: ${key}`);
    }
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);

    const get = (k: string) => cols[idx(k)] ?? '';
    const num = (k: string) => {
      const v = parseFloat(get(k));
      return isNaN(v) ? 0 : v;
    };

    rows.push({
      roundCampaignId: Number(get('roundCampaignId')),
      campaignId: Number(get('campaignId')),
      campaignTitle: get('campaignTitle') || null,
      recipientAddress: get('recipientAddress') || null,
      onchainRecipientId: get('onchainRecipientId') || null,
      contributionsCount: Number(get('contributionsCount')),
      uniqueContributors: Number(get('uniqueContributors')),
      totalDonations: num('totalDonations'),
      qfScore: num('qfScore'),
      suggestedMatch: num('suggestedMatch'),
    });
  }
  return rows;
}

export async function GET(_req: Request, { params }: ParamType) {
  try {
    // Admins only
    await checkAuth(['admin']);

    const { id } = await params;
    const roundId = parseInt(id, 10);
    if (!Number.isFinite(roundId) || roundId <= 0) {
      throw new ApiParameterError('Invalid round id');
    }

    const round = await db.round.findUnique({ where: { id: roundId } });
    if (!round) {
      throw new ApiNotFoundError('Round not found');
    }

    return response({ approvedResult: round.approvedResult ?? null });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function POST(req: Request, { params }: ParamType) {
  try {
    // Admins only
    await checkAuth(['admin']);

    const { id } = await params;
    const roundId = parseInt(id, 10);
    if (!Number.isFinite(roundId) || roundId <= 0) {
      throw new ApiParameterError('Invalid round id');
    }

    const round = await db.round.findUnique({ where: { id: roundId } });
    if (!round) {
      throw new ApiNotFoundError('Round not found');
    }

    const contentType = req.headers.get('content-type') ?? '';

    let approvedResult: InputJsonValue | null = null;

    if (contentType.includes('application/json')) {
      // Direct JSON upload
      const json = await req.json();
      approvedResult = json;
    } else if (contentType.includes('multipart/form-data')) {
      // File upload via FormData
      const form = await req.formData();
      const file = form.get('file') as File | null;
      if (!file) {
        throw new ApiParameterError('File is required');
      }
      const text = await file.text();
      if (
        file.type === 'application/json' ||
        file.name.toLowerCase().endsWith('.json')
      ) {
        approvedResult = JSON.parse(text);
      } else {
        // Assume CSV
        const campaigns = parseCsv(text);
        approvedResult = {
          roundId,
          uploadedAt: new Date().toISOString(),
          campaigns,
        };
      }
    } else if (contentType.includes('text/csv')) {
      // Raw CSV body
      const text = await req.text();
      const campaigns = parseCsv(text);
      approvedResult = {
        roundId,
        uploadedAt: new Date().toISOString(),
        campaigns,
      };
    } else {
      throw new ApiParameterError('Unsupported content type');
    }
    if (!Array.isArray(approvedResult)) {
      throw new ApiParameterError('Unsupported content');
    }

    await db.round.update({
      where: { id: roundId },
      data: { approvedResult: approvedResult ?? [] },
    });

    return response({ ok: true, roundId });
  } catch (error: unknown) {
    return handleError(error);
  }
}
