import { QfCalculationResult, QfDistributionItem } from '@/lib/qf/types';
import { exportCsv, formatCsvField } from '@/lib/utils/csv';

export interface QfCsvOptions {
  filename?: string;
  includeTotal?: boolean;
}

export function downloadQfDistributionCsv(
  data: QfCalculationResult,
  options: QfCsvOptions = {},
  onError?: (message: string) => void,
): void {
  if (!data || !data.distribution || data.distribution.length === 0) {
    console.warn('[downloadQfDistributionCsv] No distribution data to export');
    onError?.('No distribution data to export');
    return;
  }

  const { filename = 'qf-distribution.csv', includeTotal = true } = options;

  // Create CSV headers
  const headers = [
    'Campaign ID',
    'Campaign Title',
    'Matching Amount',
    'Unique Contributors',
    'Total Contributions',
  ];

  // Create CSV rows
  const rows: string[] = [];

  // Add header row
  rows.push(headers.join(','));

  data.distribution.forEach((item: QfDistributionItem) => {
    const row = [
      item.id,
      formatCsvField(item.title),
      item.matchingAmount,
      item.nUniqueContributors,
      item.nContributions,
    ];

    rows.push(row.join(','));
  });

  // Add total row if requested
  if (includeTotal) {
    const totalRow = ['TOTAL', '', data.totalAllocated];

    rows.push(''); // Empty row separator
    rows.push(totalRow.join(','));
  }

  // Create and download CSV
  const csvString = rows.join('\n');
  exportCsv(csvString, filename);
}
