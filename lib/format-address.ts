export function formatAddress(address: string) {
  if (!address || address.length !== 42) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
