'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { script } from '@/config/script';

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page">
      <section className="royal-frame space-y-4 p-6 text-center">
        <h1 className="font-title text-2xl font-bold">{script.errorPage.title}</h1>
        <p className="text-ink-soft">{script.errorPage.body}</p>
        <button type="button" onClick={() => retry()} className="btn-royal w-full">
          {script.errorPage.retry}
        </button>
        <Link href="/?view=funding" className="btn-ghost">
          {script.errorPage.home}
        </Link>
      </section>
    </main>
  );
}
