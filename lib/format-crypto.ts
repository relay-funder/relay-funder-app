export function formatCrypto(value: number, selectedToken: string) {
  // Use 0-1 decimal places for better readability
  const decimals = value % 1 === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${selectedToken}`;
}
