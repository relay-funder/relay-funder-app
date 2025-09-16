import {
  FILE_STORAGE_PROVIDER,
  NEXT_PUBLIC_PINATA_GATEWAY_URL,
  PINATA_API_JWT_ACCESS_TOKEN,
} from '@/lib/constant';
import { PinataSDK } from 'pinata';
if (
  FILE_STORAGE_PROVIDER === 'PINATA' &&
  (typeof PINATA_API_JWT_ACCESS_TOKEN !== 'string' ||
    typeof NEXT_PUBLIC_PINATA_GATEWAY_URL !== 'string')
) {
  throw new Error(
    'Environment not configured correctly, need PINATA_API_JWT_ACCESS_TOKEN and NEXT_PUBLIC_PINATA_GATEWAY_URL',
  );
}
export const pinata = new PinataSDK({
  pinataJwt: `${PINATA_API_JWT_ACCESS_TOKEN}`,
  pinataGateway: `${NEXT_PUBLIC_PINATA_GATEWAY_URL}`,
});

export async function fileToUrl(file: File): Promise<string> {
  const { cid } = await pinata.upload.public.file(file);
  const url = await pinata.gateways.public.convert(cid);
  return url;
}
