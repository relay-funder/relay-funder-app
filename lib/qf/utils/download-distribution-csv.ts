import { QfCalculationResult, QfDistributionItem } from '@/lib/qf/types';
import { formatUnits, parseUnits } from 'viem';
import { USD_DECIMALS } from '@/lib/constant';
import { triggerCsvDownloadOnClient, formatCsvField } from '@/lib/utils/csv';

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
    'Donations',
    'Total (Donations + Matching)',
    'Unique Contributors',
    'Total Contributions',
  ];

  // Create CSV rows
  const rows: string[] = [];

  // Add header row
  rows.push(headers.join(','));

  data.distribution.forEach((item: QfDistributionItem) => {
    const matchingAmount = parseUnits(item.matchingAmount, USD_DECIMALS);
    const donations = parseUnits(item.totalDonations, USD_DECIMALS);
    const total = matchingAmount + donations;
    const row = [
      item.id,
      formatCsvField(item.title),
      item.matchingAmount,
      item.totalDonations,
      formatUnits(total, USD_DECIMALS),
      item.nUniqueContributors,
      item.nContributions,
    ];

    rows.push(row.join(','));
  });

  // Add total row if requested
  if (includeTotal) {
    const totalAllocated = parseUnits(data.totalAllocated, USD_DECIMALS);
    const totalDonations = parseUnits(data.totalDonations, USD_DECIMALS);
    const totalCombined = totalAllocated + totalDonations;
    const totalRow = [
      'TOTAL',
      '',
      data.totalAllocated,
      data.totalDonations,
      formatUnits(totalCombined, USD_DECIMALS),
      '',
      '',
    ];

    rows.push(''); // Empty row separator
    rows.push(totalRow.join(','));
  }

  // Create and download CSV
  const csvString = rows.join('\n');
  triggerCsvDownloadOnClient(csvString, filename);
}
