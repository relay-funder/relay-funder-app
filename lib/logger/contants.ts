import { IS_PRODUCTION } from '@/lib/constant';

export const isProduction = IS_PRODUCTION;
const debugAddressesEnv = process.env.NEXT_PUBLIC_VERBOSE_USERS;
export const debugAddressesSet = new Set(
  debugAddressesEnv
    ?.split(',')
    .map((addr) => addr.trim().toLowerCase())
    .filter((addr) => addr !== ''),
);

const debugFlagsEnv = process.env.NEXT_PUBLIC_DEBUG_FLAGS;
export const debugFlagsSet = new Set(
  debugFlagsEnv
    ?.split(',')
    .map((flag) => flag.trim().toLowerCase())
    .filter((flag) => flag !== ''),
);
