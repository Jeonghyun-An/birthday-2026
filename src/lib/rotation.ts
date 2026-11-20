/** 0, 1, …, length-1 다음에 다시 0. 항목이 하나 이하이면 0에 머문다. */
export function nextIndex(current: number, length: number): number {
  if (length <= 1) return 0;
  return (current + 1) % length;
}
