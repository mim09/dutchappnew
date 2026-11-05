export type SrsState = {
  ease: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
};

// quality: 0 forgot, 1 hard, 2 good, 3 easy
export function review(state: SrsState, quality: 0 | 1 | 2 | 3, now = new Date()) {
  let { ease, interval_days, repetitions, lapses } = state;
  if (quality === 0) {
    lapses += 1;
    repetitions = 0;
    interval_days = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    repetitions += 1;
    if (repetitions === 1) interval_days = quality === 3 ? 3 : 1;
    else if (repetitions === 2) interval_days = quality === 1 ? 3 : 6;
    else {
      const mult = quality === 1 ? 1.2 : quality === 2 ? ease : ease * 1.3;
      interval_days = Math.max(interval_days + 1, Math.round(interval_days * mult));
    }
    ease = Math.max(1.3, ease + (quality === 1 ? -0.15 : quality === 3 ? 0.1 : 0));
  }
  const due = new Date(now.getTime() + interval_days * 86400000);
  const stage =
    quality === 0 ? "forgotten" : repetitions >= 4 ? "retained" : repetitions >= 2 ? "active" : "understood";
  return { ease, interval_days, repetitions, lapses, due_at: due.toISOString(), last_reviewed_at: now.toISOString(), stage };
}
