export function formatCrypto(value: number, selectedToken: string) {
  return `${value.toFixed(6)} ${selectedToken}`;
}
