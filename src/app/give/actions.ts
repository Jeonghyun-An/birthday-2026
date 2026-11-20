'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getRepo } from '@/lib/supabase-repo';
import { handleSubmit, rawFromFormData, type GiveFormState } from './submit';

export async function submitContribution(
  _previous: GiveFormState,
  formData: FormData,
): Promise<GiveFormState> {
  const outcome = await handleSubmit(rawFromFormData(formData), getRepo);
  if (outcome.kind === 'error') return outcome.state;
  revalidatePath('/');
  redirect(outcome.to);
}
