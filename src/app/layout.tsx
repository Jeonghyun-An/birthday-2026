import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Gowun_Batang, Gowun_Dodum } from 'next/font/google';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import './globals.css';

const titleFont = Gowun_Batang({
  weight: ['400', '700'],
  variable: '--font-gowun-batang',
  preload: false,
  display: 'swap',
});

const bodyFont = Gowun_Dodum({
  weight: '400',
  variable: '--font-gowun-dodum',
  preload: false,
  display: 'swap',
});

function siteUrl(): URL {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(host ? `https://${host}` : 'http://localhost:3000');
}

const title = `《${princess.coverTitle}》`;

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title,
  description: script.funding.quote,
  openGraph: {
    title,
    description: script.funding.quote,
    type: 'website',
    locale: 'ko_KR',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffe4ef',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${titleFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
