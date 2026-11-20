import { describe, expect, it } from 'vitest';
import { ddayLabel } from './dday';

const BIRTHDAY = '2026-12-31';

describe('ddayLabel', () => {
  it('생일 전이면 D-N', () => {
    // 2026-11-20 12:00 KST
    expect(ddayLabel(BIRTHDAY, new Date('2026-11-20T03:00:00Z'))).toBe('D-41');
  });

  it('한국 시간 자정 직전까지는 하루 전', () => {
    // 2026-12-30 23:59:59 KST
    expect(ddayLabel(BIRTHDAY, new Date('2026-12-30T14:59:59Z'))).toBe('D-1');
  });

  it('한국 시간 자정이 지나면 당일', () => {
    // 2026-12-31 00:00:00 KST
    expect(ddayLabel(BIRTHDAY, new Date('2026-12-30T15:00:00Z'))).toBe('D-DAY');
  });

  it('생일 당일 밤에도 당일', () => {
    // 2026-12-31 23:59:59 KST
    expect(ddayLabel(BIRTHDAY, new Date('2026-12-31T14:59:59Z'))).toBe('D-DAY');
  });

  it('생일이 지나면 D+N', () => {
    // 2027-01-02 00:00 KST
    expect(ddayLabel(BIRTHDAY, new Date('2027-01-01T15:00:00Z'))).toBe('D+2');
  });
});
