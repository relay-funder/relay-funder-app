/**
 * Normalize an address
 *
 * The application uses addresses for joins and identifying users.
 * To prevent wallets from interfering with our implementation, instead of using
 * the case-sensitive address returned from some wallets, we always lowercase
 * an address. This allows users to switch wallets and simplifies our assumptions
 * (an address in our system is always lowercase). There will be no collision of addresses
 * due to case-sensitivity.
 * Nevertheless, sometimes we need the rawAddress with its case sensitivity for certain
 * operations, so it is stored and used when needed.
 */
export function normalizeAddress(
  rawAddress: string | null | undefined,
): `0x${string}` | null {
  if (typeof rawAddress !== 'string') {
    return null;
  }
  if (!rawAddress.startsWith('0x')) {
    return null;
  }
  return rawAddress.toLowerCase() as `0x${string}`;
}
