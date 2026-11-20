import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { AccountCopy } from '@/components/AccountCopy';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import { formatWon } from '@/lib/format';
import { tossUrl } from '@/lib/transfer';
import { parseAmount } from '@/lib/validation';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function DonePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="page">
      <section className="royal-frame p-6 text-center">
        <Image
          src={princess.images.touched}
          alt=""
          width={800}
          height={1000}
          className="mx-auto w-40 rounded-xl"
        />
        <h1 className="mt-4 font-title text-2xl font-bold">{script.done.title}</h1>
        <Suspense fallback={<TransferInfo amount={null} />}>
          <TransferInfoFromParams searchParams={searchParams} />
        </Suspense>
        <Link href="/?view=funding" className="btn-ghost mt-6">
          {script.done.back}
        </Link>
      </section>
    </main>
  );
}

async function TransferInfoFromParams({ searchParams }: { searchParams: SearchParams }) {
  const { amount } = await searchParams;
  return <TransferInfo amount={parseAmount(typeof amount === 'string' ? amount : null)} />;
}

function TransferInfo({ amount }: { amount: number | null }) {
  const toss = tossUrl(princess.tossId, amount);
  return (
    <div className="mt-4 space-y-4">
      {amount !== null && <p className="text-lg">{script.done.amountLine(formatWon(amount))}</p>}
      <dl className="space-y-1 rounded-xl bg-white/80 p-4 text-left">
        <div className="flex justify-between">
          <dt className="text-ink-soft">{script.done.bankLabel}</dt>
          <dd>{princess.account.bank}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">{script.done.holderLabel}</dt>
          <dd>{princess.account.holder}</dd>
        </div>
      </dl>
      <AccountCopy number={princess.account.number} />
      {toss && (
        <a href={toss} target="_blank" rel="noopener noreferrer" className="btn-royal w-full">
          {script.done.toss}
        </a>
      )}
    </div>
  );
}
