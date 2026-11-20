import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Contribution, ContributionRepo, NewContribution } from './repo';

export function getRepo(): ContributionRepo {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 없어요');
  }

  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async list(): Promise<Contribution[]> {
      const { data, error } = await db
        .from('contributions')
        .select('id, name, message, amount, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        amount: row.amount,
        createdAt: row.created_at,
      }));
    },

    async add(input: NewContribution): Promise<void> {
      const { error } = await db.from('contributions').insert({
        name: input.name,
        message: input.message,
        amount: input.amount,
      });
      if (error) throw error;
    },
  };
}
