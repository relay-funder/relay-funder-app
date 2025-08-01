export function formatUSD(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUSDTokenPrice(value: number, tokenPrice: number) {
  return formatUSD(value * tokenPrice);
}
