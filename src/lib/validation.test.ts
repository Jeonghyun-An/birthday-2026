import { describe, expect, it } from 'vitest';
import { script } from '@/config/script';
import { parseAmount, validateGive, type RawGiveForm } from './validation';

const form = (overrides: Partial<RawGiveForm> = {}): RawGiveForm => ({
  name: '예준',
  message: '',
  amountChoice: '15000',
  customAmount: '',
  website: '',
  ...overrides,
});

describe('parseAmount', () => {
  it('숫자, 쉼표, "원"을 허용한다', () => {
    expect(parseAmount('15000')).toBe(15000);
    expect(parseAmount('1,000')).toBe(1000);
    expect(parseAmount('15000원')).toBe(15000);
    expect(parseAmount(' 20,000 ')).toBe(20000);
  });

  it('범위 경계를 지킨다', () => {
    expect(parseAmount('999')).toBeNull();
    expect(parseAmount('1000')).toBe(1000);
    expect(parseAmount('1000000')).toBe(1000000);
    expect(parseAmount('1000001')).toBeNull();
  });

  it('숫자가 아니면 null', () => {
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('1.5')).toBeNull();
    expect(parseAmount('-1000')).toBeNull();
    expect(parseAmount('')).toBeNull();
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount(undefined)).toBeNull();
  });
});

describe('validateGive', () => {
  it('프리셋 금액이면 통과하고 빈 한마디는 null', () => {
    expect(validateGive(form())).toEqual({
      kind: 'ok',
      value: { name: '예준', message: null, amount: 15000 },
    });
  });

  it('이름과 한마디의 앞뒤 공백을 지운다', () => {
    expect(validateGive(form({ name: '  예준  ', message: '  축하해요  ' }))).toEqual({
      kind: 'ok',
      value: { name: '예준', message: '축하해요', amount: 15000 },
    });
  });

  it('직접 입력을 고르면 customAmount를 쓴다', () => {
    expect(validateGive(form({ amountChoice: 'custom', customAmount: '20,000' }))).toEqual({
      kind: 'ok',
      value: { name: '예준', message: null, amount: 20000 },
    });
  });

  it('이름이 비거나 공백뿐이면 오류', () => {
    expect(validateGive(form({ name: '' }))).toEqual({
      kind: 'invalid',
      errors: { name: script.errors.nameRequired },
    });
    expect(validateGive(form({ name: '   ' }))).toEqual({
      kind: 'invalid',
      errors: { name: script.errors.nameRequired },
    });
  });

  it('이름은 20자까지 (이모지도 한 글자)', () => {
    expect(validateGive(form({ name: '가'.repeat(20) })).kind).toBe('ok');
    expect(validateGive(form({ name: '👑'.repeat(20) })).kind).toBe('ok');
    expect(validateGive(form({ name: '가'.repeat(21) }))).toEqual({
      kind: 'invalid',
      errors: { name: script.errors.nameTooLong },
    });
  });

  it('한마디는 100자까지', () => {
    expect(validateGive(form({ message: '가'.repeat(100) })).kind).toBe('ok');
    expect(validateGive(form({ message: '가'.repeat(101) }))).toEqual({
      kind: 'invalid',
      errors: { message: script.errors.messageTooLong },
    });
  });

  it('금액이 범위 밖이거나 비면 오류', () => {
    const amountError = { kind: 'invalid', errors: { amount: script.errors.amountInvalid } };
    expect(validateGive(form({ amountChoice: 'custom', customAmount: '999' }))).toEqual(amountError);
    expect(validateGive(form({ amountChoice: 'custom', customAmount: '1000001' }))).toEqual(amountError);
    expect(validateGive(form({ amountChoice: 'custom', customAmount: '' }))).toEqual(amountError);
    expect(validateGive(form({ amountChoice: '' }))).toEqual(amountError);
  });

  it('여러 오류를 한 번에 돌려준다', () => {
    expect(validateGive(form({ name: '', amountChoice: '' }))).toEqual({
      kind: 'invalid',
      errors: { name: script.errors.nameRequired, amount: script.errors.amountInvalid },
    });
  });

  it('함정 칸이 채워지면 trap', () => {
    expect(validateGive(form({ website: 'http://spam.example' }))).toEqual({ kind: 'trap' });
  });
});
