import { describe, expect, it } from 'vitest';
import { getProgress, sumAmounts } from './progress';

describe('sumAmounts', () => {
  it('빈 목록은 0', () => {
    expect(sumAmounts([])).toBe(0);
  });

  it('금액을 모두 더한다', () => {
    expect(sumAmounts([{ amount: 5000 }, { amount: 15000 }])).toBe(20000);
  });
});

describe('getProgress', () => {
  it('아무도 안 보탰으면 0%', () => {
    expect(getProgress(0, 200000)).toEqual({ total: 0, percent: 0, position: 0, complete: false });
  });

  it('퍼센트는 내림해서 목표 직전엔 100%가 되지 않는다', () => {
    expect(getProgress(199999, 200000)).toEqual({
      total: 199999,
      percent: 99,
      position: 99,
      complete: false,
    });
  });

  it('목표와 같으면 100%이고 달성', () => {
    expect(getProgress(200000, 200000)).toEqual({
      total: 200000,
      percent: 100,
      position: 100,
      complete: true,
    });
  });

  it('목표를 넘으면 실제 퍼센트를 보이고 위치는 100에서 멈춘다', () => {
    expect(getProgress(224000, 200000)).toEqual({
      total: 224000,
      percent: 112,
      position: 100,
      complete: true,
    });
  });

  it('목표가 0 이하이면 0%로 방어한다', () => {
    expect(getProgress(5000, 0)).toEqual({ total: 5000, percent: 0, position: 0, complete: false });
  });
});
