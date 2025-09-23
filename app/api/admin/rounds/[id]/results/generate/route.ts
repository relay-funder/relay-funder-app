import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/api/auth';
import { generateRoundResults, resultsToCsv } from '@/lib/api/round-results';
import { handleError } from '@/lib/api/response';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';

type ResultsFormat = 'json' | 'csv';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Ensure only admins can generate results
    await checkAuth(['admin']);

    const { searchParams } = new URL(req.url);
    const fmt = ((searchParams.get('fmt') ?? 'json').toLowerCase() ||
      'json') as ResultsFormat;
    const minHumanityScore = parseInt(
      searchParams.get('minHumanityScore') ?? '50',
      10,
    );

    const idParam = await params;
    const roundId = parseInt(idParam.id, 10);
    if (Number.isNaN(roundId) || roundId <= 0) {
      throw new ApiNotFoundError('Invalid round id');
    }
    if (Number.isNaN(minHumanityScore) || minHumanityScore < 0) {
      throw new ApiParameterError('Invalid minHumanityScore');
    }
    if (fmt !== 'json' && fmt !== 'csv') {
      throw new ApiParameterError('Invalid format; use json or csv');
    }

    const results = await generateRoundResults(roundId, minHumanityScore);

    if (fmt === 'csv') {
      const csv = resultsToCsv(results);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="round-${roundId}-results.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // default JSON
    return NextResponse.json(results, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
