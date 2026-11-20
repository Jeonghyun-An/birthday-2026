import { script } from '@/config/script';

export const AMOUNT_MIN = 1_000;
export const AMOUNT_MAX = 1_000_000;
export const NAME_MAX = 20;
export const MESSAGE_MAX = 100;

/** 폼에서 그대로 읽은 값. 없는 필드는 빈 문자열. */
export type RawGiveForm = {
  name: string;
  message: string;
  /** 프리셋 금액 문자열('5000' 등) 또는 'custom' */
  amountChoice: string;
  customAmount: string;
  /** 함정 칸. 사람은 비워 둔다. */
  website: string;
};

export type GiveInput = { name: string; message: string | null; amount: number };

export type FieldErrors = Partial<Record<'name' | 'message' | 'amount', string>>;

export type ValidationResult =
  | { kind: 'ok'; value: GiveInput }
  | { kind: 'invalid'; errors: FieldErrors }
  | { kind: 'trap' };

/** Postgres char_length와 같게 코드 포인트 단위로 센다. */
const charCount = (text: string) => [...text].length;

export function parseAmount(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[,\s원]/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isSafeInteger(amount) || amount < AMOUNT_MIN || amount > AMOUNT_MAX) return null;
  return amount;
}

export function validateGive(raw: RawGiveForm): ValidationResult {
  if (raw.website.trim() !== '') return { kind: 'trap' };

  const errors: FieldErrors = {};

  const name = raw.name.trim();
  if (name === '') errors.name = script.errors.nameRequired;
  else if (charCount(name) > NAME_MAX) errors.name = script.errors.nameTooLong;

  const message = raw.message.trim();
  if (charCount(message) > MESSAGE_MAX) errors.message = script.errors.messageTooLong;

  const amount = parseAmount(raw.amountChoice === 'custom' ? raw.customAmount : raw.amountChoice);
  if (amount === null) errors.amount = script.errors.amountInvalid;

  if (amount === null || Object.keys(errors).length > 0) return { kind: 'invalid', errors };
  return { kind: 'ok', value: { name, message: message === '' ? null : message, amount } };
}
