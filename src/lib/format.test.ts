import { describe, expect, it } from 'vitest';
import { formatWon } from './format';

describe('formatWon', () => {
  it('천 단위 쉼표와 "원"을 붙인다', () => {
    expect(formatWon(5000)).toBe('5,000원');
    expect(formatWon(1000000)).toBe('1,000,000원');
  });

  it('0원도 표시한다', () => {
    expect(formatWon(0)).toBe('0원');
  });
});
