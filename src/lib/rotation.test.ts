import { describe, expect, it } from 'vitest';
import { nextIndex } from './rotation';

describe('nextIndex', () => {
  it('다음 순번으로 넘어간다', () => {
    expect(nextIndex(0, 6)).toBe(1);
    expect(nextIndex(4, 6)).toBe(5);
  });

  it('마지막 다음은 처음으로 돌아간다', () => {
    expect(nextIndex(5, 6)).toBe(0);
  });

  it('항목이 하나 이하이면 0에 머문다', () => {
    expect(nextIndex(0, 1)).toBe(0);
    expect(nextIndex(3, 0)).toBe(0);
  });
});
