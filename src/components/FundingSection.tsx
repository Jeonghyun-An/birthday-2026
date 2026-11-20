import Image from 'next/image';
import Link from 'next/link';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import { formatWon } from '@/lib/format';
import { getProgress, sumAmounts } from '@/lib/progress';
import type { Contribution } from '@/lib/repo';
import { BenefactorList } from './BenefactorList';
import { HorseProgress } from './HorseProgress';

type Props = {
  contributions: Contribution[] | null;
  dday: string;
};

export function FundingSection({ contributions, dday }: Props) {
  const progress =
    contributions === null ? null : getProgress(sumAmounts(contributions), princess.goalAmount);

  return (
    <section id="funding" className="royal-frame space-y-6 p-6">
      <header className="flex items-center justify-between text-sm">
        <span className="text-ink-soft">{script.funding.birthdayLabel(princess.princessName)}</span>
        <span className="rounded-full bg-rose px-3 py-1 font-bold text-white">{dday}</span>
      </header>

      <div>
        <h1 className="font-title text-2xl font-bold leading-snug">{princess.gift.name}</h1>
        <p className="mt-2 text-ink-soft">“{script.funding.quote}”</p>
      </div>

      <Image
        src={princess.images.gift}
        alt={princess.gift.name}
        width={600}
        height={600}
        className="w-full rounded-2xl border-2 border-gold-soft"
      />
      {princess.gift.link && (
        <a
          href={princess.gift.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-ink-soft underline underline-offset-4"
        >
          {script.funding.giftLink}
        </a>
      )}

      {progress?.complete && (
        <div className="space-y-3 text-center">
          <Image
            src={princess.images.touched}
            alt=""
            width={800}
            height={1000}
            className="mx-auto w-48 rounded-xl"
          />
          <p className="font-title text-lg font-bold text-rose-deep">{script.funding.completeLine}</p>
        </div>
      )}

      {progress ? (
        <div>
          <HorseProgress position={progress.position} />
          <div className="mt-1 flex justify-between text-sm">
            <span>
              {script.funding.progressLabel} <b className="text-rose-deep">{progress.percent}%</b>
            </span>
            <span className="text-ink-soft">
              {script.funding.goalLabel} {formatWon(princess.goalAmount)}
            </span>
          </div>
        </div>
      ) : (
        <p className="notice">{script.errors.listFailed}</p>
      )}

      <Link href="/give" className="btn-royal w-full">
        {script.funding.helpButton}
      </Link>

      {contributions && (
        <div>
          <h2 className="font-title text-lg font-bold">
            {script.funding.benefactorsTitle}{' '}
            <span className="text-rose">{script.funding.benefactorsCount(contributions.length)}</span>
          </h2>
          <div className="mt-3">
            <BenefactorList items={contributions} />
          </div>
        </div>
      )}
    </section>
  );
}
