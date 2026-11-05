export const LEVELS = ["B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"] as const;

type Tally = Record<string, { correct: number; total: number }>;

// A level counts as shown when the learner answers at least 70 percent of its items
// correctly and has at least 2 items there. The estimate is the highest level in an
// unbroken run from B1 upward.
export function estimateLevel(levels: Tally, itemCount: number) {
  let estimate = "onder B1";
  for (const l of LEVELS) {
    const t = levels[l];
    if (!t) continue;
    if (t.total >= 2 && t.correct / t.total >= 0.7) estimate = l;
    else break;
  }
  const confidence = itemCount >= 40 ? "redelijk" : itemCount >= 20 ? "laag" : "zeer laag";
  return { estimate, confidence };
}
