/**
 * Grouped feature flags for dynamic rendering in admin UI.
 *
 * - Add or remove flags within the group arrays below.
 * - Create new groups by adding a new object to USER_FLAG_GROUPS.
 *
 * USER_FLAGS is derived from USER_FLAG_GROUPS so consumers that only need
 * a flat list can continue to import USER_FLAGS without caring about grouping.
 */

export type UserFlagGroup = {
  key: string;
  label: string;
  items: readonly string[];
};

export const USER_FLAG_GROUPS: readonly UserFlagGroup[] = [
  {
    key: 'admin',
    label: 'Admin',
    items: [
      'ROUND_MANAGER',
      'CAMPAIGN_APPROVER',
      'CAMPAIGN_MODERATOR',
      'USER_MODERATOR',
      'CONTENT_MODERATOR',
      'SUPPORT',
    ],
  },
  {
    key: 'creator',
    label: 'Creator',
    items: ['CREATOR_PROXY'],
  },
  {
    key: 'user',
    label: 'User',
    items: ['SERVER_GAS', 'BYPASS_HUMANITY_SCORE'],
  },
] as const;

/**
 * Flat, de-duplicated list of all known flags, derived from USER_FLAG_GROUPS.
 */
export const USER_FLAGS: readonly string[] = Array.from(
  new Set(USER_FLAG_GROUPS.flatMap((g) => g.items)),
);
