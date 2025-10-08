import { headers } from 'next/headers';
import { debugApi as debug } from '../debug';

export const getClientIp = async () => {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    h.get('fastly-client-ip') ||
    h.get('x-cluster-client-ip') ||
    h.get('x-forwarded') ||
    h.get('forwarded-for') ||
    h.get('forwarded') ||
    'unknown';
  debug && ip === 'unknown' && console.debug('[ip] unknown client ip');
  return ip;
};
