/**
 * Infinite scroll configuration
 * Controls when infinite scroll stops and switches to manual "Load more" buttons
 */
export const INFINITE_SCROLL_CONFIG = {
  // Maximum number of pages to auto-load before requiring manual interaction
  MAX_AUTO_PAGES: 3,

  // Default page sizes for different components
  DEFAULT_PAGE_SIZES: {
    CAMPAIGNS: 10,
    ROUNDS: 10,
    USERS: 10,
    COMMENTS: 10,
    PAYMENTS: 10,
  },
} as const;

export type InfiniteScrollConfig = typeof INFINITE_SCROLL_CONFIG;
