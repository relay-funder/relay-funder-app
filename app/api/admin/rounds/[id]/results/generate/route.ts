import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/api/auth';
import { generateRoundResults, resultsToCsv } from '@/lib/api/round-results';

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
      return NextResponse.json(
        { error: 'Invalid round id' },
        { status: 400 },
      );
    }
    if (Number.isNaN(minHumanityScore) || minHumanityScore < 0) {
      return NextResponse.json(
        { error: 'Invalid minHumanityScore' },
        { status: 400 },
      );
    }
    if (fmt !== 'json' && fmt !== 'csv') {
      return NextResponse.json(
        { error: 'Invalid format; use json or csv' },
        { status: 400 },
      );
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
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate results';
    return NextResponse.json(
      { error: 'Internal Error', details: message },
      { status: 500 },
    );
  }
}
