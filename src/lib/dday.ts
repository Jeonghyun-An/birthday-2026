const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** birthday는 한국 날짜 YYYY-MM-DD. now의 한국 날짜와 비교한다. */
export function ddayLabel(birthday: string, now: Date): string {
  const [year, month, day] = birthday.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const today = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const diff = Math.round((target - today) / DAY_MS);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return 'D-DAY';
  return `D+${-diff}`;
}
