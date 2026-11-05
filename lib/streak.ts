export function currentStreak(dates: string[], today = new Date()): number {
  const set = new Set(dates);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const d = new Date(today);
  if (!set.has(fmt(d))) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (set.has(fmt(d))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}
