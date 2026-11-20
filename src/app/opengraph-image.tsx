import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { princess } from '@/config/princess';
import { script } from '@/config/script';

export const alt = princess.coverTitle;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const titleFont = await readFile(join(process.cwd(), 'assets/GowunBatang-Bold.ttf'));

async function loadCover(): Promise<string | null> {
  const path = princess.images.cover;
  if (!/\.(png|jpe?g)$/i.test(path)) return null;
  const data = await readFile(join(process.cwd(), 'public', path));
  const mime = /\.png$/i.test(path) ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${data.toString('base64')}`;
}

export default async function OpengraphImage() {
  const cover = await loadCover();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#ffe4ef',
          fontFamily: 'GowunBatang',
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" width={504} height={630} style={{ objectFit: 'cover' }} />
        ) : null}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            margin: 28,
            padding: 48,
            background: '#fff5f9',
            border: '6px solid #c9972e',
            borderRadius: 32,
          }}
        >
          <div style={{ fontSize: 30, color: '#c9972e' }}>{script.cover.subtitle}</div>
          <div style={{ marginTop: 24, fontSize: cover ? 50 : 62, lineHeight: 1.35, color: '#4a2b33' }}>
            {`《${princess.coverTitle}》`}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'GowunBatang', data: titleFont, style: 'normal', weight: 700 }],
    },
  );
}
