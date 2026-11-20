import type { Metadata } from 'next';
import Link from 'next/link';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import { GiveForm } from './GiveForm';

export const metadata: Metadata = {
  title: script.give.title,
};

export default function GivePage() {
  return (
    <main className="page">
      <Link href="/?view=funding" className="back-link">
        ← {script.give.back}
      </Link>
      <section className="royal-frame mt-4 p-6">
        <p className="eyebrow">{princess.gift.name}</p>
        <h1 className="mt-1 font-title text-2xl font-bold">{script.give.title}</h1>
        <div className="mt-6">
          <GiveForm />
        </div>
      </section>
    </main>
  );
}
