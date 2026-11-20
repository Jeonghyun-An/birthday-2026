import { script } from '@/config/script';
import type { ContributionRepo } from '@/lib/repo';
import { validateGive, type FieldErrors, type RawGiveForm } from '@/lib/validation';

export type GiveFormState =
  | { status: 'idle' }
  | { status: 'error'; errors: FieldErrors; formError: string | null; values: RawGiveForm };

export type SubmitOutcome =
  | { kind: 'redirect'; to: string }
  | { kind: 'error'; state: GiveFormState };

export const initialGiveFormState: GiveFormState = { status: 'idle' };

export function rawFromFormData(formData: FormData): RawGiveForm {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
  };
  return {
    name: text('name'),
    message: text('message'),
    amountChoice: text('amountChoice'),
    customAmount: text('customAmount'),
    website: text('website'),
  };
}

export async function handleSubmit(
  raw: RawGiveForm,
  getRepo: () => ContributionRepo,
): Promise<SubmitOutcome> {
  const result = validateGive(raw);

  if (result.kind === 'trap') return { kind: 'redirect', to: '/give/done' };

  if (result.kind === 'invalid') {
    return {
      kind: 'error',
      state: { status: 'error', errors: result.errors, formError: null, values: raw },
    };
  }

  try {
    await getRepo().add(result.value);
  } catch (error) {
    console.error('보태기 저장 실패', error);
    return {
      kind: 'error',
      state: { status: 'error', errors: {}, formError: script.errors.saveFailed, values: raw },
    };
  }

  return { kind: 'redirect', to: `/give/done?amount=${result.value.amount}` };
}
