export type Progress = {
  total: number;
  /** 표시용 실제 퍼센트(내림). 100을 넘을 수 있다. */
  percent: number;
  /** 백마 위치용 0~100 */
  position: number;
  complete: boolean;
};

export function sumAmounts(items: ReadonlyArray<{ amount: number }>): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function getProgress(total: number, goal: number): Progress {
  if (goal <= 0) return { total, percent: 0, position: 0, complete: false };
  const percent = Math.floor((total / goal) * 100);
  return {
    total,
    percent,
    position: Math.min(Math.max(percent, 0), 100),
    complete: total >= goal,
  };
}
