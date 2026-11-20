export function tossUrl(tossId: string | null, amount: number | null): string | null {
  if (!tossId) return null;
  const base = `https://toss.me/${encodeURIComponent(tossId)}`;
  return amount === null ? base : `${base}/${amount}`;
}
