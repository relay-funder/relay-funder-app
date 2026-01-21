// ABOUTME: Auth-related web3 utilities for wallet connection management.
// ABOUTME: Provides adapter-agnostic preload and disconnect functions.

/**
 * Preloads web3 adapter modules in the background.
 * This is adapter-agnostic and will load the correct modules based on
 * which adapter is configured in lib/web3/adapter/index.ts
 */
export async function preloadWeb3Modules(): Promise<void> {
  // The adapter module is already resolved at build time via lib/web3/adapter/index.ts
  // Importing this module triggers loading of all adapter-specific dependencies
  await import('./adapter');
}

/**
 * Disconnects the current wallet using the configured adapter.
 * This function handles the disconnect logic in an adapter-agnostic way.
 */
export async function disconnectWallet(): Promise<void> {
  // Dynamic import to avoid blocking initial load and to use the adapter abstraction
  const { disconnect, wagmiConfig } = await import('./adapter');
  await disconnect(wagmiConfig);
}
