export function formatUSD(value: number | bigint) {
  const numValue = typeof value === 'bigint' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

export function formatUSDTokenPrice(value: number, tokenPrice: number) {
  return formatUSD(value * tokenPrice);
}
