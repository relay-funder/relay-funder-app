import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

export const alt = 'Relay Funder';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const logoData = await readFile(
    join(process.cwd(), 'public', 'relay-funder-logo-white.png'),
  );
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#1d2b3a',
        }}
      >
        <img src={logoBase64} alt="Relay Funder" height={120} />
        <p
          style={{
            color: '#94a3b8',
            fontSize: 28,
            marginTop: 24,
          }}
        >
          Fundraising for refugee communities
        </p>
      </div>
    ),
    { ...size },
  );
}
