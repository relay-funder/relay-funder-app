export function formatUSD(value: number, tokenPrice: number) {
  return `$ ${(value * tokenPrice).toFixed(2)}`;
}
