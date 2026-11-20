import { connection } from 'next/server';
import { Suspense } from 'react';
import { FundingSection } from '@/components/FundingSection';
import { HomeFlow, type Stage } from '@/components/HomeFlow';
import { princess } from '@/config/princess';
import { script } from '@/config/script';
import { ddayLabel } from '@/lib/dday';
import type { Contribution } from '@/lib/repo';
import { getRepo } from '@/lib/supabase-repo';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function HomePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="page">
      <Suspense fallback={<p className="notice mt-24">{script.loading}</p>}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function loadContributions(): Promise<Contribution[] | null> {
  try {
    return await getRepo().list();
  } catch (error) {
    console.error('은인 명부 조회 실패', error);
    return null;
  }
}

async function HomeContent({ searchParams }: { searchParams: SearchParams }) {
  const { view } = await searchParams;
  await connection();
  const contributions = await loadContributions();
  const dday = ddayLabel(princess.birthday, new Date());
  const initialStage: Stage = view === 'funding' ? 'funding' : 'cover';

  return (
    <HomeFlow
      key={initialStage}
      initialStage={initialStage}
      funding={<FundingSection contributions={contributions} dday={dday} />}
    />
  );
}
