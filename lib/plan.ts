export type Skill =
  | "input" | "listening" | "vocabulary" | "grammar"
  | "speaking" | "reading_writing" | "revision";

export type PlanItem = { skill: Skill; minutes: number; label: string };

const BASE: Record<Skill, number> = {
  input: 20, listening: 15, vocabulary: 10, grammar: 10,
  speaking: 20, reading_writing: 10, revision: 5,
};

const LABELS: Record<Skill, string> = {
  input: "Comprehensible input",
  listening: "Listening",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  speaking: "Speaking",
  reading_writing: "Reading or writing",
  revision: "Revision",
};

// weakness: 0 (strong) to 1 (weak) per skill, derived from recent errors and scores
export function buildDailyPlan(
  totalMinutes: number,
  weakness: Partial<Record<Skill, number>> = {},
  dueVocab = 0
): PlanItem[] {
  // short sessions: drop blocks until every remaining block can hold 5 minutes
  const skills = (Object.keys(BASE) as Skill[]).slice();
  for (const drop of ["reading_writing", "grammar", "input"] as Skill[]) {
    if (skills.length * 5 <= totalMinutes) break;
    skills.splice(skills.indexOf(drop), 1);
  }
  const weights = skills.map((s) => {
    let w = BASE[s] * (1 + (weakness[s] ?? 0) * 0.6);
    if (s === "revision" || s === "vocabulary") w *= 1 + Math.min(dueVocab, 100) / 100;
    return { s, w };
  });
  const sum = weights.reduce((a, b) => a + b.w, 0);
  let items = weights.map(({ s, w }) => ({
    skill: s,
    minutes: Math.max(5, Math.round((w / sum) * totalMinutes / 5) * 5),
    label: LABELS[s],
  }));
  // adjust the largest block until the total matches exactly
  let diff = totalMinutes - items.reduce((a, b) => a + b.minutes, 0);
  while (diff !== 0) {
    const step = diff > 0 ? 5 : -5;
    const target = [...items].sort((a, b) => b.minutes - a.minutes)[0];
    if (target.minutes + step < 5) break;
    target.minutes += step;
    diff -= step;
  }
  return items;
}
