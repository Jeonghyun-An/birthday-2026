import Link from 'next/link';
import { script } from '@/config/script';

export default function NotFound() {
  return (
    <main className="page">
      <section className="royal-frame space-y-4 p-6 text-center">
        <h1 className="font-title text-2xl font-bold">{script.notFound.title}</h1>
        <p className="text-ink-soft">{script.notFound.body}</p>
        <Link href="/" className="btn-royal">
          {script.notFound.home}
        </Link>
      </section>
    </main>
  );
}
