import { describe, expect, it } from 'vitest';
import { tossUrl } from './transfer';

describe('tossUrl', () => {
  it('토스 아이디가 없으면 null', () => {
    expect(tossUrl(null, 15000)).toBeNull();
    expect(tossUrl('', 15000)).toBeNull();
  });

  it('금액이 있으면 금액까지 채운다', () => {
    expect(tossUrl('princess', 15000)).toBe('https://toss.me/princess/15000');
  });

  it('금액이 없으면 아이디까지만', () => {
    expect(tossUrl('princess', null)).toBe('https://toss.me/princess');
  });

  it('한글 아이디는 인코딩한다', () => {
    expect(tossUrl('공주', 5000)).toBe('https://toss.me/%EA%B3%B5%EC%A3%BC/5000');
  });
});
