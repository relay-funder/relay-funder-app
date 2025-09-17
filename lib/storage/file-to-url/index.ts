import { FILE_STORAGE_PROVIDER } from '@/lib/constant';
import { fileToUrl as localFileToUrl } from './local';
import { fileToUrl as pinataFileToUrl } from './pinata';

export async function fileToUrl(file: File): Promise<string> {
  if (FILE_STORAGE_PROVIDER === 'PINATA') {
    return pinataFileToUrl(file);
  }
  if (FILE_STORAGE_PROVIDER === 'LOCAL') {
    return localFileToUrl(file);
  }
  throw new Error(
    `Bad FILE_STORAGE_PROVIDER (${FILE_STORAGE_PROVIDER}) configured. Supported: 'PINATA', 'LOCAL'`,
  );
}
