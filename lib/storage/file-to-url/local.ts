import { FILE_STORAGE_PROVIDER } from '@/lib/constant';
import { writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

if (
  FILE_STORAGE_PROVIDER === 'LOCAL' &&
  process.env.NODE_ENV !== 'development'
) {
  throw new Error('Local file storage only supported during development');
}

export async function fileToUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const filename = uuidv4() + extname(file.name);
  await writeFile(`./public/uploads/${filename}`, buffer);
  return `/uploads/${filename}`;
}
