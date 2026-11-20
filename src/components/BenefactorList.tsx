import { script } from '@/config/script';
import type { Contribution } from '@/lib/repo';

const HEART_COLORS = ['text-rose', 'text-gold', 'text-rose-deep'];

export function BenefactorList({ items }: { items: Contribution[] }) {
  if (items.length === 0) return <p className="notice">{script.funding.emptyBenefactors}</p>;

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.id} className="rounded-xl border border-gold-soft bg-white/80 px-4 py-3">
          <p className="font-bold">
            <span aria-hidden="true" className={HEART_COLORS[index % HEART_COLORS.length]}>
              ♥
            </span>{' '}
            {item.name}
          </p>
          {item.message && <p className="mt-1 break-words text-sm text-ink-soft">{item.message}</p>}
        </li>
      ))}
    </ul>
  );
}
